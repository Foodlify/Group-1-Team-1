import { UserManagementRepository } from '../repositories/userManagement.repository';
import { UserNotFound, UserEmailTaken } from '../user.exception';
import { DashboardUserResponse, UpdateProfileInput } from '../user.model';
import { toUserResponse } from '../user.helpers';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { UpdateEmailInput } from '../../../shared_infrastructure/auth/email-update.helper';
import { SharedAuthService } from './shared-auth.service';

export class ProfileService {
  static async getProfile(userId: number): Promise<DashboardUserResponse> {
    loggerService.info('Get dashboard profile', { userId });
    const user = await UserManagementRepository.findUserById(userId);
    if (!user) throw new UserNotFound();
    return toUserResponse(user);
  }

  static async updateProfile(userId: number, data: UpdateProfileInput): Promise<DashboardUserResponse> {
    loggerService.info('Update dashboard profile', { userId });
    const existing = await UserManagementRepository.findUserById(userId);
    if (!existing) throw new UserNotFound();
    const updated = await UserManagementRepository.updateUser(userId, data);
    return toUserResponse(updated);
  }

  static async updateEmail(userId: number, data: UpdateEmailInput): Promise<{ email: string }> {
    loggerService.info('Update dashboard email', { userId });
    return SharedAuthService.updateEmail(userId, data.currentPassword, data.newEmail, new UserNotFound(), new UserEmailTaken());
  }
}
