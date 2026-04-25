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
  MenuItemNotFound,
  QuantityExceed,
  RestaurantNotMatch,
} from './cart.execption';
import { errorMessage } from '../../shared_infrastructure/error/errorMessages';

export class CartService {
  async getCustomerCart(customerId: number) {
    const cart = await CartRepository.findCartByCustomerId(customerId);
    return cart;
  }

  // ─── Add To Cart ───────────────────────────────────────────────────────────
  async addToCart(input: CartItemInput): Promise<CartItemResponse> {
    const { customerId, itemId, itemQuantity } = input;

    // 1. Check if cart already exists for this user
    let cart = await this.getCustomerCart(customerId);
    // 2. Check if item already exists in menuItems table
    const menuItem = await MenuRepository.findMenuItemById(itemId);
    if (!menuItem) {
      throw new MenuItemNotFound(errorMessage.MENU_ITEM_NOT_FOUND.message);
    }
    console.log(menuItem);
    // 3. if cart not exist and menuitem exist create new cart and add item to it
    if (!cart && menuItem) {
      cart = await CartRepository.createCartAndCartItems(
        customerId,
        itemQuantity,
        menuItem,
      );
    }

    // 4. If cart exists and has items, enforce single-restaurant rule
    if (cart && cart.cartItems.length > 0) {
      // avoid idempotency of entering same item again
      const existingItem = await CartRepository.findCartItemByIdAndCartId(
        cart.id,
        menuItem.id,
      );
      if (existingItem) {
        throw new Error('item already in the cart');
      }
      const existingRestaurantId = cart.restaurantId;

      if (existingRestaurantId !== menuItem.restaurantId) {
        throw new RestaurantNotMatch(errorMessage.RESTAURANT_NOT_MATCH.message);
      }
      // 5. check if menuItem stock is enough
      if (itemQuantity > menuItem.stock) {
        throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
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
  async viewCart(customerId: number): Promise<ViewCartResponse> {
    const cart = await this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
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
    const { customerId, itemId, itemQuantity } = input;
    const cart = this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const cartItem = await CartRepository.findCartItemById(itemId);
    if (!cartItem) {
      throw new CartItemNotFound(errorMessage.CART_ITEM_NOT_FOUND.message);
    }

    const menuItem = await MenuRepository.findMenuItemById(cartItem.id);
    if (!menuItem) {
      throw new MenuItemNotFound(errorMessage.MENU_ITEM_NOT_FOUND.message);
    }
    if (itemQuantity > menuItem.stock) {
      throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
    }
    const updateItem = await CartRepository.upsertCartItem(
      itemId,
      itemQuantity,
    );
    return {
      customerId,
      itemId,
      itemQuantity,
      itemName: cartItem.name,
    };
  }

  // ─── Delete Cart Item ────────────────────────────────────────────────────────────
  async deleteCartItem(
    input: DeleteCartItemInput,
  ): Promise<DeleteCartItemResponse> {
    const { customerId, itemId } = input;
    const cart = await this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const cartItem = await CartRepository.findCartItemById(itemId);
    if (!cartItem) {
      throw new CartItemNotFound(errorMessage.CART_ITEM_NOT_FOUND.message);
    }
    const deletedItem = await CartRepository.deleteCartItem(cart.id, itemId);
    return {
      itemId: cartItem.id,
      itemName: cartItem.name,
    };
  }

  // ─── Clear Cart ────────────────────────────────────────────────────────────

  async clearCart(customerId: number): Promise<void> {
    const cart = await this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    await CartRepository.clearCart(cart.id);
  }

  async getTotalPrice(customerId: number): Promise<number> {
    const cart = await this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const totalPrice = cart.cartItems.reduce(
      (sum: number, item: CartItems) =>
        sum + (item.quantity ?? 0) * (item.price ?? 0),
      0,
    );
    return totalPrice;
  }
  async getTotalQuantity(customerId: number): Promise<number> {
    const cart = await this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const totalQuantity = cart.cartItems.reduce(
      (sum: number, item: CartItems) => sum + (item.quantity ?? 0),
      0,
    );
    return totalQuantity;
  }
}
