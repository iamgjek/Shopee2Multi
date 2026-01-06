import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // 從環境變數獲取 SMTP 配置
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    // 如果沒有配置 SMTP，使用測試模式（不會真正發送郵件）
    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.warn('⚠️  [郵件服務] SMTP 配置不完整，郵件通知功能將被禁用');
      console.warn('   請設置以下環境變數：SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        // 對於 Gmail，可能需要設置
        ...(smtpHost.includes('gmail') && {
          service: 'gmail',
        }),
      });

      console.log('✅ [郵件服務] SMTP 傳輸器已初始化');
    } catch (error) {
      console.error('❌ [郵件服務] 初始化失敗:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  [郵件服務] 傳輸器未初始化，跳過郵件發送');
      return false;
    }

    try {
      const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@shopee2multi.space';
      
      const info = await this.transporter.sendMail({
        from: `"Shopee2Multi" <${smtpFrom}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
        html: options.html,
      });

      console.log('✅ [郵件服務] 郵件已發送:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ [郵件服務] 發送郵件失敗:', error);
      return false;
    }
  }

  async sendContactFormNotification(
    submissionId: string,
    name: string,
    email: string,
    subject: string,
    message: string
  ): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'iamgjek@gmail.com';
    const siteUrl = process.env.SITE_URL || 'https://shopee2multi.space';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a0a0a; color: #00ff88; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #00ff88; }
            .message-box { padding: 15px; background: white; border: 1px solid #ddd; border-radius: 5px; white-space: pre-wrap; }
            .footer { margin-top: 20px; padding: 15px; text-align: center; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #00ff88; color: #0a0a0a; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 新的聯絡表單提交</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">提交 ID</div>
                <div class="value">${submissionId}</div>
              </div>
              <div class="field">
                <div class="label">姓名</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">主旨</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">訊息內容</div>
                <div class="message-box">${message}</div>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${siteUrl}/admin" class="button">查看管理後台</a>
              </div>
            </div>
            <div class="footer">
              <p>此郵件由 Shopee2Multi 系統自動發送</p>
              <p>提交時間: ${new Date().toLocaleString('zh-TW')}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
新的聯絡表單提交

提交 ID: ${submissionId}
姓名: ${name}
Email: ${email}
主旨: ${subject}

訊息內容:
${message}

查看管理後台: ${siteUrl}/admin

提交時間: ${new Date().toLocaleString('zh-TW')}
    `.trim();

    return await this.sendEmail({
      to: adminEmail,
      subject: `[Shopee2Multi] 新的聯絡表單: ${subject}`,
      html,
      text,
    });
  }
}

// 導出單例
export const emailService = new EmailService();

