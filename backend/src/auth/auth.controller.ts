import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterJobSeekerDto,
  RegisterIndividualEmployerDto,
  RegisterCorporateEmployerDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // ─── Registration Endpoints ───

  @Post('register/job-seeker')
  registerJobSeeker(@Body() dto: RegisterJobSeekerDto) {
    return this.auth.registerJobSeeker(dto);
  }

  @Post('register/individual-employer')
  registerIndividualEmployer(@Body() dto: RegisterIndividualEmployerDto) {
    return this.auth.registerIndividualEmployer(dto);
  }

  @Post('register/corporate-employer')
  registerCorporateEmployer(@Body() dto: RegisterCorporateEmployerDto) {
    return this.auth.registerCorporateEmployer(dto);
  }

  // ─── Email Verification ───

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.auth.resendVerification(dto);
  }

  // ─── Login ───

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
