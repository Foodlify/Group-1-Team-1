import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { MenuRepository } from './menu.repository';
export class MenuService {
  static async getMenuItem(itemId: number): Promise<any> {
    const menuItem = await MenuRepository.findMenuItemById(prisma, itemId);
    return menuItem;
  }
  static async increaseMenuItemStock(
    tx: Prisma.TransactionClient,
    item: any,
  ): Promise<any> {
    const menuItem = await MenuRepository.incrementMenuItemStock(tx, item);
    return menuItem;
  }
  static async decreaseMenuItemStock(
    tx: Prisma.TransactionClient,
    item: any,
  ): Promise<any> {
    const menuItem = await MenuRepository.decrementMenuItemStock(tx, item);
    return menuItem;
  }
}
