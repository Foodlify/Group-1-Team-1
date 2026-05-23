import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
export class MenuRepository {
  static async getMenuById(
    menuId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menu.findUnique({
      where: { id: menuId },
      include: { menuItems: true },
    });
  }

  static async findMenuItemById(
    itemId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menuItem.findUnique({
      where: { id: itemId },
    });
  }
  static async findMenuItemsByIds(
    itemIds: number[],
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menuItem.findMany({
      where: { id: { in: itemIds } },
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
