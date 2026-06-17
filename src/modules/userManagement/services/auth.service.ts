import { SharedAuthService } from './shared-auth.service';
import {
  InvalidCredentials,
  InvalidToken,
  UserNotFound,
} from '../user.exception';
import {
  DashboardLoginInput,
  DashboardLoginResponse,
  DashboardRefreshTokenResponse,
  ForgotPasswordInput,
  ResetPasswordFromLinkInput,
  ChangePasswordInput,
} from '../user.model';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { MailService } from '../../../utils/mailService';
import { USER_TYPE } from '../../../shared_infrastructure/auth/user-type.constants';

export class UserAuthService {
  static async login(data: DashboardLoginInput): Promise<DashboardLoginResponse> {
    loggerService.info('Dashboard login attempt', { email: data.email });

    const tokens = await SharedAuthService.login(data.email, data.password, (user) => {
      if (!user.userRole) throw new InvalidCredentials();
      return { userId: user.id, role: user.userRole.role.name };
    });

    loggerService.info('Dashboard login successful');
    return tokens;
  }

  static async refreshToken(refreshToken: string): Promise<DashboardRefreshTokenResponse> {
    loggerService.info('Dashboard token refresh attempt');

    const result = await SharedAuthService.refreshToken(refreshToken, (user) => {
      if (!user.userRole) throw new InvalidToken();
      return { userId: user.id, role: user.userRole.role.name };
    });

    loggerService.info('Dashboard token refreshed');
    return result;
  }

  static async logout(userId: number): Promise<void> {
    loggerService.info('Dashboard logout', { userId });
    await SharedAuthService.clearRefreshToken(userId, new UserNotFound());
  }

  static async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    loggerService.info('Dashboard forgot password', { email: data.email });

    await SharedAuthService.forgotPassword(
      data.email,
      (user) => user.userTypeCode === USER_TYPE.ADMIN,
      '/dashboard/reset-password',
      (email, link) => MailService.sendMail({
        to:      email,
        subject: 'Dashboard Password Reset | Foodlify',
        html:    `<p>Reset your password: <a href="${link}">${link}</a></p><p>Link expires in 1 hour.</p>`,
      }),
    );
  }

  static async resetPasswordFromLink(data: ResetPasswordFromLinkInput): Promise<void> {
    await SharedAuthService.resetPasswordFromLink(data.token, data.newPassword);
  }

  static async changePassword(userId: number, data: ChangePasswordInput): Promise<void> {
    await SharedAuthService.changePassword(userId, data.oldPassword, data.newPassword, new UserNotFound());
  }
}
