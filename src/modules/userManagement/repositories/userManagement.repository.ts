import { RoleEnum, Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { USER_TYPE } from '../../../shared_infrastructure/auth/user-type.constants';
import { decodeUnsafe } from '../../../shared_infrastructure/auth/jwt.helper';

export class UserManagementRepository {
  // ── User queries ────────────────────────────────────────────────────────────

  static async findUserByEmail(email: string, db: Prisma.TransactionClient = prisma) {
    return db.user.findUnique({
      where:   { email },
      include: { userRole: { include: { role: true } } },
    });
  }

  static async findUserById(userId: number, db: Prisma.TransactionClient = prisma) {
    return db.user.findUnique({
      where:   { id: userId },
      include: { userRole: { include: { role: true } } },
    });
  }

  static async cleanupExpiredRefreshToken(token: string): Promise<void> {
    try {
      const decoded = decodeUnsafe(token) as { userId?: number } | null;
      if (decoded?.userId) {
        const user = await UserManagementRepository.findUserById(decoded.userId);
        if (user?.refreshToken === token) {
          await UserManagementRepository.updateRefreshToken(decoded.userId, null);
        }
      }
    } catch {}
  }

  static async findAllAdminUsers(db: Prisma.TransactionClient = prisma) {
    return db.user.findMany({
      where:   { userTypeCode: USER_TYPE.ADMIN },
      include: { userRole: { include: { role: true } } },
      orderBy: { id: 'asc' },
    });
  }

  static async createUser(
    data: { name: string; email: string; password: string; userTypeCode: string },
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.create({ data });
  }

  static async assignRole(userId: number, roleId: number, db: Prisma.TransactionClient = prisma) {
    return db.userRole.create({ data: { userId, roleId } });
  }

  static async updateUser(
    userId: number,
    data: { name?: string; email?: string },
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.update({
      where:   { id: userId },
      data,
      include: { userRole: { include: { role: true } } },
    });
  }

  static async deleteUser(userId: number) {
    return prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      return tx.user.delete({ where: { id: userId } });
    });
  }

  static async updateRefreshToken(userId: number, refreshToken: string | null, db: Prisma.TransactionClient = prisma) {
    return db.user.update({ where: { id: userId }, data: { refreshToken } });
  }

  static async updatePassword(userId: number, passwordHash: string, db: Prisma.TransactionClient = prisma) {
    return db.user.update({ where: { id: userId }, data: { password: passwordHash } });
  }

  // ── Role queries ─────────────────────────────────────────────────────────────

  static async findRoleByName(name: RoleEnum, db: Prisma.TransactionClient = prisma) {
    return db.role.findUnique({ where: { name } });
  }
}
