import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const cleanVal = (val: string | undefined): string => {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

export class MailService {
  private static getTransporter() {
    const host = cleanVal(process.env.MAIL_HOST) || 'smtp.ethereal.email';
    const portStr = cleanVal(process.env.MAIL_PORT) || '587';
    const port = parseInt(portStr);
    const encryption = cleanVal(process.env.MAIL_ENCRYPTION);
    const user = cleanVal(process.env.MAIL_USERNAME) || 'ethereal_user';
    const pass = cleanVal(process.env.MAIL_PASSWORD) || 'ethereal_pass';

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465 || encryption === 'ssl',
      auth: {
        user,
        pass,
      },
    });
  }

  /**
   * Base method to send mail
   */
  public static async sendMail(options: EmailOptions): Promise<any> {
    let fromName = cleanVal(process.env.MAIL_FROM_NAME) || 'Foodlify';
    const appName = cleanVal(process.env.APP_NAME) || 'Foodlify';
    
    if (fromName.includes('${APP_NAME}')) {
      fromName = fromName.replace('${APP_NAME}', appName);
    }
    
    const fromAddress = cleanVal(process.env.MAIL_FROM_ADDRESS) || 'support@foodlify.com';
    const defaultFrom = `"${fromName}" <${fromAddress}>`;
    const from = options.from || defaultFrom;

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`[MailService] Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('[MailService] Error sending email:', error);
      throw error;
    }
  }
}
