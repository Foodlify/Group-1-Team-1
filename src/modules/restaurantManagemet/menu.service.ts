import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { MenuRepository } from './menu.repository';
export class MenuService {
  static async getMenuItem(
    itemId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const menuItem = await MenuRepository.findMenuItemById(itemId, db);
    return menuItem;
  }
  static async increaseMenuItemStock(
    item: any,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const menuItem = await MenuRepository.incrementMenuItemStock(item, db);
    return menuItem;
  }
  static async decreaseMenuItemStock(
    item: any,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const menuItem = await MenuRepository.decrementMenuItemStock(item, db);
    return menuItem;
  }
}
