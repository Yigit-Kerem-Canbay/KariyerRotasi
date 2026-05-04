import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../applications/dto/pagination-query.dto';

@Injectable()
export class SavedJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async save(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İlan bulunamadı.');

    await this.prisma.savedJob.upsert({
      where: { userId_jobId: { userId, jobId } },
      create: { userId, jobId },
      update: {},
    });

    return { saved: true };
  }

  async remove(userId: string, jobId: string) {
    await this.prisma.savedJob.deleteMany({ where: { userId, jobId } });
    return { saved: false };
  }

  async findMine(userId: string, q: PaginationQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.savedJob.count({ where: { userId } }),
      this.prisma.savedJob.findMany({
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

  async isSaved(userId: string, jobId: string) {
    const row = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
      select: { jobId: true },
    });
    return { saved: !!row };
  }
}
