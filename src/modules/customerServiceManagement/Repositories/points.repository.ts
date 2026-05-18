import prisma from '../../../../lib/prisma';
import { LoyaltyType, Prisma } from '@prisma/client';
class LoyaltyPointsRepository {
  static async getCustomerPoints(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const points = await db.loyaltyPoints.findUnique({
      where: {
        customerId,
      },
    });
    return points;
  }
  static async getCustomerPointsByOrderId(
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const points = await db.loyaltyPoints.findUnique({
      where: {
        orderId,
      },
    });
    return points;
  }

  static async addPointsToCustomer(
    customerId: number,
    orderId: number,
    points: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await db.loyaltyPoints.upsert({
      where: {
        customerId,
      },
      update: {
        orderId,
        points: {
          increment: points,
        },
      },
      create: {
        customerId,
        orderId,
        points,
        expiresAt,
        loyaltyPointsTransaction: {
          create: {
            customerId,
            orderId,
            type: LoyaltyType.EARN,
            points,
          },
        },
      },
    });
  }
  static async redeemPointsOfCustomer(
    customerId: number,
    points: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    await db.loyaltyPoints.update({
      where: {
        customerId,
      },
      data: {
        points: {
          decrement: points,
        },
        loyaltyPointsTransaction: {
          create: {
            customerId,
            type: LoyaltyType.REDEEM,
            points,
          },
        },
      },
    });
  }
  static async expirePointsOfCustomer(
    customerId: number,
    points: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    await db.loyaltyPoints.update({
      where: {
        customerId,
      },
      data: {
        points: 0,
        loyaltyPointsTransaction: {
          create: {
            customerId,
            type: LoyaltyType.EXPIRE,
            points,
          },
        },
      },
    });
  }
}

export default LoyaltyPointsRepository;
