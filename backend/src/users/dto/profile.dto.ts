import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

// ==================== PROFILE ====================

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

// ==================== EDUCATION ====================

export class AddEducationDto {
  @IsString() school: string;
  @IsString() degree: string;
  @IsString() fieldOfStudy: string;
  @IsString() startDate: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isContinuing?: boolean;
  @IsOptional() @IsString() grade?: string;
}

export class UpdateEducationDto {
  @IsOptional() @IsString() school?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() fieldOfStudy?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isContinuing?: boolean;
  @IsOptional() @IsString() grade?: string;
}

// ==================== EXPERIENCE ====================

export class AddExperienceDto {
  @IsString() company: string;
  @IsString() title: string;
  @IsOptional() @IsString() location?: string;
  @IsString() startDate: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isContinuing?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class UpdateExperienceDto {
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isContinuing?: boolean;
  @IsOptional() @IsString() description?: string;
}

// ==================== PROJECTS ====================

export class AddProjectDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) technologies?: string[];
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isContinuing?: boolean;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) technologies?: string[];
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isContinuing?: boolean;
}

// ==================== CERTIFICATIONS ====================

export class AddCertificationDto {
  @IsString() name: string;
  @IsOptional() @IsString() issuer?: string;
  @IsOptional() @IsString() issueDate?: string;
  @IsOptional() @IsString() expirationDate?: string;
  @IsOptional() @IsString() credentialUrl?: string;
}

export class UpdateCertificationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() issuer?: string;
  @IsOptional() @IsString() issueDate?: string;
  @IsOptional() @IsString() expirationDate?: string;
  @IsOptional() @IsString() credentialUrl?: string;
}

// ==================== LANGUAGES ====================

export class AddLanguageDto {
  @IsString() language: string;
  @IsString() level: string;
}

export class UpdateLanguageDto {
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() level?: string;
}

// ==================== PREFERENCES ====================

export class UpdatePreferenceDto {
  @IsOptional() @IsNumber() salaryMin?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsArray() workModels?: string[];
  @IsOptional() @IsArray() preferredCities?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) preferredWorkingHours?: string[];
  @IsOptional() preferredSchedule?: any;
  @IsOptional() @IsArray() @IsString({ each: true }) employmentTypes?: string[];
}

// ==================== CV MERGE ====================

export class ApplyCvMergeDto {
  @IsString() cvId: string;
  @IsOptional() @IsArray() acceptedItems?: MergeItemDecision[];
  @IsOptional() @IsArray() rejectedItems?: string[]; // item keys to reject
}

export class MergeItemDecision {
  @IsString() key: string;
  @IsString() action: string; // 'accept', 'reject', 'reclassify'
  @IsOptional() @IsString() reclassifyTo?: string; // 'project' or 'experience'
}
