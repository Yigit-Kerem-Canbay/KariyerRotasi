import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

// ── Shared password rule ──
// Min 8 chars, at least 1 uppercase letter and 1 digit
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_MSG = 'Şifre en az 8 karakter olmalı, en az 1 büyük harf ve 1 rakam içermelidir.';

// ────────────────────────────────────────────
// Registration DTOs
// ────────────────────────────────────────────

export class RegisterJobSeekerDto {
  @IsString()
  @MinLength(2, { message: 'Ad en az 2 karakter olmalı.' })
  name!: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  email!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  password!: string;
}

export class RegisterIndividualEmployerDto {
  @IsString()
  @MinLength(2, { message: 'Ad en az 2 karakter olmalı.' })
  name!: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  email!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  password!: string;

  @IsString()
  @MinLength(10, { message: 'Geçerli bir telefon numarası girin.' })
  phone!: string;
}

export class RegisterCorporateEmployerDto {
  @IsString()
  @MinLength(2, { message: 'Ad en az 2 karakter olmalı.' })
  name!: string;

  @IsEmail({}, { message: 'Geçerli bir kurumsal e-posta girin.' })
  email!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  password!: string;

  @IsString()
  @MinLength(10, { message: 'Geçerli bir telefon numarası girin.' })
  phone!: string;

  @IsString()
  @MinLength(2, { message: 'Şirket adı en az 2 karakter olmalı.' })
  companyName!: string;

  @IsString()
  @MinLength(10, { message: 'Geçerli bir vergi numarası girin (10 veya 11 haneli).' })
  taxNumber!: string;

  @IsString()
  @IsOptional()
  companyWebsite?: string;
}

// ────────────────────────────────────────────
// Login DTO (shared for all user types)
// ────────────────────────────────────────────

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  email!: string;

  @IsString()
  password!: string;
}

// ────────────────────────────────────────────
// Verification DTOs
// ────────────────────────────────────────────

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Doğrulama kodu 6 haneli olmalı.' })
  code!: string;
}

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  email!: string;
}
