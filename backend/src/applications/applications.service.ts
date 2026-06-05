import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { MatchEngine } from '../jobs/match-engine';
import { VectorUtils } from '../jobs/vector-utils';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('İlan bulunamadı.');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { cvUrl: true },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    const cvUrl = dto.cvUrl ?? user.cvUrl ?? null;

    try {
      const application = await this.prisma.application.create({
        data: {
          userId,
          jobId: dto.jobId,
          cvUrl,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Update Behavioral Embedding in background (Weight: 3.0 for Apply)
      VectorUtils.trackInteraction(this.prisma, userId, dto.jobId, 3.0).catch(err => {
        console.error('Behavioral embedding error during apply:', err);
      });

      return application;
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Bu ilana zaten başvurdunuz.');
      }
      throw e;
    }
  }

  async withdraw(userId: string, jobId: string) {
    const app = await this.prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (!app) throw new NotFoundException('Başvuru bulunamadı.');
    
    await this.prisma.application.delete({
      where: { id: app.id },
    });
    return { success: true };
  }

  async findMine(userId: string, q: PaginationQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.application.count({ where: { userId } }),
      this.prisma.application.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          job: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  sector: true,
                },
              },
              jobSkills: {
                include: { skill: true },
                take: 5,
              },
            },
          },
        },
      }),
    ]);

    return { items: rows, total, page, limit };
  }

  async status(userId: string, jobId: string) {
    const row = await this.prisma.application.findUnique({
      where: {
        userId_jobId: { userId, jobId },
      },
      select: { id: true },
    });
    return { applied: !!row };
  }

  async findApplicantsForJob(employerId: string, jobId: string, q: PaginationQueryDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        jobSkills: { include: { skill: true } }
      }
    });

    if (!job) throw new NotFoundException('İlan bulunamadı.');
    if (job.company.ownerId !== employerId) throw new ForbiddenException('Bu işlem için yetkiniz yok.');

    const page = q.page ?? 1;
    const limit = q.limit ?? 50; // Get more for scoring
    const skip = (page - 1) * limit;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.application.count({ where: { jobId } }),
      this.prisma.application.findMany({
        where: { jobId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            include: {
              profile: true,
              experience: true,
              education: true,
              projects: true,
              certifications: true,
              userSkills: { include: { skill: true } },
              preferences: true,
            }
          }
        }
      })
    ]);

    const items = rows.map(app => {
      const matchResult = MatchEngine.calculateFullMatch(app.user, job);
      return {
        id: app.id,
        status: app.status,
        createdAt: app.createdAt,
        user: {
          id: app.user.id,
          name: app.user.name,
          email: app.user.email,
          avatarUrl: app.user.avatarUrl,
          profile: app.user.profile,
        },
        matchScore: matchResult.overallScore,
      };
    });

    // Sıralama varsayılan olarak puana göre yapılsın.
    items.sort((a, b) => b.matchScore - a.matchScore);

    return { items, total, page, limit };
  }

  async findApplicantProfile(employerId: string, applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { company: true, jobSkills: { include: { skill: true } } }
        },
        user: {
          include: {
            profile: true,
            experience: { orderBy: { startDate: 'desc' } },
            education: { orderBy: { startDate: 'desc' } },
            projects: { orderBy: { startDate: 'desc' } },
            certifications: true,
            languages: true,
            userSkills: { include: { skill: true } },
            preferences: true,
          }
        }
      }
    });

    if (!app) throw new NotFoundException('Başvuru bulunamadı.');
    if (app.job.company.ownerId !== employerId) throw new ForbiddenException('Yetkiniz yok.');

    const matchResult = MatchEngine.calculateFullMatch(app.user, app.job);

    return {
      application: {
        id: app.id,
        status: app.status,
        createdAt: app.createdAt,
        cvUrl: app.cvUrl,
      },
      candidate: app.user,
      matchReport: matchResult,
    };
  }

  async updateStatus(employerId: string, applicationId: string, status: ApplicationStatus) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { include: { company: true } } }
    });

    if (!app) throw new NotFoundException('Başvuru bulunamadı.');
    if (app.job.company.ownerId !== employerId) throw new ForbiddenException('Yetkiniz yok.');

    const updatedApp = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    // Update the SuccessScore (Confidence Modifier) based on employer's decision
    if (status === ApplicationStatus.accepted || status === ApplicationStatus.rejected) {
      const scoreChange = status === ApplicationStatus.accepted ? 1.0 : -0.5; // Reward is higher than penalty
      try {
        await this.prisma.$executeRaw`
          UPDATE "user_profiles" 
          SET "success_score" = "success_score" + ${scoreChange}
          WHERE "user_id" = ${app.userId}
        `;
      } catch (e) {
        console.error('Failed to update success_score', e);
      }
    }

    return updatedApp;
  }
}
