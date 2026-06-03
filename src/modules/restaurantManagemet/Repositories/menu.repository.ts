import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
export class MenuRepository {
  // ─── Menu CRUD ───────────────────────────────────────────────────────────────

  static async createMenu(
    restaurantId: number,
    name: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menu.create({
      data: { restaurantId, name },
      include: { menuItems: true },
    });
  }

  static async updateMenu(
    menuId: number,
    restaurantId: number,
    name: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menu.update({
      where: { id: menuId, restaurantId },
      data: { name },
      include: { menuItems: true },
    });
  }

  static async deleteMenu(
    menuId: number,
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menu.delete({
      where: { id: menuId, restaurantId },
    });
  }

  // ─── MenuItem CRUD ───────────────────────────────────────────────────────────

  static async createMenuItem(
    data: { menuId: number; restaurantId: number; itemName: string; price: number; stock: number },
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menuItem.create({ data });
  }

  static async updateMenuItem(
    menuItemId: number,
    menuId: number,
    data: { itemName?: string; price?: number; stock?: number },
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menuItem.update({
      where: { id: menuItemId, menuId },
      data,
    });
  }

  static async deleteMenuItem(
    menuItemId: number,
    menuId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menuItem.delete({
      where: { id: menuItemId, menuId },
    });
  }

  // ─── Reads ───────────────────────────────────────────────────────────────────

  static async getMenuById(
    restaurantId: number,
    menuId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menu.findUnique({
      where: { id: menuId, restaurantId },
      include: { menuItems: true },
    });
  }
  static async getMenuItem(
    menuId: number,
    menuItemId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.menuItem.findUnique({
      where: { id: menuItemId, menuId },
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
