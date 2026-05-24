import { UserManagementRepository } from '../repositories/userManagement.repository';
import {
  InvalidCredentials,
  InvalidToken,
  UserNotFound,
  PasswordMismatch,
} from '../user.exception';
import {
  DashboardLoginInput,
  DashboardLoginResponse,
  DashboardRefreshTokenResponse,
  ForgotPasswordInput,
  ResetPasswordFromLinkInput,
  ChangePasswordInput,
} from '../user.model';
import {
  signAccess,
  signRefresh,
  signResetToken,
  verifyAccess,
  verifyRefresh,
  decodeUnsafe,
} from '../../../shared_infrastructure/auth/jwt.helper';
import { hashPassword, comparePassword } from '../../../shared_infrastructure/auth/password.helper';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { MailService } from '../../../utils/mailService';
import { USER_TYPE } from '../../../shared_infrastructure/auth/user-type.constants';

export class UserAuthService {
  static async login(data: DashboardLoginInput): Promise<DashboardLoginResponse> {
    const { email, password } = data;
    loggerService.info('Dashboard login attempt', { email });

    const user = await UserManagementRepository.findUserByEmail(email);

    if (!user || user.userTypeCode !== USER_TYPE.ADMIN || !user.userRole) {
      loggerService.warn('Dashboard login failed: user not found, not admin, or has no role', { email });
      throw new InvalidCredentials();
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      loggerService.warn('Dashboard login failed: invalid password', { email });
      throw new InvalidCredentials();
    }

    const role         = user.userRole?.role.name;
    const accessToken  = signAccess({ userId: user.id, userTypeCode: USER_TYPE.ADMIN, role });
    const refreshToken = signRefresh({ userId: user.id });

    await UserManagementRepository.updateRefreshToken(user.id, refreshToken);
    loggerService.info('Dashboard login successful', { userId: user.id, role });

    return { accessToken, refreshToken };
  }

  static async refreshToken(refreshToken: string): Promise<DashboardRefreshTokenResponse> {
    loggerService.info('Dashboard token refresh attempt');

    let decoded: any;
    try {
      decoded = verifyRefresh(refreshToken);
    } catch {
      try {
        const exp = decodeUnsafe(refreshToken) as any;
        if (exp?.userId) {
          const user = await UserManagementRepository.findUserById(exp.userId);
          if (user?.refreshToken === refreshToken) {
            await UserManagementRepository.updateRefreshToken(exp.userId, null);
          }
        }
      } catch {}
      throw new InvalidToken();
    }

    const user = await UserManagementRepository.findUserById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken || user.userTypeCode !== USER_TYPE.ADMIN) {
      throw new InvalidToken();
    }

    const role           = user.userRole?.role.name;
    const newAccessToken = signAccess({ userId: user.id, userTypeCode: USER_TYPE.ADMIN, role });

    loggerService.info('Dashboard token refreshed', { userId: user.id });
    return { accessToken: newAccessToken };
  }

  static async logout(userId: number): Promise<void> {
    loggerService.info('Dashboard logout', { userId });
    const user = await UserManagementRepository.findUserById(userId);
    if (!user) throw new UserNotFound();
    await UserManagementRepository.updateRefreshToken(userId, null);
  }

  static async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    const { email } = data;
    loggerService.info('Dashboard forgot password', { email });

    const user = await UserManagementRepository.findUserByEmail(email);
    if (!user || user.userTypeCode !== USER_TYPE.ADMIN) return; // silent — prevent enumeration

    const resetToken = signResetToken({ userId: user.id });
    const baseUrl    = process.env.BASE_URL || 'http://localhost:3000';
    const resetLink  = `${baseUrl}/dashboard/reset-password?token=${resetToken}`;

    try {
      await MailService.sendMail({
        to:      email,
        subject: 'Dashboard Password Reset | Foodlify',
        html:    `<p>Reset your password: <a href="${resetLink}">${resetLink}</a></p><p>Link expires in 1 hour.</p>`,
      });
      loggerService.info('Dashboard reset email sent', { email });
    } catch {
      loggerService.warn('SMTP failed for dashboard reset email', { email });
    }
  }

  static async resetPasswordFromLink(data: ResetPasswordFromLinkInput): Promise<void> {
    const { token, newPassword } = data;
    loggerService.info('Dashboard reset password from link');

    try {
      const decoded        = verifyAccess(token);
      const hashedPassword = await hashPassword(newPassword);
      await UserManagementRepository.updatePassword(decoded.userId, hashedPassword);
      loggerService.info('Dashboard password reset successful', { userId: decoded.userId });
    } catch {
      throw new InvalidToken();
    }
  }

  static async changePassword(userId: number, data: ChangePasswordInput): Promise<void> {
    const { oldPassword, newPassword } = data;
    loggerService.info('Dashboard change password', { userId });

    const user = await UserManagementRepository.findUserById(userId);
    if (!user) throw new UserNotFound();

    const valid = await comparePassword(oldPassword, user.password);
    if (!valid) throw new PasswordMismatch();

    const hashed = await hashPassword(newPassword);
    await UserManagementRepository.updatePassword(userId, hashed);
    loggerService.info('Dashboard password changed', { userId });
  }
}
