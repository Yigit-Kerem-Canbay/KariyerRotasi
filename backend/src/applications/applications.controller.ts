import {
  Body,
  Controller,
  Get,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
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
}
