import { Prisma } from '@prisma/client/extension';
import prisma from '../../../lib/prisma';
import { errorMessage } from '../../shared_infrastructure/error/errorMessages';
import {
  CartItemNotFound,
  CartNotFound,
  QuantityExceed,
} from './cart.execption';
import {
  CartItemInput,
  CartItemResponse,
  DeleteCartItemInput,
  DeleteCartItemResponse,
} from './cart.model';


export class CartRepository {
  /**  Check a cart is existed or not */
  static async findCartByCustomerId(customerId: number) {
    return prisma.cart.findUnique({
      where: { customerId },
      include: { cartItems: true },
    });
  }
  static async findCartItemById(id: number) {
    const item = prisma.cartItem.findUnique({
      where: { id },
    });
    return item;
  }
  static async findCartItemByIdAndCartId(cartId: number, itemId: number) {
    return prisma.cartItem.findUnique({
      where: {
        cartId_menuItemId: {
          cartId,
          menuItemId: itemId,
        },
      },
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
    menuItem: any,
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

  /** Add item to existing cart */
  static async createCartItem(cartId: number, quantity: number, menuItem: any) {
    const item = await prisma.cartItem.create({
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
  static async updateQuantityTransaction(
    input: CartItemInput,
  ): Promise<CartItemResponse> {
    const { customerId, itemId, itemQuantity } = input;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get cart
      const cart = await tx.cart.findFirst({
        where: { customerId },
      });

      if (!cart) {
        throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
      }

      // 2. Get cart item
      const cartItem = await tx.cartItem.findUnique({
        where: { id: itemId },
      });

      if (!cartItem) {
        throw new CartItemNotFound(errorMessage.CART_ITEM_NOT_FOUND.message);
      }

      // 3. Get menu item (stock check)
      const menuItem = await tx.menuItem.findUnique({
        where: { id: cartItem.menuItemId },
      });

      if (!menuItem || menuItem.quantity < itemQuantity) {
        throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
      }

      // 4. Update cart item quantity
      const updatedItem = await tx.cartItem.update({
        where: { id: cartItem.id },
        data: {
          quantity: itemQuantity,
        },
      });

      return {
        customerId,
        itemId: updatedItem.id,
        itemQuantity: updatedItem.quantity,
        itemName: menuItem.name,
      };
    });
  }

  static async deleteCartItemTransaction(
    input: DeleteCartItemInput,
  ): Promise<DeleteCartItemResponse> {
    const { customerId, itemId } = input;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get cart with items
      const cart = await tx.cart.findFirst({
        where: { customerId },
        include: { cartItems: true },
      });

      if (!cart) {
        throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
      }

      // 2. Find the cart item (scoped to this cart)
      const cartItem = cart.cartItems.find((ci: any) => ci.id === itemId);

      if (!cartItem) {
        throw new CartItemNotFound(errorMessage.CART_ITEM_NOT_FOUND.message);
      }

      // 3. If last item → delete whole cart
      if (cart.cartItems.length === 1) {
        await tx.cart.delete({
          where: { id: cart.id },
        });
      } else {
        // 4. Otherwise delete only the item
        await tx.cartItem.delete({
          where: { id: cartItem.id },
        });
      }

      return {
        itemId: cartItem.id,
        itemName: cartItem.name,
      };
    });
  }
}
