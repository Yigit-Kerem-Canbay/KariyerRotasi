import { IsOptional, IsString, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() about?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() birthDate?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() militaryStatus?: string;
  @IsOptional() @IsString() driverLicense?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsString() portfolioUrl?: string;
}

export class AddEducationDto {
  @IsOptional() @IsString() school: string;
  @IsOptional() @IsString() degree: string;
  @IsOptional() @IsString() fieldOfStudy: string;
  @IsOptional() @IsString() startDate: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isContinuing?: boolean;
  @IsOptional() @IsString() grade?: string;
}

export class AddExperienceDto {
  @IsOptional() @IsString() company: string;
  @IsOptional() @IsString() title: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() startDate: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isContinuing?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class AddLanguageDto {
  @IsOptional() @IsString() language: string;
  @IsOptional() @IsString() level: string;
}

export class UpdatePreferenceDto {
  @IsOptional() @IsNumber() salaryMin?: number;
  @IsOptional() @IsNumber() salaryMax?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsArray() workModels?: string[];
  @IsOptional() @IsArray() preferredCities?: string[];
}
