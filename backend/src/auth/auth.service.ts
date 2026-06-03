import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  LoginDto,
  RegisterJobSeekerDto,
  RegisterIndividualEmployerDto,
  RegisterCorporateEmployerDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/auth.dto';
import { UserRole, VerificationStatus } from '@prisma/client';

type JwtPayload = { sub: string; role: UserRole };

// Free email providers that should NOT be allowed for corporate registration
const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'yahoo.com', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'protonmail.com', 'proton.me',
  'mail.com',
  'yandex.com', 'yandex.ru',
  'zoho.com',
  'tutanota.com', 'tuta.io',
  'gmx.com', 'gmx.de',
  'mail.ru',
];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  // ─── Helpers ───

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async signToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload);
  }

  private async checkExistingEmail(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Bu e-posta zaten kayıtlı.');
  }

  private isFreeEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return FREE_EMAIL_DOMAINS.includes(domain);
  }

  // ─── Registration: Job Seeker ───

  async registerJobSeeker(dto: RegisterJobSeekerDto) {
    await this.checkExistingEmail(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: UserRole.job_seeker,
        verificationCode,
        verificationExpiry,
      },
      select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
    });

    // Send verification email
    await this.mail.sendVerificationEmail(user.email, user.name, verificationCode);

    return {
      user,
      message: 'Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.',
      requiresVerification: true,
    };
  }

  // ─── Registration: Individual Employer ───

  async registerIndividualEmployer(dto: RegisterIndividualEmployerDto) {
    await this.checkExistingEmail(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        role: UserRole.individual_employer,
        verificationCode,
        verificationExpiry,
      },
      select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
    });

    await this.mail.sendVerificationEmail(user.email, user.name, verificationCode);

    return {
      user,
      message: 'Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.',
      requiresVerification: true,
    };
  }

  // ─── Registration: Corporate Employer ───

  async registerCorporateEmployer(dto: RegisterCorporateEmployerDto) {
    // Block free email providers
    if (this.isFreeEmail(dto.email)) {
      throw new BadRequestException(
        'Kurumsal kayıt için şirketinize ait bir e-posta adresi kullanmalısınız (Gmail, Hotmail vb. kabul edilmez).',
      );
    }

    await this.checkExistingEmail(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Create user + company in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          phone: dto.phone,
          role: UserRole.corporate_employer,
          verificationCode,
          verificationExpiry,
        },
        select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
      });

      const company = await tx.company.create({
        data: {
          name: dto.companyName,
          taxNumber: dto.taxNumber,
          website: dto.companyWebsite,
          corporateEmail: dto.email,
          verificationStatus: VerificationStatus.PENDING,
          ownerId: user.id,
        },
        select: { id: true, name: true, verificationStatus: true },
      });

      return { user, company };
    });

    await this.mail.sendVerificationEmail(result.user.email, result.user.name, verificationCode);

    return {
      user: result.user,
      company: result.company,
      message: 'Kayıt başarılı. E-posta doğrulamasından sonra kurumsal hesabınız admin onayına sunulacaktır.',
      requiresVerification: true,
    };
  }

  // ─── Email Verification ───

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı.');

    if (user.emailVerified) {
      throw new BadRequestException('E-posta zaten doğrulanmış.');
    }

    if (!user.verificationCode || !user.verificationExpiry) {
      throw new BadRequestException('Doğrulama kodu bulunamadı. Lütfen yeni kod talep edin.');
    }

    if (new Date() > user.verificationExpiry) {
      throw new BadRequestException('Doğrulama kodunun süresi dolmuş. Lütfen yeni kod talep edin.');
    }

    if (user.verificationCode !== dto.code) {
      throw new BadRequestException('Doğrulama kodu hatalı.');
    }

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    // If corporate employer, update company verification status
    if (user.role === UserRole.corporate_employer) {
      await this.prisma.company.updateMany({
        where: { ownerId: user.id },
        data: { verificationStatus: VerificationStatus.EMAIL_VERIFIED },
      });
    }

    // Generate token so user can proceed
    const token = await this.signToken({ sub: user.id, role: user.role });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: true, createdAt: user.createdAt },
      accessToken: token,
      message: user.role === UserRole.corporate_employer
        ? 'E-posta doğrulandı. Kurumsal hesabınız admin onayı bekliyor.'
        : 'E-posta doğrulandı. Hesabınız aktif.',
    };
  }

  // ─── Resend Verification Code ───

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı.');

    if (user.emailVerified) {
      throw new BadRequestException('E-posta zaten doğrulanmış.');
    }

    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationExpiry },
    });

    await this.mail.sendVerificationEmail(user.email, user.name, verificationCode);

    return { message: 'Yeni doğrulama kodu gönderildi.' };
  }

  // ─── Login ───

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('E-posta veya şifre hatalı.');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('E-posta veya şifre hatalı.');

    // Check if email is verified
    if (!user.emailVerified) {
      // Resend verification code automatically
      const verificationCode = this.generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { verificationCode, verificationExpiry },
      });

      await this.mail.sendVerificationEmail(user.email, user.name, verificationCode);

      return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: false, createdAt: user.createdAt },
        requiresVerification: true,
        message: 'E-posta adresiniz henüz doğrulanmamış. Yeni doğrulama kodu gönderildi.',
      };
    }

    // Check corporate employer approval
    if (user.role === UserRole.corporate_employer) {
      const company = await this.prisma.company.findFirst({ where: { ownerId: user.id } });
      if (company && company.verificationStatus !== VerificationStatus.APPROVED && company.verificationStatus !== VerificationStatus.EMAIL_VERIFIED) {
        throw new UnauthorizedException('Kurumsal hesabınız henüz onaylanmamış veya reddedilmiş.');
      }
    }

    const token = await this.signToken({ sub: user.id, role: user.role });
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt },
      accessToken: token,
    };
  }
}
