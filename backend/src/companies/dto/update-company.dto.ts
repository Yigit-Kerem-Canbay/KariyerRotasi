import { IsString, IsOptional, IsInt, Min, IsUrl } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  employeeCount?: string;

  @IsString()
  @IsOptional()
  sector?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}
