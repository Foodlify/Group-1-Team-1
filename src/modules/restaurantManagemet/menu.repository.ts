import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
export class MenuRepository {
  static async findMenuItemById(tx: Prisma.TransactionClient, itemId: number) {
    return tx.menuItem.findUnique({
      where: { id: itemId },
    });
  }
}
