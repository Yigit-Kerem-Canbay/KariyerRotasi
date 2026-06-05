import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtUser } from '../auth/jwt.strategy';
import { JobsService } from './jobs.service';
import * as jwt from 'jsonwebtoken';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ── Stats routes (MUST come before :id to avoid route collision) ──

  @Get('stats/total')
  getTotal() {
    return this.jobsService.getTotalCount();
  }

  @Get('stats/recent-count')
  getRecentCount(@Query('hours') hours?: string) {
    return this.jobsService.getRecentCount(Number(hours) || 24);
  }

  @Get('stats/experience-counts')
  getExperienceCounts() {
    return this.jobsService.getExperienceCounts();
  }

  @Get('stats/top-sectors')
  getTopSectors(@Query('limit') limit?: string) {
    return this.jobsService.getTopSectors(Number(limit) || 10);
  }

  @Get('stats/popular-searches')
  getPopularSearches(@Query('limit') limit?: string) {
    return this.jobsService.getPopularSkills(Number(limit) || 10);
  }

  @Get('autocomplete')
  autocomplete(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.jobsService.getAutocompleteSuggestions(q, Number(limit) || 8);
  }

  @Get('discover')
  discover(@Query() query: any) {
    return this.jobsService.discover(query);
  }

  @Get('employer/my-jobs')
  @UseGuards(JwtAuthGuard)
  getEmployerJobs(@Req() req: { user: JwtUser }, @Query() query: any) {
    return this.jobsService.getEmployerJobs(req.user.userId, query);
  }

  // ── Standard CRUD ──

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: { user: JwtUser }, @Body() body: any) {
    return this.jobsService.createJob(req.user.userId, req.user.role, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Req() req: { user: JwtUser }, @Body() body: any) {
    return this.jobsService.updateJob(id, req.user.userId, body);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.sub) userId = decoded.sub;
      } catch (e) {}
    }
    return this.jobsService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/match-analysis')
  getMatchAnalysis(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    return this.jobsService.getMatchAnalysis(id, req.user.userId);
  }

  @Get(':id/similar')
  findSimilar(@Param('id') id: string) {
    return this.jobsService.findSimilar(id);
  }
}
