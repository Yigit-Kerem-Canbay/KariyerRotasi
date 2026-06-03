import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { JwtUser } from '../auth/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UpdateProfileDto,
  AddEducationDto,
  UpdateEducationDto,
  AddExperienceDto,
  UpdateExperienceDto,
  AddProjectDto,
  UpdateProjectDto,
  AddCertificationDto,
  UpdateCertificationDto,
  AddLanguageDto,
  UpdateLanguageDto,
  UpdatePreferenceDto,
  ApplyCvMergeDto,
} from './dto/profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // ==================== USER ====================

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: JwtUser }) {
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(@Req() req: { user: JwtUser }, @Body() dto: UpdateUserDto) {
    await this.users.updateUser(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== PROFILE ====================

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateProfile(
    @Req() req: { user: JwtUser },
    @Body() dto: UpdateProfileDto,
  ) {
    await this.users.upsertProfile(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== PREFERENCES ====================

  @UseGuards(JwtAuthGuard)
  @Patch('me/preferences')
  async updatePreferences(
    @Req() req: { user: JwtUser },
    @Body() dto: UpdatePreferenceDto,
  ) {
    await this.users.upsertPreferences(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== EDUCATION ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/education')
  async addEducation(
    @Req() req: { user: JwtUser },
    @Body() dto: AddEducationDto,
  ) {
    await this.users.addEducation(req.user.userId, {
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/education/:id')
  async updateEducation(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    await this.users.updateEducation(req.user.userId, id, data);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/education/:id')
  async deleteEducation(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
  ) {
    await this.users.deleteEducation(req.user.userId, id);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== EXPERIENCE ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/experience')
  async addExperience(
    @Req() req: { user: JwtUser },
    @Body() dto: AddExperienceDto,
  ) {
    await this.users.addExperience(req.user.userId, {
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/experience/:id')
  async updateExperience(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    await this.users.updateExperience(req.user.userId, id, data);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/experience/:id')
  async deleteExperience(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
  ) {
    await this.users.deleteExperience(req.user.userId, id);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== PROJECTS ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/project')
  async addProject(
    @Req() req: { user: JwtUser },
    @Body() dto: AddProjectDto,
  ) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    await this.users.addProject(req.user.userId, data);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/project/:id')
  async updateProject(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    await this.users.updateProject(req.user.userId, id, data);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/project/:id')
  async deleteProject(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
  ) {
    await this.users.deleteProject(req.user.userId, id);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== CERTIFICATIONS ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/certification')
  async addCertification(
    @Req() req: { user: JwtUser },
    @Body() dto: AddCertificationDto,
  ) {
    const data: any = { ...dto };
    if (dto.issueDate) data.issueDate = new Date(dto.issueDate);
    if (dto.expirationDate) data.expirationDate = new Date(dto.expirationDate);
    await this.users.addCertification(req.user.userId, data);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/certification/:id')
  async updateCertification(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
    @Body() dto: UpdateCertificationDto,
  ) {
    const data: any = { ...dto };
    if (dto.issueDate) data.issueDate = new Date(dto.issueDate);
    if (dto.expirationDate) data.expirationDate = new Date(dto.expirationDate);
    await this.users.updateCertification(req.user.userId, id, data);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/certification/:id')
  async deleteCertification(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
  ) {
    await this.users.deleteCertification(req.user.userId, id);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== SKILLS ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/skill')
  async addSkill(
    @Req() req: { user: JwtUser },
    @Body() dto: { skillName: string },
  ) {
    await this.users.addSkill(req.user.userId, dto.skillName);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/skill/:skillId')
  async deleteSkill(
    @Req() req: { user: JwtUser },
    @Param('skillId') skillId: string,
  ) {
    await this.users.deleteSkill(req.user.userId, skillId);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== LANGUAGES ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/language')
  async addLanguage(
    @Req() req: { user: JwtUser },
    @Body() dto: AddLanguageDto,
  ) {
    await this.users.addLanguage(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/language/:id')
  async updateLanguage(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
    @Body() dto: UpdateLanguageDto,
  ) {
    await this.users.updateLanguage(req.user.userId, id, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/language/:id')
  async deleteLanguage(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
  ) {
    await this.users.deleteLanguage(req.user.userId, id);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== AVATAR ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Req() req: { user: JwtUser },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Dosya bulunamadı.');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Sadece resim dosyaları desteklenmektedir.',
      );
    }
    await this.users.uploadAvatar(req.user.userId, file);
    return this.users.getPublicUserById(req.user.userId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete('me/avatar')
  async deleteAvatar(@Req() req: { user: JwtUser }) {
    await this.users.deleteAvatar(req.user.userId);
    return this.users.getPublicUserById(req.user.userId);
  }

  // ==================== CV UPLOAD & MERGE ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/upload-cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCV(
    @Req() req: { user: JwtUser },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Dosya bulunamadı.');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Sadece PDF dosyaları desteklenmektedir.',
      );
    }
    return this.users.parseAndSaveCV(req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/cv/:cvId/preview')
  async getCvMergePreview(
    @Req() req: { user: JwtUser },
    @Param('cvId') cvId: string,
  ) {
    return this.users.getCvMergePreview(req.user.userId, cvId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/cv/:cvId/merge')
  async applyCvMerge(
    @Req() req: { user: JwtUser },
    @Param('cvId') cvId: string,
    @Body() dto: ApplyCvMergeDto,
  ) {
    return this.users.applyCvMerge(req.user.userId, cvId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/cv/:cvId/auto-merge')
  async autoMergeCv(
    @Req() req: { user: JwtUser },
    @Param('cvId') cvId: string,
  ) {
    return this.users.autoMergeCv(req.user.userId, cvId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/cv')
  async deleteCV(@Req() req: { user: JwtUser }) {
    await this.users.deleteCV(req.user.userId);
    return this.users.getPublicUserById(req.user.userId);
  }
}
