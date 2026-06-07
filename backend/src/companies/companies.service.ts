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

  async getMyCompany(userId: string) {
    const company = await this.prisma.company.findFirst({
      where: { ownerId: userId },
    });
    return company;
  }

  async updateMyCompany(userId: string, data: any) {
    let company = await this.prisma.company.findFirst({
      where: { ownerId: userId },
    });

    if (!company) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
      
      company = await this.prisma.company.create({
        data: {
          name: data.name || user.name,
          ownerId: userId,
          isVerified: true,
          ...data,
        },
      });
      return company;
    }

    return this.prisma.company.update({
      where: { id: company.id },
      data,
    });
  }
}
