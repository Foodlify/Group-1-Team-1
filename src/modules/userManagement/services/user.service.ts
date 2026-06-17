import { RoleEnum } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { UserManagementRepository } from '../repositories/userManagement.repository';
import {
  UserNotFound,
  UserEmailTaken,
  RoleNotFound,
} from '../user.exception';
import { CreateUserInput, UpdateUserInput, DashboardUserResponse } from '../user.model';
import { toUserResponse } from '../user.helpers';
import { hashPassword } from '../../../shared_infrastructure/auth/password.helper';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { USER_TYPE } from '../../../shared_infrastructure/auth/user-type.constants';

export class UserService {
  static async getAllUsers(): Promise<DashboardUserResponse[]> {
    loggerService.info('Fetching all dashboard users');
    const users = await UserManagementRepository.findAllAdminUsers();
    return users.map(toUserResponse);
  }

  static async getUser(userId: number): Promise<DashboardUserResponse> {
    loggerService.info('Fetching dashboard user', { userId });
    const user = await UserManagementRepository.findUserById(userId);
    if (!user || user.userTypeCode !== USER_TYPE.ADMIN) throw new UserNotFound();
    return toUserResponse(user);
  }

  static async createUser(data: CreateUserInput): Promise<DashboardUserResponse> {
    const { name, email, password, role } = data;
    loggerService.info('Creating dashboard user', { email, role });

    const existing = await UserManagementRepository.findUserByEmail(email);
    if (existing) throw new UserEmailTaken();

    const roleRecord = await UserManagementRepository.findRoleByName(role);
    if (!roleRecord) throw new RoleNotFound();

    const hashed = await hashPassword(password);

    const userId = await prisma.$transaction(async (tx) => {
      const user = await UserManagementRepository.createUser(
        { name, email, password: hashed, userTypeCode: USER_TYPE.ADMIN },
        tx,
      );
      await UserManagementRepository.assignRole(user.id, roleRecord.id, tx);
      return user.id;
    });

    const user = await UserManagementRepository.findUserById(userId);
    loggerService.info('Dashboard user created', { userId, role });
    return toUserResponse(user!);
  }

  static async updateUser(userId: number, data: UpdateUserInput): Promise<DashboardUserResponse> {
    loggerService.info('Updating dashboard user', { userId });

    const existing = await UserManagementRepository.findUserById(userId);
    if (!existing || existing.userTypeCode !== USER_TYPE.ADMIN) throw new UserNotFound();

    if (data.email && data.email !== existing.email) {
      const taken = await UserManagementRepository.findUserByEmail(data.email);
      if (taken) throw new UserEmailTaken();
    }

    const user = await UserManagementRepository.updateUser(userId, data);
    loggerService.info('Dashboard user updated', { userId });
    return toUserResponse(user);
  }

  static async deleteUser(userId: number): Promise<void> {
    loggerService.info('Deleting dashboard user', { userId });
    const existing = await UserManagementRepository.findUserById(userId);
    if (!existing || existing.userTypeCode !== USER_TYPE.ADMIN) throw new UserNotFound();
    await UserManagementRepository.deleteUser(userId);
    loggerService.info('Dashboard user deleted', { userId });
  }
}
