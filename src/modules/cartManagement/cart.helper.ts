import { CartRepository } from './cart.repository';

type CartItemWithMenu = {
  quantity: number;
  menuItem: {
    price: number;
  };
};
export class CartHelper {
  static async getTotalPrice(cartId: number) {
    const cart = await CartRepository.getCartWithItems(cartId);
    const totalPrice = cart.cartItems.reduce(
      (sum: number, item: CartItemWithMenu) =>
        sum + (item.quantity ?? 0) * (item.menuItem?.price ?? 0),
      0,
    );
    return totalPrice;
  }
  static async getTotalQuantity(cartId: number) {
    const cart = await CartRepository.getCartWithItems(cartId);
    const totalQuantity = cart.cartItems.reduce(
      (sum: number, item: CartItemWithMenu) => sum + (item.quantity ?? 0),
      0,
    );
    return totalQuantity;
  }
}
