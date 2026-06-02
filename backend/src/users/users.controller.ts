import { Body, Controller, Get, Patch, Req, UseGuards, Post, UseInterceptors, UploadedFile, BadRequestException, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { JwtUser } from '../auth/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto, AddEducationDto, AddExperienceDto, AddLanguageDto, UpdatePreferenceDto } from './dto/profile.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

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

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateProfile(@Req() req: { user: JwtUser }, @Body() dto: UpdateProfileDto) {
    await this.users.upsertProfile(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/preferences')
  async updatePreferences(@Req() req: { user: JwtUser }, @Body() dto: UpdatePreferenceDto) {
    await this.users.upsertPreferences(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/education')
  async addEducation(@Req() req: { user: JwtUser }, @Body() dto: AddEducationDto) {
    await this.users.addEducation(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/experience')
  async addExperience(@Req() req: { user: JwtUser }, @Body() dto: AddExperienceDto) {
    await this.users.addExperience(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/skill')
  async addSkill(@Req() req: { user: JwtUser }, @Body() dto: { skillName: string }) {
    await this.users.addSkill(req.user.userId, dto.skillName);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/language')
  async addLanguage(@Req() req: { user: JwtUser }, @Body() dto: AddLanguageDto) {
    await this.users.addLanguage(req.user.userId, dto);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Req() req: { user: JwtUser }, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Dosya bulunamadı.');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Sadece resim dosyaları desteklenmektedir.');
    }
    
    await this.users.uploadAvatar(req.user.userId, file);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/upload-cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCV(@Req() req: { user: JwtUser }, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Dosya bulunamadı.');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Sadece PDF dosyaları desteklenmektedir.');
    }
    
    // Pass the buffer to the service to handle AI parsing and DB updating
    await this.users.parseAndSaveCV(req.user.userId, file);
    return this.users.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/cv')
  async deleteCV(@Req() req: { user: JwtUser }) {
    await this.users.deleteCV(req.user.userId);
    return this.users.getPublicUserById(req.user.userId);
  }
}
