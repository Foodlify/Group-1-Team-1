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
      await tx.refreshToken.deleteMany({ where: { userId } });
      await tx.userRole.deleteMany({ where: { userId } });
      return tx.user.delete({ where: { id: userId } });
    });
  }

  static async updatePassword(userId: number, passwordHash: string, db: Prisma.TransactionClient = prisma) {
    return db.user.update({ where: { id: userId }, data: { password: passwordHash } });
  }

  // ── Role queries ─────────────────────────────────────────────────────────────

  static async findRoleByName(name: RoleEnum, db: Prisma.TransactionClient = prisma) {
    return db.role.findUnique({ where: { name } });
  }

  // ── Refresh token queries ─────────────────────────────────────────────────────

  static async createRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    meta?: { ip?: string; deviceInfo?: string },
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        ipAddress:  meta?.ip,
        deviceInfo: meta?.deviceInfo,
      },
    });
  }

  static async findActiveRefreshToken(tokenHash: string, db: Prisma.TransactionClient = prisma) {
    return db.refreshToken.findFirst({
      where: {
        tokenHash,
        revoked:   false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  static async revokeRefreshToken(tokenHash: string, db: Prisma.TransactionClient = prisma) {
    return db.refreshToken.updateMany({
      where: { tokenHash },
      data:  { revoked: true },
    });
  }

  static async revokeAllUserRefreshTokens(userId: number, db: Prisma.TransactionClient = prisma) {
    return db.refreshToken.updateMany({
      where: { userId, revoked: false },
      data:  { revoked: true },
    });
  }
}
