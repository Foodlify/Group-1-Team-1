import { MenuRepository } from './menu.repository';
export class MenuService {
 static async getMenuItem(itemId: number): Promise<any> {
    const menuItem = await MenuRepository.findMenuItemById(itemId);
    return menuItem;
  }
}
