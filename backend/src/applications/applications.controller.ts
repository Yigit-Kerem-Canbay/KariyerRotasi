import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtUser } from '../auth/jwt.strategy';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.job_seeker)
  create(@Req() req: { user: JwtUser }, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(req.user.userId, dto);
  }

  @Delete(':jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.job_seeker)
  withdraw(@Req() req: { user: JwtUser }, @Param('jobId', ParseUUIDPipe) jobId: string) {
    return this.applicationsService.withdraw(req.user.userId, jobId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.job_seeker)
  findMine(@Req() req: { user: JwtUser }, @Query() query: PaginationQueryDto) {
    return this.applicationsService.findMine(req.user.userId, query);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(
    @Req() req: { user: JwtUser },
    @Query('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.applicationsService.status(req.user.userId, jobId);
  }

  // --- EMPLOYER ENDPOINTS ---

  @Get('employer/jobs/:jobId/applicants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.corporate_employer, UserRole.individual_employer)
  findApplicants(
    @Req() req: { user: JwtUser },
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Query() query: PaginationQueryDto
  ) {
    return this.applicationsService.findApplicantsForJob(req.user.userId, jobId, query);
  }

  @Get('employer/:id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.corporate_employer, UserRole.individual_employer)
  findApplicantProfile(
    @Req() req: { user: JwtUser },
    @Param('id', ParseUUIDPipe) applicationId: string,
  ) {
    return this.applicationsService.findApplicantProfile(req.user.userId, applicationId);
  }

  @Patch('employer/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.corporate_employer, UserRole.individual_employer)
  updateStatus(
    @Req() req: { user: JwtUser },
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Body('status') status: ApplicationStatus
  ) {
    return this.applicationsService.updateStatus(req.user.userId, applicationId, status);
  }
}
