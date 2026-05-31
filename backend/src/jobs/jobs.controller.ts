import { Controller, Get, Param, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';

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

  // ── Standard CRUD ──

  @Get()
  findAll(@Query() query: any) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Get(':id/similar')
  findSimilar(@Param('id') id: string) {
    return this.jobsService.findSimilar(id);
  }
}
