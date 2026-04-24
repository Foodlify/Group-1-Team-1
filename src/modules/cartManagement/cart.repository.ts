import prisma from '../../../lib/prisma';

type menuItemType = {
  id: number;
  price: number;
  name: string;
};
export class CartRepository {
  /**  Check a cart is existed or not */
  static async findCartByCustomerId(customerId: number) {
    return prisma.cart.findUnique({
      where: { customerId },
    });
  }
  static async findCartItemById(itemId: number) {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
    });
  }

  /** Find a cart with its items to view cart  */
  static async findCartAndCartItems(customerId: number) {
    return prisma.cart.findUnique({
      where: { customerId },
      include: { cartItems: true },
    });
  }

  /** Create new cart and add its item in one query */
  static async createCartAndCartItems(
    customerId: number,
    quantity: number,
    menuItem: menuItemType,
  ) {
    const cartWithItems = await prisma.cart.create({
      data: {
        customerId,
        restaurantId: menuItem.restaurantId,
        cartItems: {
          create: [
            {
              menuItemId: menuItem.id,
              quantity,
              price: menuItem.price,
              name: menuItem.name,
            },
          ],
        },
      },
      include: {
        cartItems: true,
      },
    });
    return cartWithItems;
  }

  /** Add item to existing cart */
  static async createCartItem(
    cartId: number,
    quantity: number,
    menuItem: menuItemType,
  ) {
    const item = await prisma.cartItem.create({
      data: {
        cartId,
        quantity,
        menuItemId: menuItem.id,
        price: menuItem.price,
        name: menuItem.name,
      },
    });
    return item;
  }

  /** Delete all cart items first, then delete the cart */
  static async clearCart(cartId: number) {
    await prisma.cartItem.deleteMany({ where: { cartId } });
    const deletedCart = await prisma.cart.delete({ where: { id: cartId } });
    return deletedCart;
  }

  /** Delete One cart Item */
  static async deleteCartItem(cartId: number, cartItemId: number) {
    const deletedItem = await prisma.cartItem.delete({
      where: { cartId: cartId, id: cartItemId },
    });
    return deletedItem;
  }

  /** Upsert a cart item — update quantity if it already exists */
  static async upsertCartItem(itemId: number, quantity: number) {
    const result = prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return result;
  }

  /** Get All carts  */
  static async getCarts() {
    return prisma.cart.findMany();
  }
}
