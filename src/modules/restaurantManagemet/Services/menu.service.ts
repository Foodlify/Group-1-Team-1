import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { MenuRepository } from '../Repositories/menu.repository';
import { RestaurantRepository } from '../Repositories/restaurant.repository';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../../prisma/entities';
import loggerService from '../../../shared_infrastructure/logger/logger';

export class MenuService {
  // ─── Cache invalidation helpers ──────────────────────────────────────────────

  private static async invalidateMenuCache(restaurantId: number, menuId?: number) {
    await redisClient.del('restaurants:all');
    await redisClient.del(`restaurants:restaurant-${restaurantId}`);
    if (menuId) {
      await redisClient.del(`restaurants:restaurant-${restaurantId}:menu-${menuId}`);
    }
  }

  private static async invalidateMenuItemCache(menuId: number, menuItemId?: number) {
    if (menuItemId) {
      await redisClient.del(`restaurants:menus:menu-${menuId}:menu-item-${menuItemId}`);
    }
  }

  // ─── Menu mutations ───────────────────────────────────────────────────────────

  static async createMenu(
    restaurantId: number,
    name: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Create menu', { restaurantId, name });
    const restaurant = await RestaurantRepository.findRestaurantById(restaurantId, db);
    if (!restaurant) throw new NOT_FOUND(ENTITIES.RESTAURANT);
    const menu = await MenuRepository.createMenu(restaurantId, name, db);
    await MenuService.invalidateMenuCache(restaurantId);
    loggerService.info('Menu created', { menuId: menu.id, restaurantId });
    return menu;
  }

  static async updateMenu(
    menuId: number,
    restaurantId: number,
    name: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Update menu', { menuId, restaurantId });
    const restaurant = await RestaurantRepository.findRestaurantById(restaurantId, db);
    if (!restaurant) throw new NOT_FOUND(ENTITIES.RESTAURANT);
    const existing = await MenuRepository.getMenuById(restaurantId, menuId, db);
    if (!existing) throw new NOT_FOUND(ENTITIES.MENU);
    const menu = await MenuRepository.updateMenu(menuId, restaurantId, name, db);
    await MenuService.invalidateMenuCache(restaurantId, menuId);
    loggerService.info('Menu updated', { menuId });
    return menu;
  }

  static async deleteMenu(
    menuId: number,
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Delete menu', { menuId, restaurantId });
    const restaurant = await RestaurantRepository.findRestaurantById(restaurantId, db);
    if (!restaurant) throw new NOT_FOUND(ENTITIES.RESTAURANT);
    const existing = await MenuRepository.getMenuById(restaurantId, menuId, db);
    if (!existing) throw new NOT_FOUND(ENTITIES.MENU);
    await MenuRepository.deleteMenu(menuId, restaurantId, db);
    await MenuService.invalidateMenuCache(restaurantId, menuId);
    loggerService.info('Menu deleted', { menuId });
  }

  // ─── MenuItem mutations ───────────────────────────────────────────────────────

  static async createMenuItem(
    data: { menuId: number; restaurantId: number; itemName: string; price: number; stock: number },
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Create menu item', { menuId: data.menuId });
    const menuExists = await MenuRepository.getMenuById(data.restaurantId, data.menuId, db);
    if (!menuExists) throw new NOT_FOUND(ENTITIES.MENU);
    const item = await MenuRepository.createMenuItem(data, db);
    await MenuService.invalidateMenuCache(data.restaurantId, data.menuId);
    loggerService.info('Menu item created', { menuItemId: item.id });
    return item;
  }

  static async updateMenuItem(
    menuItemId: number,
    menuId: number,
    restaurantId: number,
    data: { itemName?: string; price?: number; stock?: number },
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Update menu item', { menuItemId, menuId });
    const existing = await MenuRepository.getMenuItem(menuId, menuItemId, db);
    if (!existing) throw new NOT_FOUND(ENTITIES.MENU_ITEM);
    const item = await MenuRepository.updateMenuItem(menuItemId, menuId, data, db);
    await MenuService.invalidateMenuCache(restaurantId, menuId);
    await MenuService.invalidateMenuItemCache(menuId, menuItemId);
    loggerService.info('Menu item updated', { menuItemId });
    return item;
  }

  static async deleteMenuItem(
    menuItemId: number,
    menuId: number,
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Delete menu item', { menuItemId, menuId });
    const existing = await MenuRepository.getMenuItem(menuId, menuItemId, db);
    if (!existing) throw new NOT_FOUND(ENTITIES.MENU_ITEM);
    await MenuRepository.deleteMenuItem(menuItemId, menuId, db);
    await MenuService.invalidateMenuCache(restaurantId, menuId);
    await MenuService.invalidateMenuItemCache(menuId, menuItemId);
    loggerService.info('Menu item deleted', { menuItemId });
  }

  // ─── Reads ────────────────────────────────────────────────────────────────────

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
