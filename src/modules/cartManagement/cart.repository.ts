import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { PrismaClient } from '@prisma/client/extension';

export class CartRepository {
  /**  Check a cart is existed or not */
  static async findCartByCustomerId(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.cart.findUnique({
      where: { customerId },
      include: { cartItems: true },
    });
  }
  static async findCartItemById(
    id: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const item = db.cartItem.findUnique({
      where: { id },
    });
    return item;
  }
  /** Create new cart and add its item in one query */
  static async createCartAndCartItems(
    customerId: number,
    quantity: number,
    menuItem: any,
    db: Prisma.TransactionClient = prisma,
  ) {
    const cartWithItems = await db.cart.create({
      data: {
        customerId,
        restaurantId: menuItem.restaurantId,
        cartItems: {
          create: [
            {
              menuItemId: menuItem.id,
              quantity,
              price: menuItem.price,
              name: menuItem.itemName,
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

  /** Create new cart and add multiple items efficiently using nested createMany */
  static async createCartWithManyItems(
    customerId: number,
    restaurantId: number,
    items: { menuItemId: number; quantity: number; price: number; name: string }[],
    db: Prisma.TransactionClient = prisma,
  ) {
    const cartWithItems = await db.cart.create({
      data: {
        customerId,
        restaurantId,
        cartItems: {
          createMany: {
            data: items,
          },
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
    menuItem: any,
    db: Prisma.TransactionClient = prisma,
  ) {
    const item = await db.cartItem.create({
      data: {
        cartId,
        quantity,
        menuItemId: menuItem.id,
        price: menuItem.price,
        name: menuItem.itemName,
      },
    });
    return item;
  }

  /** Delete One cart Item */
  static async deleteCartItem(
    cartId: number,
    cartItemId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const deletedItem = await db.cartItem.delete({
      where: { cartId: cartId, id: cartItemId },
    });
    return deletedItem;
  }

  /** Upsert a cart item — update quantity if it already exists */
  static async updateCartItem(
    itemId: number,
    quantity: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const result = db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return result;
  }

  /** Delete all cart items first, then delete the cart */
  static async clearCart(
    cartId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    await db.cartItem.deleteMany({ where: { cartId } });
    const deletedCart = await db.cart.delete({ where: { id: cartId } });
    return deletedCart;
  }

  static async LockCart(
    id: number,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    console.log(typeof db);
    return db.cart.update({
      where: { id },
      data: { isLocked: true, lockedAt: new Date() },
    });
  }
  static async unLockCart(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const result = await db.cart.update({
      where: { customerId },
      data: { isLocked: false, lockedAt: null },
    });
    return result;
  }
  static async archiveCart(cart: any, db: Prisma.TransactionClient = prisma) {
    return await db.cartArchive.create({
      data: {
        cartId: cart.id,
        customerId: cart.customerId,
        restaurantId: cart.restaurantId,
        cartData: {
          items: cart.cartItems,
        },
      },
    });
  }
  static async getCarts(db: Prisma.TransactionClient = prisma) {
    return db.cart.findMany();
  }
}
