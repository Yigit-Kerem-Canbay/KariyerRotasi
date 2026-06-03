import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly config: ConfigService) {
    this.fromEmail = this.config.get<string>('SMTP_USER', 'noreply@kariyerrotasi.com');
    this.fromName = this.config.get<string>('SMTP_FROM_NAME', 'KariyerRotası');

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.fromEmail,
        pass: this.config.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendVerificationEmail(to: string, name: string, code: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 520px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 40px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">KariyerRotası</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Kariyer yolculuğunuz başlıyor</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 22px; font-weight: 700;">Merhaba ${name} 👋</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
              Hesabınızı doğrulamak için aşağıdaki kodu kullanın. Bu kod <strong>15 dakika</strong> geçerlidir.
            </p>
            
            <!-- Code Box -->
            <div style="background: #f1f5f9; border-radius: 16px; padding: 24px; text-align: center; margin: 0 0 28px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b; font-family: 'Courier New', monospace;">${code}</span>
            </div>
            
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
              Bu e-postayı siz istemediyseniz, lütfen dikkate almayın. Hesabınız güvende.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} KariyerRotası. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject: `${code} — KariyerRotası Doğrulama Kodu`,
        html,
      });
      this.logger.log(`Doğrulama e-postası gönderildi: ${to}`);
    } catch (error) {
      this.logger.error(`E-posta gönderilemedi: ${to}`, error);
      // Don't throw — registration should still succeed even if email fails
    }
  }

  async sendCorporateApprovalNotification(to: string, name: string, companyName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 520px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">✅ Hesabınız Onaylandı</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 22px;">Merhaba ${name},</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
              <strong>${companyName}</strong> şirketi adına oluşturduğunuz kurumsal hesap onaylanmıştır. 
              Artık iş ilanı yayınlayabilirsiniz.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KariyerRotası</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject: `${companyName} — Kurumsal Hesabınız Onaylandı`,
        html,
      });
    } catch (error) {
      this.logger.error(`Onay e-postası gönderilemedi: ${to}`, error);
    }
  }

  async sendCorporateRejectionNotification(to: string, name: string, companyName: string, reason?: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 520px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">❌ Başvurunuz Reddedildi</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 22px;">Merhaba ${name},</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
              <strong>${companyName}</strong> şirketi adına oluşturduğunuz kurumsal hesap başvurusu reddedilmiştir.
            </p>
            ${reason ? `
            <div style="background: #fef2f2; border-radius: 12px; padding: 16px; margin-top: 16px;">
              <p style="color: #991b1b; font-size: 14px; margin: 0;"><strong>Neden:</strong> ${reason}</p>
            </div>
            ` : ''}
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-top: 16px;">
              Bilgileri düzelterek tekrar başvurabilirsiniz.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KariyerRotası</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject: `${companyName} — Kurumsal Hesap Başvurunuz Reddedildi`,
        html,
      });
    } catch (error) {
      this.logger.error(`Red e-postası gönderilemedi: ${to}`, error);
    }
  }
}
