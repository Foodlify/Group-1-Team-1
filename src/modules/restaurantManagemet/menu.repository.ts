import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
export class MenuRepository {
  static async findMenuItemById(tx: Prisma.TransactionClient, itemId: number) {
    return tx.menuItem.findUnique({
      where: { id: itemId },
    });
  }
  static async decrementMenuItemStock(tx: Prisma.TransactionClient, item: any) {
    const updated = await tx.menuItem.updateMany({
      where: {
        id: item.id,
        stock: { gte: item.quantity }, // ensure enough stock
      },
      data: {
        stock: { decrement: item.quantity },
      },
    });
    return updated
  }
  static async incrementMenuItemStock(tx: Prisma.TransactionClient, item: any) {
    const updated = await tx.menuItem.updateMany({
      where: {
        id: item.id,
      },
      data: {
        stock: { increment: item.quantity },
      },
    });
    return updated
  }
}
