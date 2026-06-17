import { UserManagementRepository } from './repositories/userManagement.repository';
import { DashboardUserResponse } from './user.model';

export type UserWithRole = NonNullable<Awaited<ReturnType<typeof UserManagementRepository.findUserById>>>;

export function toUserResponse(user: UserWithRole): DashboardUserResponse {
  return {
    id:    user.id,
    name:  user.name,
    email: user.email,
    role:  user.userRole!.role.name,
  };
}
