import prisma from '../../../lib/prisma';
import { MenuRepository } from './menu.repository';
export class MenuService {
 static async getMenuItem(itemId: number): Promise<any> {
    const menuItem = await MenuRepository.findMenuItemById(prisma, itemId);
    return menuItem;
  }
}
