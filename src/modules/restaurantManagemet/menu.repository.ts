import prisma from '../../../lib/prisma';
export class MenuRepository {
  static async findMenuItemById(itemId: number) {
    return prisma.menuItem.findUnique({
      where: { id: itemId },
    });
  }
}
