import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
export class MenuRepository {
  static async findMenuItemById(
    itemId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menuItem.findUnique({
      where: { id: itemId },
    });
  }
  static async decrementMenuItemStock(
    item: any,
    db: Prisma.TransactionClient = prisma,
  ) {
    const updated = await db.menuItem.updateMany({
      where: {
        id: item.menuItemId,
        stock: { gte: item.quantity }, // ensure enough stock
      },
      data: {
        stock: { decrement: item.quantity },
      },
    });
    return updated;
  }
  static async incrementMenuItemStock(
    item: any,
    db: Prisma.TransactionClient = prisma,
  ) {
    const updated = await db.menuItem.updateMany({
      where: {
        id: item.id,
      },
      data: {
        stock: { increment: item.quantity },
      },
    });
    return updated;
  }
}
