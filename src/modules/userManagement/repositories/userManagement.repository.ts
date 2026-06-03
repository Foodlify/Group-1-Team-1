import { RoleEnum, Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { USER_TYPE } from '../../../shared_infrastructure/auth/user-type.constants';

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

  static async findAllDashboardUsers(db: Prisma.TransactionClient = prisma) {
    return db.user.findMany({
      where:   { userTypeCode: USER_TYPE.ADMIN },
      include: { userRole: { include: { role: true } } },
      orderBy: { id: 'asc' },
    });
  }

  static async createDashboardUser(
    data: { name: string; email: string; password: string },
    roleId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.create({
      data: {
        ...data,
        userTypeCode: USER_TYPE.ADMIN,
        userRole: { create: { roleId } },
      },
      include: { userRole: { include: { role: true } } },
    });
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

  static async updateUserEmail(userId: number, email: string, db: Prisma.TransactionClient = prisma) {
    return db.user.update({
      where: { id: userId },
      data:  { email },
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
