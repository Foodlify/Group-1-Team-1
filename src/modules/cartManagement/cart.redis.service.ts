import { CartRedisRepository } from './cart.redis.repository';
import { MenuService } from '../restaurantManagemet/menu.service';
import { MenuRepository } from '../restaurantManagemet/menu.repository';
import { RestaurantRepository } from '../restaurantManagemet/restaurant.repository';
import prisma from '../../../lib/prisma';

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
import { PriceNotMatch } from '../orderManagment/order.exception';
import { Prisma } from '@prisma/client/extension';

export class CartRedisService {
  // ─── Helper: validate menu item & stock (Prisma read) ────────────────────────
  private static async validateMenuItem(itemId: number, quantity: number) {
    const menuItem = await MenuService.getMenuItem(itemId);
    if (!menuItem) {
      throw new MenuItemNotFound(errorMessage.MENU_ITEM_NOT_FOUND.message);
    }
    if (quantity > menuItem.stock) {
      throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
    }
    return menuItem;
  }

  // ─── Add To Cart ─────────────────────────────────────────────────────────────
  static async addToCart(input: CartItemInput): Promise<CartItemResponse> {
    const { customerId, itemId, itemQuantity } = input;

    // Validate menu item & stock via Prisma (read-only, no tx needed)
    const menuItem = await CartRedisService.validateMenuItem(itemId, itemQuantity);

    // Load existing Redis cart
    const cart = await CartRedisRepository.findCartByCustomerId(customerId);

    if (!cart) {
      // No cart yet — create one with the first item
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
      // Cart already exists
      if (cart.isLocked) {
        throw new Error("This cart is locked, you can't add anything to it");
      }

      // Enforce single-restaurant rule
      if (cart.restaurantId !== menuItem.restaurantId) {
        throw new RestaurantNotMatch(errorMessage.RESTAURANT_NOT_MATCH.message);
      }

      // Prevent duplicate menu items in the same cart
      const duplicate = cart.items.find((ci) => ci.menuItemId === itemId);
      if (duplicate) {
        throw new ItemIdempotency(errorMessage.ITEM_IDEMPOTENCY.message);
      }

      await CartRedisRepository.addItemToCart(customerId, {
        menuItemId: menuItem.id,
        name: menuItem.itemName,
        price: Number(menuItem.price),
        quantity: itemQuantity,
      });
    }

    return { customerId, itemId, itemQuantity, itemName: menuItem.itemName };
  }

  // ─── View Cart ────────────────────────────────────────────────────────────────
  static async viewCart(customerId: number): Promise<ViewCartResponse | String> {
    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) return 'Customer has no cart';

    return {
      cartId: customerId, // Redis carts are customer-scoped; customerId acts as the cart ID
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

    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) throw new NOT_FOUND(ENTITIES.CART);

    // itemId is the cart-item ID (auto-incremented inside Redis)
    const cartItem = cart.items.find((ci) => ci.id === itemId);
    if (!cartItem) throw new NOT_FOUND(ENTITIES.CART_ITEM);

    // Validate new quantity against current stock (Prisma read)
    const menuItem = await CartRedisService.validateMenuItem(
      cartItem.menuItemId,
      itemQuantity,
    );

    const updated = await CartRedisRepository.updateCartItemQuantity(
      customerId,
      cartItem.id,
      itemQuantity,
    );
    if (!updated) throw new BAD_REQUEST(ENTITIES.CART_ITEM);

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

    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) throw new NOT_FOUND(ENTITIES.CART);

    const cartItem = cart.items.find((ci) => ci.id === itemId);
    if (!cartItem) throw new NOT_FOUND(ENTITIES.CART_ITEM);

    if (cart.items.length === 1) {
      // Last item → clear the whole cart
      await CartRedisRepository.clearCart(customerId);
    } else {
      await CartRedisRepository.deleteCartItem(customerId, cartItem.id);
    }

    return { itemId: cartItem.id, itemName: cartItem.name };
  }

  // ─── Clear Cart ───────────────────────────────────────────────────────────────
  static async clearCart(customerId: number): Promise<void> {
    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    await CartRedisRepository.clearCart(customerId);
  }

  // ─── Total Price & Quantity ───────────────────────────────────────────────────
  static async getTotalPriceAndQuantity(
    customerId: number,
  ): Promise<{ totalPrice: number; totalQuantity: number }> {
    const cart = await CartRedisRepository.findCartByCustomerId(customerId);
    if (!cart) throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);

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

    return { totalPrice, totalQuantity };
  }
}
