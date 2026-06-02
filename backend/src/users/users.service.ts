import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
const FormData = require('form-data');

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, name: true, email: true, role: true, cvUrl: true, avatarUrl: true, createdAt: true,
        profile: true,
        education: { orderBy: { startDate: 'desc' } },
        experience: { orderBy: { startDate: 'desc' } },
        languages: true,
        preferences: true,
        userSkills: { include: { skill: true } },
      },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    return user;
  }

  async updateUser(id: string, data: { name?: string; cvUrl?: string | null }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, cvUrl: true, avatarUrl: true, createdAt: true },
    });
  }

  async upsertProfile(userId: string, data: any) {
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async addEducation(userId: string, data: any) {
    return this.prisma.userEducation.create({
      data: { userId, ...data },
    });
  }

  async deleteEducation(userId: string, educationId: string) {
    return this.prisma.userEducation.delete({
      where: { id: educationId, userId },
    });
  }

  async addExperience(userId: string, data: any) {
    return this.prisma.userExperience.create({
      data: { userId, ...data },
    });
  }

  async deleteExperience(userId: string, experienceId: string) {
    return this.prisma.userExperience.delete({
      where: { id: experienceId, userId },
    });
  }

  async addLanguage(userId: string, data: any) {
    return this.prisma.userLanguage.create({
      data: { userId, ...data },
    });
  }

  async deleteLanguage(userId: string, languageId: string) {
    return this.prisma.userLanguage.delete({
      where: { id: languageId, userId },
    });
  }

  async addSkill(userId: string, skillName: string) {
    const skill = await this.prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName },
    });
    
    // Check if the user already has this skill
    const existing = await this.prisma.userSkill.findFirst({
      where: { userId, skillId: skill.id }
    });
    
    if (existing) return existing;
    
    return this.prisma.userSkill.create({
      data: { userId, skillId: skill.id, level: 3 },
    });
  }

  async upsertPreferences(userId: string, data: any) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Profil fotoğrafı 5MB boyutundan büyük olamaz.');
    }
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create random filename to avoid caching issues on update
    const ext = path.extname(file.originalname);
    const fileName = `${userId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    
    const avatarUrl = `/uploads/avatars/${fileName}`;
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: avatarUrl },
    });
    
    return this.getPublicUserById(userId);
  }

  async parseAndSaveCV(userId: string, file: Express.Multer.File) {
    try {
      // 1. Save file locally
      const uploadDir = path.join(process.cwd(), 'uploads', 'cvs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Multer usually interprets utf8 names as latin1. We decode it to preserve Turkish characters.
      const originalNameUtf8 = Buffer.from(file.originalname, 'latin1').toString('utf8');
      
      // Remove any dangerous path traversal characters but keep the exact name otherwise
      const safeOriginalName = originalNameUtf8.replace(/[\/\\]/g, '_');
      const fileName = `${userId}-${Date.now()}-${safeOriginalName}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);
      
      const cvUrl = `/uploads/cvs/${fileName}`;
      await this.updateUser(userId, { cvUrl });

      // 2. Send to AI Service
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiResponse = await axios.post(`${aiServiceUrl}/parse-cv`, formData, {
        headers: formData.getHeaders(),
      });

      const parsedData = aiResponse.data.data;

      // 3. Upsert Profile data
      if (parsedData.about) {
        await this.upsertProfile(userId, { about: parsedData.about });
      }

      // 4. Upsert Education
      if (parsedData.education && Array.isArray(parsedData.education)) {
        for (const edu of parsedData.education) {
          await this.addEducation(userId, {
            school: edu.school || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            startDate: new Date(edu.startDate || '2000-01-01'),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            isContinuing: edu.isContinuing || false,
          });
        }
      }

      // 5. Upsert Experience
      if (parsedData.experience && Array.isArray(parsedData.experience)) {
        for (const exp of parsedData.experience) {
          await this.addExperience(userId, {
            company: exp.company || '',
            title: exp.title || '',
            location: exp.location,
            startDate: new Date(exp.startDate || '2000-01-01'),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            isContinuing: exp.isContinuing || false,
            description: exp.description,
          });
        }
      }

      // 6. Upsert Languages
      if (parsedData.languages && Array.isArray(parsedData.languages)) {
        for (const lang of parsedData.languages) {
          await this.addLanguage(userId, {
            language: lang.language || '',
            level: lang.level || '',
          });
        }
      }
      
      // Update skills in profile if any
      if (parsedData.skills && Array.isArray(parsedData.skills)) {
        for (const skillName of parsedData.skills) {
          if (typeof skillName !== 'string') continue;
          await this.addSkill(userId, skillName);
        }
      }

      // Return the updated user info
      return this.getPublicUserById(userId);

    } catch (error) {
      console.error('CV Parse Error:', error?.response?.data || error.message);
      throw new InternalServerErrorException('CV işlenirken bir hata oluştu.');
    }
  }

  async deleteCV(userId: string) {
    // We could delete the physical file here if needed, but simply resetting the URL is enough for now
    return this.updateUser(userId, { cvUrl: null });
  }
}
