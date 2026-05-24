import { UserManagementRepository } from '../repositories/userManagement.repository';
import { UserNotFound } from '../user.exception';
import { ProfileResponse, UpdateProfileInput } from '../user.model';
import loggerService from '../../../shared_infrastructure/logger/logger';

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
}
