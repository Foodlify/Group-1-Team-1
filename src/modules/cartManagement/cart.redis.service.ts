import { CartRedisRepository } from './cart.redis.repository';
import { MenuService } from '../restaurantManagemet/Services/menu.service';
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
import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../prisma/entities';

export class CartRedisService {
  // ─── Helper: validate menu item & stock (Prisma read) ────────────────────────
  private static async validateMenuItem(itemId: number, quantity: number) {
    const menuItem = await MenuService.getMenuItem(itemId);
    if (!menuItem) {
      loggerService.warn('Menu item not found', { itemId });
      throw new MenuItemNotFound(errorMessage.MENU_ITEM_NOT_FOUND.message);
    }
    if (quantity > menuItem.stock) {
      loggerService.warn('Quantity exceeds stock', {
        itemId,
        requested: quantity,
        stock: menuItem.stock,
      });
      throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
    }
    return menuItem;
  }

  // ─── Add To Cart ─────────────────────────────────────────────────────────────
  static async addToCart(input: CartItemInput): Promise<CartItemResponse> {
    const { customerId, itemId, itemQuantity } = input;
    loggerService.info('Redis add to cart attempt', {
      customerId,
      itemId,
      itemQuantity,
    });

    const menuItem = await CartRedisService.validateMenuItem(
      itemId,
      itemQuantity,
    );
    const cart = await CartRedisRepository.findCartByCustomerId(customerId);

    if (!cart) {
      loggerService.info('Creating new Redis cart with item', {
        customerId,
        itemId,
      });
      await CartRedisRepository.createCartWithItem(
        customerId,
        menuItem.restaurantId,
        {
          menuItemId: menuItem.id,
          name: menuItem.itemName,
          price: Number(menuItem.price),
          quantity: itemQuantity,
        },
      );
    } else {
      if (cart.isLocked) {
        loggerService.warn('Redis add to cart failed: cart is locked', {
          customerId,
        });
        throw new Error("This cart is locked, you can't add anything to it");
      }
      if (cart.restaurantId !== menuItem.restaurantId) {
        loggerService.warn('Redis add to cart failed: restaurant mismatch', {
          customerId,
          cartRestaurantId: cart.restaurantId,
          itemRestaurantId: menuItem.restaurantId,
        });
        throw new RestaurantNotMatch(errorMessage.RESTAURANT_NOT_MATCH.message);
      }
      const duplicate = cart.items.find((ci) => ci.menuItemId === itemId);
      if (duplicate) {
        loggerService.warn('Redis add to cart failed: item already in cart', {
          customerId,
          itemId,
        });
        throw new ItemIdempotency(errorMessage.ITEM_IDEMPOTENCY.message);
      }
      await CartRedisRepository.addItemToCart(customerId, {
        menuItemId: menuItem.id,
        name: menuItem.itemName,
        price: Number(menuItem.price),
        quantity: itemQuantity,
      });
    }

    loggerService.info('Item added to Redis cart', {
      customerId,
      itemId,
      itemName: menuItem.itemName,
    });
    return { customerId, itemId, itemQuantity, itemName: menuItem.itemName };
  }

  // ─── View Cart ────────────────────────────────────────────────────────────────
  static async viewCart(
    customerId: number,
  ): Promise<ViewCartResponse | String> {
    loggerService.info('Redis view cart', { customerId });
    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) {
      loggerService.info('No Redis cart found', { customerId });
      return 'Customer has no cart';
    }
    loggerService.info('Redis cart retrieved', {
      customerId,
      itemCount: cart.items.length,
    });
    return {
      cartId: customerId,
      cartItems: cart.items.map((ci) => ({
        itemId: ci.id,
        itemQuantity: ci.quantity,
        itemPrice: ci.price,
        itemName: ci.name,
      })),
    };
  }

  // ─── Update Item Quantity ─────────────────────────────────────────────────────
  static async updateQuantity(input: CartItemInput): Promise<CartItemResponse> {
    const { customerId, itemId, itemQuantity } = input;
    loggerService.info('Redis update cart item quantity', {
      customerId,
      itemId,
      itemQuantity,
    });

    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) {
      loggerService.warn('Redis update quantity failed: cart not found', {
        customerId,
      });
      throw new NOT_FOUND(ENTITIES.CART);
    }

    const cartItem = cart.items.find((ci) => ci.id === itemId);
    if (!cartItem) {
      loggerService.warn('Redis update quantity failed: item not found', {
        customerId,
        itemId,
      });
      throw new NOT_FOUND(ENTITIES.CART_ITEM);
    }

    const menuItem = await CartRedisService.validateMenuItem(
      cartItem.menuItemId,
      itemQuantity,
    );
    const updated = await CartRedisRepository.updateCartItemQuantity(
      customerId,
      cartItem.id,
      itemQuantity,
    );
    if (!updated) {
      loggerService.warn('Redis update quantity failed: could not update', {
        customerId,
        itemId,
      });
      throw new BAD_REQUEST(ENTITIES.CART_ITEM);
    }

    loggerService.info('Redis cart item quantity updated', {
      customerId,
      itemId: updated.id,
      itemQuantity: updated.quantity,
    });
    return {
      customerId,
      itemId: updated.id,
      itemQuantity: updated.quantity,
      itemName: menuItem.itemName,
    };
  }

  // ─── Delete Cart Item ─────────────────────────────────────────────────────────
  static async deleteCartItem(
    input: DeleteCartItemInput,
  ): Promise<DeleteCartItemResponse> {
    const { customerId, itemId } = input;
    loggerService.info('Redis delete cart item', { customerId, itemId });

    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) {
      loggerService.warn('Redis delete item failed: cart not found', {
        customerId,
      });
      throw new NOT_FOUND(ENTITIES.CART);
    }

    const cartItem = cart.items.find((ci) => ci.id === itemId);
    if (!cartItem) {
      loggerService.warn('Redis delete item failed: item not found', {
        customerId,
        itemId,
      });
      throw new NOT_FOUND(ENTITIES.CART_ITEM);
    }

    if (cart.items.length === 1) {
      loggerService.info('Last item in Redis cart — clearing entire cart', {
        customerId,
      });
      await CartRedisRepository.clearCart(customerId);
    } else {
      await CartRedisRepository.deleteCartItem(customerId, cartItem.id);
    }

    loggerService.info('Redis cart item deleted', {
      customerId,
      itemId: cartItem.id,
      itemName: cartItem.name,
    });
    return { itemId: cartItem.id, itemName: cartItem.name };
  }

  // ─── Clear Cart ───────────────────────────────────────────────────────────────
  static async clearCart(customerId: number): Promise<void> {
    loggerService.info('Redis clear cart', { customerId });
    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) {
      loggerService.warn('Redis clear cart failed: cart not found', {
        customerId,
      });
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    await CartRedisRepository.clearCart(customerId);
    loggerService.info('Redis cart cleared', { customerId });
  }

  // ─── Total Price & Quantity ───────────────────────────────────────────────────
  static async getTotalPriceAndQuantity(
    customerId: number,
  ): Promise<{ totalPrice: number; totalQuantity: number }> {
    loggerService.info('Redis get cart totals', { customerId });
    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) {
      loggerService.warn('Redis get totals failed: cart not found', {
        customerId,
      });
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }

    const { totalPrice, totalQuantity } = cart.items.reduce(
      (acc: { totalQuantity: number; totalPrice: number }, item: CartItems) => {
        const quantity = item.quantity ?? 0;
        const price = item.price ?? 0;
        acc.totalQuantity += quantity;
        acc.totalPrice += quantity * price;
        return acc;
      },
      { totalQuantity: 0, totalPrice: 0 },
    );

    loggerService.info('Redis cart totals calculated', {
      customerId,
      totalPrice,
      totalQuantity,
    });
    return { totalPrice, totalQuantity };
  }
}
