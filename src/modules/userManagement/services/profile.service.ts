import { UserManagementRepository } from '../repositories/userManagement.repository';
import { UserNotFound, UserEmailTaken, InvalidCredentials } from '../user.exception';
import { ProfileResponse, UpdateProfileInput } from '../user.model';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { comparePassword } from '../../../shared_infrastructure/auth/password.helper';
import { UpdateEmailInput } from '../../../shared_infrastructure/auth/email-update.helper';

type UserWithRole = NonNullable<Awaited<ReturnType<typeof UserManagementRepository.findUserById>>>;

function toProfileResponse(user: UserWithRole): ProfileResponse {
  return {
    id:    user.id,
    name:  user.name,
    email: user.email,
    role:  user.userRole!.role.name,
  };
}

export class ProfileService {
  static async getProfile(userId: number): Promise<ProfileResponse> {
    loggerService.info('Get dashboard profile', { userId });
    const user = await UserManagementRepository.findUserById(userId);
    if (!user) throw new UserNotFound();
    return toProfileResponse(user);
  }

  static async updateProfile(userId: number, data: UpdateProfileInput): Promise<ProfileResponse> {
    loggerService.info('Update dashboard profile', { userId });
    const updated = await UserManagementRepository.updateUser(userId, data);
    return toProfileResponse(updated);
  }

  static async updateEmail(userId: number, data: UpdateEmailInput): Promise<{ email: string }> {
    loggerService.info('Update dashboard email', { userId });
    const { currentPassword, newEmail } = data;

    const user = await UserManagementRepository.findUserById(userId);
    if (!user) throw new UserNotFound();

    const passwordValid = await comparePassword(currentPassword, user.password);
    if (!passwordValid) throw new InvalidCredentials();

    if (newEmail !== user.email) {
      const taken = await UserManagementRepository.findUserByEmail(newEmail);
      if (taken) throw new UserEmailTaken();
    }

    await UserManagementRepository.updateUserEmail(userId, newEmail);
    return { email: newEmail };
  }
}
