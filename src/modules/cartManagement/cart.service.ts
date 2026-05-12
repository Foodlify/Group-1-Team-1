import prisma from '../../../lib/prisma';
import { CartRepository } from './cart.repository';
import { MenuRepository } from '../restaurantManagemet/menu.repository';

import {
  CartItemInput,
  CartItemResponse,
  DeleteCartItemResponse,
  DeleteCartItemInput,
  ViewCartResponse,
  CartItems,
} from './cart.model';

import {
  CartNotFound,
  ItemIdempotency,
  MenuItemNotFound,
  QuantityExceed,
  RestaurantNotMatch,
} from './cart.execption';
import { errorMessage } from '../../shared_infrastructure/error/errorMessages';
import { MenuService } from '../restaurantManagemet/menu.service';
import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../prisma/entities';
import { RestaurantRepository } from '../restaurantManagemet/restaurant.repository';
import { PriceNotMatch } from '../orderManagment/order.exception';
import { Prisma } from '@prisma/client/extension';

export class CartService {
  static async getCustomerCart(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    return cart;
  }
  static async checkQuantity(
    itemId: number,
    itemQuantity: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const menuItem = await MenuService.getMenuItem(itemId, db);
    // 2. Check if item already exists in menuItems table
    if (!menuItem) {
      throw new MenuItemNotFound(errorMessage.MENU_ITEM_NOT_FOUND.message);
    }

    // 5. check if menuItem stock is enough
    if (itemQuantity > menuItem.stock) {
      throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
    }
    return menuItem;
  }

  // ─── Add To Cart ───────────────────────────────────────────────────────────
  static async addToCart(input: CartItemInput): Promise<CartItemResponse> {
    // add transaction
    const { customerId, itemId, itemQuantity } = input;
    return await prisma.$transaction(async (db: Prisma.TransactionClient) => {
      // 1. Check if cart already exists for this user
      let cart = await CartRepository.findCartByCustomerId(customerId, db);
      const menuItem = await CartService.checkQuantity(
        itemId,
        itemQuantity,
        db,
      );
      // 3. if cart not exist and menuitem exist create new cart and add item to it
      if (!cart || (cart === null && menuItem)) {
        cart = await CartRepository.createCartAndCartItems(
          customerId,
          itemQuantity,
          menuItem,
          db,
        );
      }
      // 4. If cart exists and has items, enforce single-restaurant rule
      else if (cart && cart.cartItems.length > 0) {
        if (cart.isLocked) {
          throw new Error("This cart is locked, you can't add anything to it");
        }
        // avoid idempotency of entering same item again
        const existingItem = cart.cartItems.find(
          (ci: any) => ci.menuItemId === itemId,
        );
        console.log(existingItem);
        if (existingItem) {
          throw new ItemIdempotency(errorMessage.ITEM_IDEMPOTENCY.message);
        }
        // enforce one restaurant rule
        const existingRestaurantId = cart.restaurantId;

        if (existingRestaurantId !== menuItem.restaurantId) {
          throw new RestaurantNotMatch(
            errorMessage.RESTAURANT_NOT_MATCH.message,
          );
        }

        const cartItem = await CartRepository.createCartItem(
          cart.id,
          itemQuantity,
          menuItem,
          db,
        );
      }
      return {
        customerId,
        itemId,
        itemQuantity,
        itemName: menuItem.itemName,
      };
    });
  }

  // ─── View Cart ─────────────────────────────────────────────────────────────
  static async viewCart(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<ViewCartResponse | String> {
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    // customer may doesn't have a cart, so it isn't error
    if (!cart || cart === null) {
      return 'Customer has no cart';
    }
    return {
      cartId: cart.id,
      cartItems: cart.cartItems.map((ci: any) => ({
        itemId: ci.id,
        itemQuantity: ci.quantity,
        itemPrice: ci.price,
        itemName: ci.name,
      })),
    };
  }

  // ─── Update Item Quantity ──────────────────────────────────────────────────

  static async updateQuantity(input: CartItemInput): Promise<CartItemResponse> {
    // add transaction
    const { customerId, itemId, itemQuantity } = input;
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const cart = await CartRepository.findCartByCustomerId(customerId, tx);
      if (!cart) {
        throw new NOT_FOUND(ENTITIES.CART);
      }
      const cartItem = cart.cartItems.find((ci: any) => ci.id === itemId);
      if (!cartItem) {
        throw new NOT_FOUND(ENTITIES.CART_ITEM);
      }
      const menuItem = await CartService.checkQuantity(
        cartItem.menuItemId,
        itemQuantity,
        tx,
      );
      const updatedItem = await CartRepository.updateCartItem(
        cartItem.id,
        itemQuantity,
        tx,
      );
      if (!updatedItem) {
        throw new BAD_REQUEST(ENTITIES.CART_ITEM);
      }
      return {
        customerId,
        itemId: updatedItem.id,
        itemQuantity: updatedItem.quantity,
        itemName: menuItem.itemName,
      };
    });
  }

  // ─── Delete Cart Item ────────────────────────────────────────────────────────────
  static async deleteCartItem(
    input: DeleteCartItemInput,
    db: Prisma.TransactionClient = prisma,
  ): Promise<DeleteCartItemResponse> {
    const { customerId, itemId } = input;
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const cart = await CartRepository.findCartByCustomerId(customerId, db);
      if (!cart) {
        throw new NOT_FOUND(ENTITIES.CART);
      }
      const cartItem = cart.cartItems.find((ci: any) => ci.id === itemId);
      if (!cartItem) {
        throw new NOT_FOUND(ENTITIES.CART_ITEM);
      }
      // 3. If last item → delete whole cart
      if (cart.cartItems.length === 1) {
        await CartRepository.clearCart(cart.id, db);
      } else {
        // 4. Otherwise delete only the item
        await CartRepository.deleteCartItem(cart.id, cartItem.id, db);
      }

      return {
        itemId: cartItem.id,
        itemName: cartItem.name,
      };
    });
  }

  // ─── Clear Cart ────────────────────────────────────────────────────────────

  static async clearCart(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    if (!cart || cart === null) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    await CartRepository.clearCart(cart.id, db);
  }

  static async getTotalPriceAndQuantity(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    if (!cart || cart === null) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const result = cart.cartItems.reduce(
      (acc: { totalQuantity: number; totalPrice: number }, item: CartItems) => {
        const quantity = item.quantity ?? 0;
        const price = item.price ?? 0;

        acc.totalQuantity += quantity;
        acc.totalPrice += quantity * price;

        return acc;
      },
      { totalQuantity: 0, totalPrice: 0 },
    );

    const { totalQuantity, totalPrice } = result;

    return { totalPrice, totalQuantity };
  }
  // Validate if cart exist and its items are valid to create order [is exist, is stock ok, is price changed]
  static async validCartAntItemsForOrder(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    if (!cart || cart === null) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    // Check if  restaurant exist
    const restaurant = await RestaurantRepository.findRestaurantById(
      cart.restaurantId,
      db,
    );
    if (!restaurant) {
      throw new NOT_FOUND(ENTITIES.RESTAURANT);
    }
    // Check cart items
    for (const ci of cart.cartItems) {
      const { menuItemId, quantity, price } = ci;
      // existence
      const menuItem = await MenuRepository.findMenuItemById(menuItemId, db);
      if (!menuItem) {
        throw new NOT_FOUND(ENTITIES.MENU_ITEM);
      }
      // Price
      if (price != menuItem?.price) {
        throw new PriceNotMatch(
          `${menuItem.itemName}: ${errorMessage.PRICE_NOT_MATCH.message}`,
        );
      }
      // Quantity
      if (quantity > menuItem.stock) {
        throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
      }
      //  Calculate total price
      const totalPrice = cart.cartItems.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0,
      );
      return { cart, totalPrice };
    }
  }
  static async LockCart(cartId: number, db: Prisma.TransactionClient = prisma) {
    return CartRepository.LockCart(cartId, db);
  }
  static async unLockCart(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return CartRepository.unLockCart(customerId, db);
  }
  static async archiveCart(cart: any, db: Prisma.TransactionClient = prisma) {
    return CartRepository.archiveCart(cart, db);
  }
}
