import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, cvUrl: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    return user;
  }

  async updateUser(id: string, data: { name?: string; cvUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, cvUrl: true, createdAt: true },
    });
  }
}

