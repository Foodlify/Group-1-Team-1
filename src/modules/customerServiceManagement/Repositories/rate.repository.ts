import prisma from '../../../../lib/prisma';
import { Prisma } from '@prisma/client';
class RateRepository {
  static async getRate(
    customerId: number,
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const rate = await db.restaurantRate.findUnique({
      where: {
        customerId,
        orderId,
      },
    });
    return rate;
  }

  static async insertRate(
    input: any,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const { customerId, orderId, restaurantId, rating, comment } = input;
    return await db.restaurantRate.create({
      data: {
        customerId,
        orderId,
        restaurantId,
        rating,
        comment,
      },
    });
  }

  static async getAllRestaurantRatings(
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    return await db.restaurantRate.findMany({
      where: {
        restaurantId,
      },
    });
  }
}

export default RateRepository;
