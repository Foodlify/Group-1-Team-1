import prisma from '../../../lib/prisma';

export class CartRepository {
  // ─── User ──────────────────────────────────────────────────────────────────

  static async findUserById(userId: number) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  // ─── Restaurant ────────────────────────────────────────────────────────────

  static async findRestaurantById(restaurantId: number) {
    return prisma.restaurant.findUnique({ where: { id: restaurantId } });
  }

  // ─── Cart ──────────────────────────────────────────────────────────────────

  /** Find a cart with its items and the related menu items (for restaurant check) */
  static async findCartByUserId(userId: number) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: { menuItem: { include: { menu: true } } },
        },
      },
    });
  }

  /** Create an empty cart for a user */
  static async createCart(userId: number) {
    return prisma.cart.create({ data: { userId } });
  }

  /** Delete all cart items first, then delete the cart */
  static async clearCart(cartId: number) {
    await prisma.cartItem.deleteMany({ where: { cartId } });
    await prisma.cart.delete({ where: { id: cartId } });
  }

  // ─── Menu Items ────────────────────────────────────────────────────────────

  /** Find a menu item by id, also returns the parent menu (for restaurant check) */
  static async findMenuItemById(itemId: number) {
    return prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { menu: true },
    });
  }

  // ─── Cart Items ────────────────────────────────────────────────────────────

  /** Upsert a cart item — update quantity if it already exists */
  static async upsertCartItem(
    cartId: number,
    menuItemId: number,
    quantity: number,
  ) {
    const existing = await prisma.cartItem.findFirst({
      where: { cartId, menuItemId },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity },
      });
    }

    return prisma.cartItem.create({ data: { cartId, menuItemId, quantity } });
  }

  /** Delete cart item from  cart */
  static async deleteCartItem(cartId: number, cartItemId: number) {
    await prisma.cartItem.delete({ where: { cartId: cartId, id: cartItemId } });
  }
  
  /** Return full cart with items for the response */
  static async getCartWithItems(cartId: number) {
    return prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        cartItems: {
          include: { menuItem: true },
        },
      },
    });
  }

  static async getCarts() {
    return prisma.cart.findMany();
  }
}
