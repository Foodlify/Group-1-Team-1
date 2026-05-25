import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { MenuRepository } from '../Repositories/menu.repository';
export class MenuService {
  static async getMenu(
    restaurantId: number,
    menuId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const menu = await MenuRepository.getMenuById(restaurantId, menuId, db);
    return menu;
  }
  static async getMenuItemById(
    menuId: number,
    menuItemId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const menuItem = await MenuRepository.getMenuItem(menuId, menuItemId, db);
    return menuItem;
  }

  
  static async getMenuItem(
    itemId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const menuItem = await MenuRepository.findMenuItemById(itemId, db);
    return menuItem;
  }
  static async getMenuItemsByIds(
    itemIds: number[],
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    return await MenuRepository.findMenuItemsByIds(itemIds, db);
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
