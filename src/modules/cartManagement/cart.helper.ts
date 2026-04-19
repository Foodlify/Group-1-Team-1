import { CartResult } from './cart.model';
import { CartRepository } from './cart.repository';

type CartItemWithMenu = {
  quantity: number;
  menuItem: {
    price: number;
  };
};
type Cart = {
  cartItems: CartItemWithMenu[];
};
export class CartHelper {
  static async getTotalPrice(cart: Cart): Promise<number> {
    const totalPrice = cart!.cartItems.reduce(
      (sum: number, item: CartItemWithMenu) =>
        sum + (item.quantity ?? 0) * (item.menuItem?.price ?? 0),
      0,
    );
    return totalPrice;
  }
  static async getTotalQuantity(cart: Cart): Promise<number> {
    const totalQuantity = cart!.cartItems.reduce(
      (sum: number, item: CartItemWithMenu) => sum + (item.quantity ?? 0),
      0,
    );
    return totalQuantity;
  }
}
