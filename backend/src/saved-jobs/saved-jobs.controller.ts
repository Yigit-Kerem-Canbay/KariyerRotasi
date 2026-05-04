import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { PaginationQueryDto } from '../applications/dto/pagination-query.dto';
import { JobIdDto } from './dto/job-id.dto';
import { SavedJobsService } from './saved-jobs.service';

@Controller('saved-jobs')
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.job_seeker)
  save(@Req() req: { user: JwtUser }, @Body() dto: JobIdDto) {
    return this.savedJobsService.save(req.user.userId, dto.jobId);
  }

  @Delete(':jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.job_seeker)
  remove(
    @Req() req: { user: JwtUser },
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.savedJobsService.remove(req.user.userId, jobId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.job_seeker)
  findMine(@Req() req: { user: JwtUser }, @Query() query: PaginationQueryDto) {
    return this.savedJobsService.findMine(req.user.userId, query);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(
    @Req() req: { user: JwtUser },
    @Query('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.savedJobsService.isSaved(req.user.userId, jobId);
  }
}
