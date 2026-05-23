import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
export class RestaurantRepository {
  static async findRestaurantById(
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menuItem.findUnique({
      where: { id: restaurantId },
      include: { menu: true },
    });
  }
}
