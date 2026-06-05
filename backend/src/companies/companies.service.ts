import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        location: true,
        employeeCount: true,
        sector: true,
        logoUrl: true,
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        location: true,
        employeeCount: true,
        sector: true,
        logoUrl: true,
        _count: { select: { jobs: true } },
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async findTop(limit = 6) {
    return this.prisma.company.findMany({
      where: { website: { not: null } },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        location: true,
        employeeCount: true,
        sector: true,
        logoUrl: true,
        _count: { select: { jobs: true } },
      },
      orderBy: { jobs: { _count: 'desc' } },
      take: limit,
    });
  }
}
