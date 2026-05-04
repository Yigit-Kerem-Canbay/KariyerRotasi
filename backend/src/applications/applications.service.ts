import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

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
      return await this.prisma.application.create({
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
            select: {
              id: true,
              title: true,
              location: true,
              salaryMin: true,
              salaryMax: true,
              company: { select: { id: true, name: true } },
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
}
