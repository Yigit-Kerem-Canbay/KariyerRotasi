import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
const FormData = require('form-data');

// ============================================================
// HELPER: Turkish-aware normalization for deduplication
// ============================================================
function normalizeForComparison(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function isSimilar(a: string, b: string): boolean {
  const na = normalizeForComparison(a);
  const nb = normalizeForComparison(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // Check if one contains the other (for partial matches)
  if (na.length > 3 && nb.length > 3) {
    if (na.includes(nb) || nb.includes(na)) return true;
  }
  return false;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // READ: Get full user profile
  // ============================================================
  async getPublicUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cvUrl: true,
        avatarUrl: true,
        createdAt: true,
        profile: true,
        education: {
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
        },
        experience: {
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
        },
        projects: {
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
        },
        certifications: {
          where: { deletedAt: null },
          orderBy: { issueDate: 'desc' },
        },
        languages: {
          where: { deletedAt: null },
        },
        preferences: true,
        userSkills: {
          where: { deletedAt: null },
          include: { skill: true },
        },
        cvVersions: {
          orderBy: { uploadDate: 'desc' },
          take: 5,
        },
      },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    return {
      ...user,
      profileCompletionScore: this.calculateCompletionScore(user),
    };
  }

  // ============================================================
  // PROFILE COMPLETION SCORE
  // ============================================================
  private calculateCompletionScore(user: any): {
    score: number;
    sections: Record<string, boolean>;
    suggestions: string[];
  } {
    const sections: Record<string, boolean> = {
      about: !!user.profile?.about,
      education: user.education?.length > 0,
      experience: user.experience?.length > 0,
      projects: user.projects?.length > 0,
      certifications: user.certifications?.length > 0,
      skills: user.userSkills?.length > 0,
      languages: user.languages?.length > 0,
      preferences: !!user.preferences,
      avatar: !!user.avatarUrl,
      title: !!user.profile?.title,
    };

    const suggestions: string[] = [];
    if (!sections.about)
      suggestions.push('Kendinizi tanıtan bir "Hakkımda" yazısı ekleyin.');
    if (!sections.education) suggestions.push('Eğitim bilgilerinizi ekleyin.');
    if (!sections.experience) suggestions.push('İş deneyimlerinizi ekleyin.');
    if (!sections.projects) suggestions.push('Projelerinizi ekleyin.');
    if (!sections.certifications)
      suggestions.push('Sertifikalarınızı ekleyin.');
    if (!sections.skills) suggestions.push('Yeteneklerinizi ekleyin.');
    if (!sections.languages)
      suggestions.push('Yabancı dil bilgilerinizi ekleyin.');
    if (!sections.preferences) suggestions.push('İş tercihlerinizi belirtin.');
    if (!sections.avatar) suggestions.push('Profil fotoğrafı ekleyin.');
    if (!sections.title) suggestions.push('Mesleki unvanınızı ekleyin.');

    const filled = Object.values(sections).filter(Boolean).length;
    const score = Math.round((filled / Object.keys(sections).length) * 100);

    return { score, sections, suggestions };
  }

  // ============================================================
  // AUDIT LOG
  // ============================================================
  private async logAudit(
    userId: string,
    action: string,
    entityType: string,
    entityId?: string,
    oldData?: any,
    newData?: any,
    metadata?: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : undefined,
          newData: newData ? JSON.parse(JSON.stringify(newData)) : undefined,
          metadata: metadata
            ? JSON.parse(JSON.stringify(metadata))
            : undefined,
        },
      });
    } catch (err) {
      console.error('Audit log error:', err);
    }
  }

  // ============================================================
  // UPDATE USER (name, cvUrl)
  // ============================================================
  async updateUser(id: string, data: { name?: string; cvUrl?: string | null }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cvUrl: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  // ============================================================
  // PROFILE CRUD
  // ============================================================
  async upsertProfile(userId: string, data: any) {
    const existing = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    const result = await this.prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    await this.logAudit(
      userId,
      existing ? 'UPDATE' : 'CREATE',
      'PROFILE',
      result.id,
      existing,
      data,
    );

    return result;
  }

  // ============================================================
  // EDUCATION CRUD
  // ============================================================
  async addEducation(userId: string, data: any, source: 'CV' | 'MANUAL' = 'MANUAL', sourceId?: string) {
    const result = await this.prisma.userEducation.create({
      data: {
        userId,
        ...data,
        sourceType: source,
        sourceId,
        lastUpdatedBy: source,
        lastUpdatedAt: new Date(),
      },
    });
    await this.logAudit(userId, 'CREATE', 'EDUCATION', result.id, null, data);
    return result;
  }

  async updateEducation(userId: string, id: string, data: any) {
    const existing = await this.prisma.userEducation.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Eğitim kaydı bulunamadı.');

    const result = await this.prisma.userEducation.update({
      where: { id },
      data: { ...data, lastUpdatedBy: 'MANUAL', lastUpdatedAt: new Date() },
    });
    await this.logAudit(userId, 'UPDATE', 'EDUCATION', id, existing, data);
    return result;
  }

  async deleteEducation(userId: string, id: string) {
    const existing = await this.prisma.userEducation.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Eğitim kaydı bulunamadı.');

    // Soft delete
    await this.prisma.userEducation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.logAudit(userId, 'DELETE', 'EDUCATION', id, existing, null);
  }

  // ============================================================
  // EXPERIENCE CRUD
  // ============================================================
  async addExperience(userId: string, data: any, source: 'CV' | 'MANUAL' = 'MANUAL', sourceId?: string) {
    const result = await this.prisma.userExperience.create({
      data: {
        userId,
        ...data,
        sourceType: source,
        sourceId,
        lastUpdatedBy: source,
        lastUpdatedAt: new Date(),
      },
    });
    await this.logAudit(userId, 'CREATE', 'EXPERIENCE', result.id, null, data);
    return result;
  }

  async updateExperience(userId: string, id: string, data: any) {
    const existing = await this.prisma.userExperience.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Deneyim kaydı bulunamadı.');

    const result = await this.prisma.userExperience.update({
      where: { id },
      data: { ...data, lastUpdatedBy: 'MANUAL', lastUpdatedAt: new Date() },
    });
    await this.logAudit(userId, 'UPDATE', 'EXPERIENCE', id, existing, data);
    return result;
  }

  async deleteExperience(userId: string, id: string) {
    const existing = await this.prisma.userExperience.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Deneyim kaydı bulunamadı.');

    await this.prisma.userExperience.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.logAudit(userId, 'DELETE', 'EXPERIENCE', id, existing, null);
  }

  // ============================================================
  // PROJECT CRUD
  // ============================================================
  async addProject(userId: string, data: any, source: 'CV' | 'MANUAL' = 'MANUAL', sourceId?: string) {
    const result = await this.prisma.userProject.create({
      data: {
        userId,
        ...data,
        sourceType: source,
        sourceId,
        lastUpdatedBy: source,
        lastUpdatedAt: new Date(),
      },
    });
    await this.logAudit(userId, 'CREATE', 'PROJECT', result.id, null, data);
    return result;
  }

  async updateProject(userId: string, id: string, data: any) {
    const existing = await this.prisma.userProject.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Proje bulunamadı.');

    const result = await this.prisma.userProject.update({
      where: { id },
      data: { ...data, lastUpdatedBy: 'MANUAL', lastUpdatedAt: new Date() },
    });
    await this.logAudit(userId, 'UPDATE', 'PROJECT', id, existing, data);
    return result;
  }

  async deleteProject(userId: string, id: string) {
    const existing = await this.prisma.userProject.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Proje bulunamadı.');

    await this.prisma.userProject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.logAudit(userId, 'DELETE', 'PROJECT', id, existing, null);
  }

  // ============================================================
  // CERTIFICATION CRUD
  // ============================================================
  async addCertification(userId: string, data: any, source: 'CV' | 'MANUAL' = 'MANUAL', sourceId?: string) {
    const result = await this.prisma.userCertification.create({
      data: {
        userId,
        ...data,
        sourceType: source,
        sourceId,
        lastUpdatedBy: source,
        lastUpdatedAt: new Date(),
      },
    });
    await this.logAudit(userId, 'CREATE', 'CERTIFICATION', result.id, null, data);
    return result;
  }

  async updateCertification(userId: string, id: string, data: any) {
    const existing = await this.prisma.userCertification.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Sertifika bulunamadı.');

    const result = await this.prisma.userCertification.update({
      where: { id },
      data: { ...data, lastUpdatedBy: 'MANUAL', lastUpdatedAt: new Date() },
    });
    await this.logAudit(userId, 'UPDATE', 'CERTIFICATION', id, existing, data);
    return result;
  }

  async deleteCertification(userId: string, id: string) {
    const existing = await this.prisma.userCertification.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Sertifika bulunamadı.');

    await this.prisma.userCertification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.logAudit(userId, 'DELETE', 'CERTIFICATION', id, existing, null);
  }

  // ============================================================
  // LANGUAGE CRUD
  // ============================================================
  async addLanguage(userId: string, data: any, source: 'CV' | 'MANUAL' = 'MANUAL', sourceId?: string) {
    const result = await this.prisma.userLanguage.create({
      data: {
        userId,
        ...data,
        sourceType: source,
        sourceId,
        lastUpdatedBy: source,
        lastUpdatedAt: new Date(),
      },
    });
    await this.logAudit(userId, 'CREATE', 'LANGUAGE', result.id, null, data);
    return result;
  }

  async updateLanguage(userId: string, id: string, data: any) {
    const existing = await this.prisma.userLanguage.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Dil kaydı bulunamadı.');

    const result = await this.prisma.userLanguage.update({
      where: { id },
      data: { ...data, lastUpdatedBy: 'MANUAL', lastUpdatedAt: new Date() },
    });
    await this.logAudit(userId, 'UPDATE', 'LANGUAGE', id, existing, data);
    return result;
  }

  async deleteLanguage(userId: string, id: string) {
    const existing = await this.prisma.userLanguage.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Dil kaydı bulunamadı.');

    await this.prisma.userLanguage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.logAudit(userId, 'DELETE', 'LANGUAGE', id, existing, null);
  }

  // ============================================================
  // SKILL CRUD
  // ============================================================
  async addSkill(userId: string, skillName: string, source: 'CV' | 'MANUAL' = 'MANUAL', sourceId?: string, confidence?: number) {
    const skill = await this.prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName },
    });

    // Check if the user already has this skill (including soft-deleted)
    const existing = await this.prisma.userSkill.findFirst({
      where: { userId, skillId: skill.id },
    });

    if (existing) {
      // If soft-deleted, restore it
      if (existing.deletedAt) {
        return this.prisma.userSkill.update({
          where: { userId_skillId: { userId, skillId: skill.id } },
          data: {
            deletedAt: null,
            lastUpdatedBy: source,
            lastUpdatedAt: new Date(),
          },
        });
      }
      return existing;
    }

    const result = await this.prisma.userSkill.create({
      data: {
        userId,
        skillId: skill.id,
        level: 3,
        sourceType: source,
        sourceId,
        lastUpdatedBy: source,
        lastUpdatedAt: new Date(),
        confidence,
      },
    });
    await this.logAudit(userId, 'CREATE', 'SKILL', skill.id, null, {
      skillName,
    });
    return result;
  }

  async deleteSkill(userId: string, skillId: string) {
    const existing = await this.prisma.userSkill.findFirst({
      where: { userId, skillId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Yetenek bulunamadı.');

    await this.prisma.userSkill.update({
      where: { userId_skillId: { userId, skillId } },
      data: { deletedAt: new Date() },
    });
    await this.logAudit(userId, 'DELETE', 'SKILL', skillId, existing, null);
  }

  // ============================================================
  // PREFERENCES CRUD
  // ============================================================
  async upsertPreferences(userId: string, data: any) {
    const existing = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    const result = await this.prisma.userPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    await this.logAudit(
      userId,
      existing ? 'UPDATE' : 'CREATE',
      'PREFERENCE',
      result.id,
      existing,
      data,
    );
    return result;
  }

  // ============================================================
  // AVATAR UPLOAD
  // ============================================================
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        'Profil fotoğrafı 5MB boyutundan büyük olamaz.',
      );
    }
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${userId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const avatarUrl = `/uploads/avatars/${fileName}`;
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    await this.logAudit(userId, 'UPDATE', 'PROFILE', undefined, undefined, { avatarUrl });

    return this.getPublicUserById(userId);
  }

  async deleteAvatar(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });
    await this.logAudit(userId, 'UPDATE', 'PROFILE', undefined, undefined, { avatarUrl: null });
  }



  // ============================================================
  // CV UPLOAD → PARSE → MERGE PREVIEW
  // ============================================================
  async parseAndSaveCV(userId: string, file: Express.Multer.File) {
    try {
      // 1. Save file with safe ASCII-only name
      const uploadDir = path.join(process.cwd(), 'uploads', 'cvs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${userId}-${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      const cvUrl = `/uploads/cvs/${fileName}`;

      // 2. Determine CV version
      const latestCv = await this.prisma.userCV.findFirst({
        where: { userId },
        orderBy: { version: 'desc' },
      });
      const nextVersion = (latestCv?.version || 0) + 1;

      // 3. Mark previous CVs as inactive
      await this.prisma.userCV.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      // 4. Create CV version record
      const cvRecord = await this.prisma.userCV.create({
        data: {
          userId,
          version: nextVersion,
          fileName,
          filePath: cvUrl,
          fileSize: file.size,
          processingStatus: 'PARSING',
          isActive: true,
        },
      });

      // 5. Update user's current cvUrl
      await this.updateUser(userId, { cvUrl });

      // 6. Send to AI Service
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: fileName,
        contentType: file.mimetype,
      });

      const aiServiceUrl =
        process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiResponse = await axios.post(
        `${aiServiceUrl}/parse-cv`,
        formData,
        { headers: formData.getHeaders() },
      );

      const parsedData = aiResponse.data.data;

      // 7. Store parsed data on CV record
      await this.prisma.userCV.update({
        where: { id: cvRecord.id },
        data: {
          parsedData: parsedData,
          parsedAt: new Date(),
          processingStatus: 'PARSED',
        },
      });

      // 8. Generate merge preview
      const mergePreview = await this.generateMergePreview(
        userId,
        parsedData,
        cvRecord.id,
      );

      // 9. Store merge preview
      await this.prisma.userCV.update({
        where: { id: cvRecord.id },
        data: {
          mergePreview: mergePreview as any,
          processingStatus: 'MERGE_PENDING',
        },
      });

      await this.logAudit(userId, 'CV_UPLOAD', 'CV', cvRecord.id, null, {
        version: nextVersion,
        fileName,
      });

      return {
        cvId: cvRecord.id,
        mergePreview,
        user: await this.getPublicUserById(userId),
      };
    } catch (error) {
      console.error(
        'CV Parse Error:',
        error?.response?.data || error.message,
      );
      
      // Update the CV record status to FAILED but don't fail the whole request
      const latestCv = await this.prisma.userCV.findFirst({
        where: { userId, processingStatus: 'PARSING' },
        orderBy: { version: 'desc' },
      });
      if (latestCv) {
        await this.prisma.userCV.update({
          where: { id: latestCv.id },
          data: { processingStatus: 'FAILED' },
        });
      }

      return {
        cvId: latestCv?.id,
        aiFailed: true,
        user: await this.getPublicUserById(userId),
      };
    }
  }

  // ============================================================
  // MERGE PREVIEW GENERATOR
  // ============================================================
  private async generateMergePreview(
    userId: string,
    parsedData: any,
    cvId: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        education: { where: { deletedAt: null } },
        experience: { where: { deletedAt: null } },
        projects: { where: { deletedAt: null } },
        certifications: { where: { deletedAt: null } },
        languages: { where: { deletedAt: null } },
        userSkills: { where: { deletedAt: null }, include: { skill: true } },
      },
    });

    if (!existingUser) throw new NotFoundException('Kullanıcı bulunamadı.');

    const preview: any = {
      about: null,
      education: { new: [], updated: [], ignored: [] },
      experience: { new: [], updated: [], ignored: [] },
      projects: { new: [], updated: [], ignored: [] },
      certifications: { new: [], updated: [], ignored: [] },
      skills: { new: [], ignored: [] },
      languages: { new: [], updated: [], ignored: [] },
    };

    // --- ABOUT ---
    if (parsedData.about) {
      if (
        !existingUser.profile?.about ||
        existingUser.profile?.aboutSource === 'CV'
      ) {
        preview.about = {
          action: 'update',
          oldValue: existingUser.profile?.about || null,
          newValue: parsedData.about,
        };
      } else {
        preview.about = {
          action: 'conflict',
          oldValue: existingUser.profile?.about,
          newValue: parsedData.about,
          reason: 'Mevcut hakkımda metni manuel olarak girilmiş',
        };
      }
    }

    // --- EDUCATION ---
    if (parsedData.education && Array.isArray(parsedData.education)) {
      for (const edu of parsedData.education) {
        const match = existingUser.education.find(
          (e) =>
            isSimilar(e.school, edu.school) &&
            isSimilar(e.fieldOfStudy, edu.fieldOfStudy || ''),
        );
        if (match) {
          if (match.sourceType === 'CV') {
            preview.education.updated.push({
              key: `edu-update-${match.id}`,
              existingId: match.id,
              existing: match,
              incoming: edu,
              confidence: edu.confidence || 95,
            });
          } else {
            preview.education.ignored.push({
              key: `edu-ignore-${match.id}`,
              existing: match,
              incoming: edu,
              reason: 'Manuel olarak girilmiş kayıt',
            });
          }
        } else {
          preview.education.new.push({
            key: `edu-new-${normalizeForComparison(edu.school)}`,
            data: edu,
            confidence: edu.confidence || 90,
          });
        }
      }
    }

    // --- EXPERIENCE ---
    if (parsedData.experience && Array.isArray(parsedData.experience)) {
      for (const exp of parsedData.experience) {
        const match = existingUser.experience.find(
          (e) =>
            isSimilar(e.company, exp.company) &&
            isSimilar(e.title, exp.title),
        );
        if (match) {
          if (match.sourceType === 'CV') {
            preview.experience.updated.push({
              key: `exp-update-${match.id}`,
              existingId: match.id,
              existing: match,
              incoming: exp,
              confidence: exp.confidence || 95,
            });
          } else {
            preview.experience.ignored.push({
              key: `exp-ignore-${match.id}`,
              existing: match,
              incoming: exp,
              reason: 'Manuel olarak girilmiş kayıt',
            });
          }
        } else {
          preview.experience.new.push({
            key: `exp-new-${normalizeForComparison(exp.company)}`,
            data: exp,
            confidence: exp.confidence || 90,
          });
        }
      }
    }

    // --- PROJECTS ---
    if (parsedData.projects && Array.isArray(parsedData.projects)) {
      for (const proj of parsedData.projects) {
        const match = existingUser.projects.find((p) =>
          isSimilar(p.name, proj.name),
        );
        if (match) {
          if (match.sourceType === 'CV') {
            preview.projects.updated.push({
              key: `proj-update-${match.id}`,
              existingId: match.id,
              existing: match,
              incoming: proj,
              confidence: proj.confidence || 90,
            });
          } else {
            preview.projects.ignored.push({
              key: `proj-ignore-${match.id}`,
              existing: match,
              incoming: proj,
              reason: 'Manuel olarak girilmiş kayıt',
            });
          }
        } else {
          preview.projects.new.push({
            key: `proj-new-${normalizeForComparison(proj.name)}`,
            data: proj,
            confidence: proj.confidence || 85,
          });
        }
      }
    }

    // --- CERTIFICATIONS ---
    if (
      parsedData.certifications &&
      Array.isArray(parsedData.certifications)
    ) {
      for (const cert of parsedData.certifications) {
        const match = existingUser.certifications.find((c) =>
          isSimilar(c.name, cert.name),
        );
        if (match) {
          if (match.sourceType === 'CV') {
            preview.certifications.updated.push({
              key: `cert-update-${match.id}`,
              existingId: match.id,
              existing: match,
              incoming: cert,
              confidence: cert.confidence || 90,
            });
          } else {
            preview.certifications.ignored.push({
              key: `cert-ignore-${match.id}`,
              existing: match,
              incoming: cert,
              reason: 'Manuel olarak girilmiş kayıt',
            });
          }
        } else {
          preview.certifications.new.push({
            key: `cert-new-${normalizeForComparison(cert.name)}`,
            data: cert,
            confidence: cert.confidence || 85,
          });
        }
      }
    }

    // --- SKILLS ---
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      const existingSkillNames = existingUser.userSkills.map((us) =>
        normalizeForComparison(us.skill.name),
      );
      for (const skillName of parsedData.skills) {
        if (typeof skillName !== 'string') continue;
        if (existingSkillNames.includes(normalizeForComparison(skillName))) {
          preview.skills.ignored.push({
            key: `skill-ignore-${normalizeForComparison(skillName)}`,
            name: skillName,
            reason: 'Zaten mevcut',
          });
        } else {
          preview.skills.new.push({
            key: `skill-new-${normalizeForComparison(skillName)}`,
            name: skillName,
          });
        }
      }
    }

    // --- LANGUAGES ---
    if (parsedData.languages && Array.isArray(parsedData.languages)) {
      for (const lang of parsedData.languages) {
        const match = existingUser.languages.find((l) =>
          isSimilar(l.language, lang.language),
        );
        if (match) {
          if (match.sourceType === 'CV') {
            preview.languages.updated.push({
              key: `lang-update-${match.id}`,
              existingId: match.id,
              existing: match,
              incoming: lang,
            });
          } else {
            preview.languages.ignored.push({
              key: `lang-ignore-${match.id}`,
              existing: match,
              incoming: lang,
              reason: 'Manuel olarak girilmiş kayıt',
            });
          }
        } else {
          preview.languages.new.push({
            key: `lang-new-${normalizeForComparison(lang.language)}`,
            data: lang,
          });
        }
      }
    }

    return preview;
  }

  // ============================================================
  // APPLY CV MERGE (with transaction safety)
  // ============================================================
  async applyCvMerge(
    userId: string,
    cvId: string,
    decisions?: { acceptedItems?: any[]; rejectedItems?: string[] },
  ) {
    const cvRecord = await this.prisma.userCV.findFirst({
      where: { id: cvId, userId },
    });

    if (!cvRecord) throw new NotFoundException('CV kaydı bulunamadı.');
    if (!cvRecord.parsedData)
      throw new BadRequestException('CV henüz ayrıştırılmamış.');

    const parsedData = cvRecord.parsedData as any;
    const mergePreview = cvRecord.mergePreview as any;
    const rejectedKeys = new Set(decisions?.rejectedItems || []);

    // Reclassification map for confidence-based decisions
    const reclassifyMap = new Map<string, string>();
    if (decisions?.acceptedItems) {
      for (const item of decisions.acceptedItems) {
        if (item.action === 'reclassify' && item.reclassifyTo) {
          reclassifyMap.set(item.key, item.reclassifyTo);
        }
      }
    }

    // Run all merge operations in a transaction
    await this.prisma.$transaction(async (tx) => {
      // --- ABOUT ---
      if (
        mergePreview?.about &&
        mergePreview.about.action !== 'conflict' &&
        !rejectedKeys.has('about')
      ) {
        await tx.userProfile.upsert({
          where: { userId },
          update: { about: parsedData.about, aboutSource: 'CV' },
          create: { userId, about: parsedData.about, aboutSource: 'CV' },
        });
      }

      // --- EDUCATION ---
      if (mergePreview?.education) {
        for (const item of mergePreview.education.new || []) {
          if (rejectedKeys.has(item.key)) continue;
          const edu = item.data;
          await tx.userEducation.create({
            data: {
              userId,
              school: edu.school || '',
              degree: edu.degree || '',
              fieldOfStudy: edu.fieldOfStudy || '',
              startDate: new Date(edu.startDate || '2000-01-01'),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              isContinuing: edu.isContinuing || false,
              sourceType: 'CV',
              sourceId: cvId,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              confidence: item.confidence,
            },
          });
        }
        for (const item of mergePreview.education.updated || []) {
          if (rejectedKeys.has(item.key)) continue;
          const edu = item.incoming;
          await tx.userEducation.update({
            where: { id: item.existingId },
            data: {
              school: edu.school || undefined,
              degree: edu.degree || undefined,
              fieldOfStudy: edu.fieldOfStudy || undefined,
              startDate: edu.startDate
                ? new Date(edu.startDate)
                : undefined,
              endDate: edu.endDate ? new Date(edu.endDate) : undefined,
              isContinuing: edu.isContinuing,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              sourceId: cvId,
            },
          });
        }
      }

      // --- EXPERIENCE ---
      if (mergePreview?.experience) {
        for (const item of mergePreview.experience.new || []) {
          if (rejectedKeys.has(item.key)) continue;
          // Check if user reclassified to project
          if (reclassifyMap.get(item.key) === 'project') {
            const exp = item.data;
            await tx.userProject.create({
              data: {
                userId,
                name: exp.title || exp.company || '',
                description: exp.description,
                startDate: exp.startDate
                  ? new Date(exp.startDate)
                  : null,
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                isContinuing: exp.isContinuing || false,
                sourceType: 'CV',
                sourceId: cvId,
                lastUpdatedBy: 'CV',
                lastUpdatedAt: new Date(),
                confidence: item.confidence,
              },
            });
            continue;
          }
          const exp = item.data;
          await tx.userExperience.create({
            data: {
              userId,
              company: exp.company || '',
              title: exp.title || '',
              location: exp.location,
              startDate: new Date(exp.startDate || '2000-01-01'),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              isContinuing: exp.isContinuing || false,
              description: exp.description,
              sourceType: 'CV',
              sourceId: cvId,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              confidence: item.confidence,
            },
          });
        }
        for (const item of mergePreview.experience.updated || []) {
          if (rejectedKeys.has(item.key)) continue;
          const exp = item.incoming;
          await tx.userExperience.update({
            where: { id: item.existingId },
            data: {
              company: exp.company || undefined,
              title: exp.title || undefined,
              location: exp.location,
              startDate: exp.startDate
                ? new Date(exp.startDate)
                : undefined,
              endDate: exp.endDate ? new Date(exp.endDate) : undefined,
              isContinuing: exp.isContinuing,
              description: exp.description,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              sourceId: cvId,
            },
          });
        }
      }

      // --- PROJECTS ---
      if (mergePreview?.projects) {
        for (const item of mergePreview.projects.new || []) {
          if (rejectedKeys.has(item.key)) continue;
          // Check if user reclassified to experience
          if (reclassifyMap.get(item.key) === 'experience') {
            const proj = item.data;
            await tx.userExperience.create({
              data: {
                userId,
                company: proj.name || '',
                title: proj.name || '',
                description: proj.description,
                startDate: new Date(proj.startDate || '2000-01-01'),
                endDate: proj.endDate ? new Date(proj.endDate) : null,
                isContinuing: proj.isContinuing || false,
                sourceType: 'CV',
                sourceId: cvId,
                lastUpdatedBy: 'CV',
                lastUpdatedAt: new Date(),
                confidence: item.confidence,
              },
            });
            continue;
          }
          const proj = item.data;
          await tx.userProject.create({
            data: {
              userId,
              name: proj.name || '',
              description: proj.description,
              url: proj.url,
              technologies: proj.technologies || [],
              startDate: proj.startDate
                ? new Date(proj.startDate)
                : null,
              endDate: proj.endDate ? new Date(proj.endDate) : null,
              isContinuing: proj.isContinuing || false,
              sourceType: 'CV',
              sourceId: cvId,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              confidence: item.confidence,
            },
          });
        }
        for (const item of mergePreview.projects.updated || []) {
          if (rejectedKeys.has(item.key)) continue;
          const proj = item.incoming;
          await tx.userProject.update({
            where: { id: item.existingId },
            data: {
              name: proj.name || undefined,
              description: proj.description,
              url: proj.url,
              technologies: proj.technologies,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              sourceId: cvId,
            },
          });
        }
      }

      // --- CERTIFICATIONS ---
      if (mergePreview?.certifications) {
        for (const item of mergePreview.certifications.new || []) {
          if (rejectedKeys.has(item.key)) continue;
          const cert = item.data;
          await tx.userCertification.create({
            data: {
              userId,
              name: cert.name || '',
              issuer: cert.issuer,
              issueDate: cert.issueDate
                ? new Date(cert.issueDate)
                : null,
              expirationDate: cert.expirationDate
                ? new Date(cert.expirationDate)
                : null,
              credentialUrl: cert.credentialUrl,
              sourceType: 'CV',
              sourceId: cvId,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              confidence: item.confidence,
            },
          });
        }
        for (const item of mergePreview.certifications.updated || []) {
          if (rejectedKeys.has(item.key)) continue;
          const cert = item.incoming;
          await tx.userCertification.update({
            where: { id: item.existingId },
            data: {
              name: cert.name || undefined,
              issuer: cert.issuer,
              issueDate: cert.issueDate
                ? new Date(cert.issueDate)
                : undefined,
              expirationDate: cert.expirationDate
                ? new Date(cert.expirationDate)
                : undefined,
              credentialUrl: cert.credentialUrl,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              sourceId: cvId,
            },
          });
        }
      }

      // --- SKILLS ---
      if (mergePreview?.skills) {
        for (const item of mergePreview.skills.new || []) {
          if (rejectedKeys.has(item.key)) continue;
          const skill = await tx.skill.upsert({
            where: { name: item.name },
            update: {},
            create: { name: item.name },
          });
          const existingSkill = await tx.userSkill.findFirst({
            where: { userId, skillId: skill.id },
          });
          if (!existingSkill) {
            await tx.userSkill.create({
              data: {
                userId,
                skillId: skill.id,
                level: 3,
                sourceType: 'CV',
                sourceId: cvId,
                lastUpdatedBy: 'CV',
                lastUpdatedAt: new Date(),
              },
            });
          } else if (existingSkill.deletedAt) {
            await tx.userSkill.update({
              where: {
                userId_skillId: { userId, skillId: skill.id },
              },
              data: {
                deletedAt: null,
                lastUpdatedBy: 'CV',
                lastUpdatedAt: new Date(),
              },
            });
          }
        }
      }

      // --- LANGUAGES ---
      if (mergePreview?.languages) {
        for (const item of mergePreview.languages.new || []) {
          if (rejectedKeys.has(item.key)) continue;
          const lang = item.data;
          await tx.userLanguage.create({
            data: {
              userId,
              language: lang.language || '',
              level: lang.level || '',
              sourceType: 'CV',
              sourceId: cvId,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
            },
          });
        }
        for (const item of mergePreview.languages.updated || []) {
          if (rejectedKeys.has(item.key)) continue;
          const lang = item.incoming;
          await tx.userLanguage.update({
            where: { id: item.existingId },
            data: {
              level: lang.level || undefined,
              lastUpdatedBy: 'CV',
              lastUpdatedAt: new Date(),
              sourceId: cvId,
            },
          });
        }
      }

      // Mark CV as merged
      await tx.userCV.update({
        where: { id: cvId },
        data: { processingStatus: 'MERGED', mergedAt: new Date() },
      });
    });

    await this.logAudit(userId, 'CV_MERGE', 'CV', cvId, null, {
      rejectedItems: Array.from(rejectedKeys),
    });

    return this.getPublicUserById(userId);
  }

  // ============================================================
  // AUTO MERGE (for backwards compat / quick merge)
  // ============================================================
  async autoMergeCv(userId: string, cvId: string) {
    return this.applyCvMerge(userId, cvId, {
      acceptedItems: [],
      rejectedItems: [],
    });
  }

  // ============================================================
  // CV DELETE (only removes file, profile data stays)
  // ============================================================
  async deleteCV(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    // Delete physical file
    if (user.cvUrl) {
      const filePath = path.join(process.cwd(), user.cvUrl);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('CV dosyası silinirken hata:', err);
      }
    }

    // Mark active CV version as inactive
    await this.prisma.userCV.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Delete CV-sourced data
    await this.prisma.userEducation.deleteMany({ where: { userId, sourceType: 'CV' } });
    await this.prisma.userExperience.deleteMany({ where: { userId, sourceType: 'CV' } });
    await this.prisma.userProject.deleteMany({ where: { userId, sourceType: 'CV' } });
    await this.prisma.userSkill.deleteMany({ where: { userId, sourceType: 'CV' } });
    await this.prisma.userLanguage.deleteMany({ where: { userId, sourceType: 'CV' } });
    await this.prisma.userCertification.deleteMany({ where: { userId, sourceType: 'CV' } });

    // Clear about text if it was sourced from CV
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (profile?.aboutSource === 'CV') {
      await this.prisma.userProfile.update({
        where: { userId },
        data: { about: null, aboutSource: 'MANUAL' },
      });
    }

    await this.logAudit(userId, 'CV_DELETE', 'CV', undefined, { cvUrl: user.cvUrl }, undefined);

    return this.updateUser(userId, { cvUrl: null });
  }

  // ============================================================
  // GET CV MERGE PREVIEW
  // ============================================================
  async getCvMergePreview(userId: string, cvId: string) {
    const cvRecord = await this.prisma.userCV.findFirst({
      where: { id: cvId, userId },
    });
    if (!cvRecord) throw new NotFoundException('CV kaydı bulunamadı.');

    return {
      cvId: cvRecord.id,
      version: cvRecord.version,
      processingStatus: cvRecord.processingStatus,
      mergePreview: cvRecord.mergePreview,
      parsedAt: cvRecord.parsedAt,
    };
  }
}
