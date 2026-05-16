import { MailService } from '../../utils/mailService';

export class CustomerMailService {
  /**
   * Decoupled HTML template generator for password resets.
   */
  private static getResetTemplate(resetLink: string): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc;">
        <h2 style="color: #0f172a; text-align: center;">Foodlify</h2>
        <h3 style="color: #ff4b2b;">Password Reset Request</h3>
        <p style="color: #475569; line-height: 1.6;">You requested a password reset for your Foodlify account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #ff4b2b, #ff416c); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(255, 75, 43, 0.2);">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">If you did not request this reset, you can safely ignore this email. This link is only valid for 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Foodlify. All rights reserved.</p>
      </div>
    `;
  }

  /**
   * Send password reset email
   */
  public static async sendResetPasswordEmail(email: string, resetLink: string): Promise<any> {
    const html = this.getResetTemplate(resetLink);
    return MailService.sendMail({
      to: email,
      subject: 'Password Reset Request | Foodlify',
      html,
    });
  }
}
