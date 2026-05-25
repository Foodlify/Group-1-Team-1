import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
export class RestaurantRepository {
  static async findRestaurantById(
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menus: { include: { menuItems: true } } },
    });
  }
  static async getRestaurants(db: Prisma.TransactionClient = prisma) {
    const restaurants = await db.restaurant.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return restaurants;
  }
}
