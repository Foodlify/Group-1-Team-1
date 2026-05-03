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
  CartItemNotFound,
  CartNotFound,
  ItemIdempotency,
  MenuItemNotFound,
  QuantityExceed,
  RestaurantNotMatch,
} from './cart.execption';
import { errorMessage } from '../../shared_infrastructure/error/errorMessages';
import { MenuService } from '../restaurantManagemet/menu.service';
import { NOT_FOUND } from '../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../prisma/entities';
import { RestaurantRepository } from '../restaurantManagemet/restaurant.repository';
import { PriceNotMatch } from '../orderManagment/order.exception';
import { Prisma } from '@prisma/client/extension';

export class CartService {
  async getCustomerCart(customerId: number) {
    const cart = await CartRepository.findCartAndCartItems(customerId);
    return cart;
  }
  async checkQuantity(itemId: number, itemQuantity: number) {
    const menuItem = await MenuService.getMenuItem(itemId);
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
  async addToCart(input: CartItemInput): Promise<CartItemResponse> {
    // add transaction
    const { customerId, itemId, itemQuantity } = input;

    // 1. Check if cart already exists for this user
    let cart = await this.getCustomerCart(customerId);
    const menuItem = await this.checkQuantity(itemId, itemQuantity);
    // 3. if cart not exist and menuitem exist create new cart and add item to it
    if (!cart || (cart === null && menuItem)) {
      cart = await CartRepository.createCartAndCartItems(
        customerId,
        itemQuantity,
        menuItem,
      );
    }
    // 4. If cart exists and has items, enforce single-restaurant rule
    else if (cart && cart.cartItems.length > 0) {
      // avoid idempotency of entering same item again
      const existingItem = await CartRepository.findCartItemByIdAndCartId(
        cart.id,
        menuItem.id,
      );
      if (existingItem) {
        throw new ItemIdempotency(errorMessage.ITEM_IDEMPOTENCY.message);
      }
      // enforce one restaurant rule
      const existingRestaurantId = cart.restaurantId;

      if (existingRestaurantId !== menuItem.restaurantId) {
        throw new RestaurantNotMatch(errorMessage.RESTAURANT_NOT_MATCH.message);
      }

      const cartItem = await CartRepository.createCartItem(
        cart.id,
        itemQuantity,
        menuItem,
      );
    }
    return {
      customerId,
      itemId,
      itemQuantity,
      itemName: menuItem.itemName,
    };
  }

  // ─── View Cart ─────────────────────────────────────────────────────────────
  async viewCart(customerId: number): Promise<ViewCartResponse | String> {
    const cart = await this.getCustomerCart(customerId);
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

  async updateQuantity(input: CartItemInput): Promise<CartItemResponse> {
    // add transaction
    const { customerId, itemId, itemQuantity } = input;
    try {
      const result = await CartRepository.updateQuantityTransaction(input);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ─── Delete Cart Item ────────────────────────────────────────────────────────────
  async deleteCartItem(
    input: DeleteCartItemInput,
  ): Promise<DeleteCartItemResponse> {
    // add transaction
    const { customerId, itemId } = input;
    try {
      const result = await CartRepository.deleteCartItemTransaction(input);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ─── Clear Cart ────────────────────────────────────────────────────────────

  async clearCart(customerId: number): Promise<void> {
    const cart = await this.getCustomerCart(customerId);
    if (!cart || cart === null) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    await CartRepository.clearCart(cart.id);
  }

  async getTotalPriceAndQuantity(customerId: number): Promise<any> {
    const cart = await this.getCustomerCart(customerId);
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
  static async validCartAntItems(customerId: number) {
    return await prisma.$transaction(async (tx:Prisma.TransactionClient) => {
      // Check if  customer has a cart
      const cart = await CartRepository.findCartByCustomerId(tx, customerId);
      if (!cart) {
        throw new NOT_FOUND(ENTITIES.CART);
      }
      // Check if  restaurant exist
      const restaurant = await RestaurantRepository.findRestaurantById(
        tx,
        cart.restaurantId,
      );
      if (!restaurant) {
        throw new NOT_FOUND(ENTITIES.RESTAURANT);
      }
      // Check cart items
      for (const ci of cart.cartItems) {
        const { menuItemId, quantity, price } = ci;
        const menuItem = await MenuRepository.findMenuItemById(tx, menuItemId);

        if (!menuItem) {
          throw new NOT_FOUND(ENTITIES.MENU_ITEM);
        }
        if (quantity > menuItem?.stock) {
          throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
        }
        if (price != menuItem?.price) {
          throw new PriceNotMatch(
            `${menuItem.itemName}: ${errorMessage.PRICE_NOT_MATCH.message}`,
          );
        }
      }
      //  Calculate total price
      const totalPrice = cart.cartItems.reduce(
        (sum: number, item: { price: number; quantity: number; }) => sum + item.price * item.quantity,
        0,
      );
      return { cart, totalPrice };
    });
  }
}
