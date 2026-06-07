import { Controller, Get, Param, Query, Patch, UseGuards, Req, Body } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtUser } from '../auth/jwt.strategy';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('top')
  findTop(@Query('limit') limit?: string) {
    return this.companiesService.findTop(Number(limit) || 6);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('my')
  updateMyCompany(@Req() req: { user: JwtUser }, @Body() data: UpdateCompanyDto) {
    return this.companiesService.updateMyCompany(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyCompany(@Req() req: { user: JwtUser }) {
    return this.companiesService.getMyCompany(req.user.userId);
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
}
