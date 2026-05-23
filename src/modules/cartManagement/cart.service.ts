import prisma from '../../../lib/prisma';
import { CartRepository } from './cart.repository';
import { MenuRepository } from '../restaurantManagemet/menu.repository';
import { CartRedisRepository } from './cart.redis.repository';
import loggerService from '../../shared_infrastructure/logger/logger';

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
import { MenuService } from '../restaurantManagemet/Services/menu.service';
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
    loggerService.info('Fetching customer cart', { customerId });
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    loggerService.info('Customer cart fetched', { customerId, found: !!cart });
    return cart;
  }

  static async checkQuantity(
    itemId: number,
    itemQuantity: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const menuItem = await MenuService.getMenuItem(itemId, db);
    if (!menuItem) {
      loggerService.warn('Menu item not found during quantity check', {
        itemId,
      });
      throw new MenuItemNotFound(errorMessage.MENU_ITEM_NOT_FOUND.message);
    }
    if (itemQuantity > menuItem.stock) {
      loggerService.warn('Quantity exceeds stock', {
        itemId,
        requested: itemQuantity,
        stock: menuItem.stock,
      });
      throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
    }
    return menuItem;
  }

  // ─── Add To Cart ───────────────────────────────────────────────────────────
  static async addToCart(input: CartItemInput): Promise<CartItemResponse> {
    const { customerId, itemId, itemQuantity } = input;
    loggerService.info('Add to cart attempt', {
      customerId,
      itemId,
      itemQuantity,
    });

    return await prisma.$transaction(async (db: Prisma.TransactionClient) => {
      let cart = await CartRepository.findCartByCustomerId(customerId, db);
      const menuItem = await CartService.checkQuantity(
        itemId,
        itemQuantity,
        db,
      );

      if (!cart || (cart === null && menuItem)) {
        loggerService.info('Creating new cart with item', {
          customerId,
          itemId,
        });
        cart = await CartRepository.createCartAndCartItems(
          customerId,
          itemQuantity,
          menuItem,
          db,
        );
      } else if (cart && cart.cartItems.length > 0) {
        if (cart.isLocked) {
          loggerService.warn('Add to cart failed: cart is locked', {
            customerId,
            cartId: cart.id,
          });
          throw new Error("This cart is locked, you can't add anything to it");
        }

        const existingItem = cart.cartItems.find(
          (ci: any) => ci.menuItemId === itemId,
        );
        if (existingItem) {
          loggerService.warn('Add to cart failed: item already in cart', {
            customerId,
            itemId,
          });
          throw new ItemIdempotency(errorMessage.ITEM_IDEMPOTENCY.message);
        }

        if (cart.restaurantId !== menuItem.restaurantId) {
          loggerService.warn('Add to cart failed: restaurant mismatch', {
            customerId,
            cartRestaurantId: cart.restaurantId,
            itemRestaurantId: menuItem.restaurantId,
          });
          throw new RestaurantNotMatch(
            errorMessage.RESTAURANT_NOT_MATCH.message,
          );
        }

        await CartRepository.createCartItem(
          cart.id,
          itemQuantity,
          menuItem,
          db,
        );
      }

      loggerService.info('Item added to cart', {
        customerId,
        itemId,
        itemQuantity,
        itemName: menuItem.itemName,
      });
      return { customerId, itemId, itemQuantity, itemName: menuItem.itemName };
    });
  }

  // ─── View Cart ─────────────────────────────────────────────────────────────
  static async viewCart(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<ViewCartResponse | String> {
    loggerService.info('View cart request', { customerId });
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    if (!cart || cart === null) {
      loggerService.info('No cart found for customer', { customerId });
      return 'Customer has no cart';
    }
    loggerService.info('Cart retrieved', {
      customerId,
      cartId: cart.id,
      itemCount: cart.cartItems.length,
    });
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
    const { customerId, itemId, itemQuantity } = input;
    loggerService.info('Update cart item quantity', {
      customerId,
      itemId,
      itemQuantity,
    });

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const cart = await CartRepository.findCartByCustomerId(customerId, tx);
      if (!cart) {
        loggerService.warn('Update quantity failed: cart not found', {
          customerId,
        });
        throw new NOT_FOUND(ENTITIES.CART);
      }
      const cartItem = cart.cartItems.find((ci: any) => ci.id === itemId);
      if (!cartItem) {
        loggerService.warn('Update quantity failed: cart item not found', {
          customerId,
          itemId,
        });
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
        loggerService.warn('Update quantity failed: could not update item', {
          customerId,
          itemId,
        });
        throw new BAD_REQUEST(ENTITIES.CART_ITEM);
      }
      loggerService.info('Cart item quantity updated', {
        customerId,
        itemId: updatedItem.id,
        itemQuantity: updatedItem.quantity,
      });
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
    loggerService.info('Delete cart item attempt', { customerId, itemId });

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const cart = await CartRepository.findCartByCustomerId(customerId, db);
      if (!cart) {
        loggerService.warn('Delete cart item failed: cart not found', {
          customerId,
        });
        throw new NOT_FOUND(ENTITIES.CART);
      }
      const cartItem = cart.cartItems.find((ci: any) => ci.id === itemId);
      if (!cartItem) {
        loggerService.warn('Delete cart item failed: item not found', {
          customerId,
          itemId,
        });
        throw new NOT_FOUND(ENTITIES.CART_ITEM);
      }
      if (cart.cartItems.length === 1) {
        loggerService.info('Last item in cart — clearing entire cart', {
          customerId,
          cartId: cart.id,
        });
        await CartRepository.clearCart(cart.id, db);
      } else {
        await CartRepository.deleteCartItem(cart.id, cartItem.id, db);
      }
      loggerService.info('Cart item deleted', {
        customerId,
        itemId: cartItem.id,
        itemName: cartItem.name,
      });
      return { itemId: cartItem.id, itemName: cartItem.name };
    });
  }

  // ─── Clear Cart ────────────────────────────────────────────────────────────
  static async clearCart(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    loggerService.info('Clear cart attempt', { customerId });
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    if (!cart || cart === null) {
      loggerService.warn('Clear cart failed: cart not found', { customerId });
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    await CartRepository.clearCart(cart.id, db);
    await CartRedisRepository.clearCart(customerId);
    loggerService.info('Cart cleared', { customerId, cartId: cart.id });
  }

  static async getTotalPriceAndQuantity(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    loggerService.info('Get cart totals', { customerId });
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    if (!cart || cart === null) {
      loggerService.warn('Get totals failed: cart not found', { customerId });
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
    loggerService.info('Cart totals calculated', {
      customerId,
      totalPrice,
      totalQuantity,
    });
    return { totalPrice, totalQuantity };
  }

  static async validCartAntItemsForOrder(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Validating cart for order', { customerId });
    const cart = await CartRepository.findCartByCustomerId(customerId, db);
    if (!cart || cart === null) {
      loggerService.warn('Cart validation failed: cart not found', {
        customerId,
      });
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const restaurant = await RestaurantRepository.findRestaurantById(
      cart.restaurantId,
      db,
    );
    if (!restaurant) {
      loggerService.warn('Cart validation failed: restaurant not found', {
        customerId,
        restaurantId: cart.restaurantId,
      });
      throw new NOT_FOUND(ENTITIES.RESTAURANT);
    }
    for (const ci of cart.cartItems) {
      const { menuItemId, quantity, price } = ci;
      const menuItem = await MenuRepository.findMenuItemById(menuItemId, db);
      if (!menuItem) {
        loggerService.warn('Cart validation failed: menu item not found', {
          customerId,
          menuItemId,
        });
        throw new NOT_FOUND(ENTITIES.MENU_ITEM);
      }
      if (price != menuItem?.price) {
        loggerService.warn('Cart validation failed: price mismatch', {
          customerId,
          menuItemId,
          cartPrice: price,
          currentPrice: menuItem.price,
        });
        throw new PriceNotMatch(
          `${menuItem.itemName}: ${errorMessage.PRICE_NOT_MATCH.message}`,
        );
      }
      if (quantity > menuItem.stock) {
        loggerService.warn('Cart validation failed: quantity exceeds stock', {
          customerId,
          menuItemId,
          quantity,
          stock: menuItem.stock,
        });
        throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
      }
      const totalPrice = cart.cartItems.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0,
      );
      loggerService.info('Cart validated for order', {
        customerId,
        cartId: cart.id,
        totalPrice,
      });
      return { cart, totalPrice };
    }
  }

  static async LockCart(cartId: number, db: Prisma.TransactionClient = prisma) {
    loggerService.info('Locking cart', { cartId });
    const lockedCart = await CartRepository.LockCart(cartId, db);
    if (lockedCart) {
      await CartRedisRepository.lockCart(lockedCart.customerId);
      loggerService.info('Cart locked', {
        cartId,
        customerId: lockedCart.customerId,
      });
    }
    return lockedCart;
  }

  static async unLockCart(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Unlocking cart', { customerId });
    const result = await CartRepository.unLockCart(customerId, db);
    loggerService.info('Cart unlocked', { customerId });
    return result;
  }

  static async archiveCart(cart: any, db: Prisma.TransactionClient = prisma) {
    loggerService.info('Archiving cart', {
      cartId: cart?.id,
      customerId: cart?.customerId,
    });
    const result = await CartRepository.archiveCart(cart, db);
    loggerService.info('Cart archived', { cartId: cart?.id });
    return result;
  }
}
