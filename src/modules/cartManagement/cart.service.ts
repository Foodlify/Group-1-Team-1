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

export class CartService {
  async getCustomerCart(customerId: number) {
    const cart = await CartRepository.findCartByCustomerId(customerId);
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
    const cart = this.getCustomerCart(customerId);
    if (!cart || cart === null) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const cartItem = await CartRepository.findCartItemById(itemId);
    if (!cartItem) {
      throw new CartItemNotFound(errorMessage.CART_ITEM_NOT_FOUND.message);
    }

    const menuItem = await this.checkQuantity(itemId, itemQuantity);
    await CartRepository.upsertCartItem(itemId, itemQuantity);
    return {
      customerId,
      itemId,
      itemQuantity,
      itemName: menuItem.name,
    };
  }

  // ─── Delete Cart Item ────────────────────────────────────────────────────────────
  async deleteCartItem(
    input: DeleteCartItemInput,
  ): Promise<DeleteCartItemResponse> {
    // add transaction
    const { customerId, itemId } = input;
    const cart = await this.getCustomerCart(customerId);
    if (!cart || cart === null) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const cartItem = await CartRepository.findCartItemById(itemId);
    if (!cartItem) {
      throw new CartItemNotFound(errorMessage.CART_ITEM_NOT_FOUND.message);
    }
    if (cart.cartItems.length === 1) {
      await CartRepository.clearCart(cart.id);
    }
    await CartRepository.deleteCartItem(cart.id, itemId);
    return {
      itemId: cartItem.id,
      itemName: cartItem.name,
    };
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
    // make one loop 
    const totalPrice = cart.cartItems.reduce(
      (sum: number, item: CartItems) =>
        sum + (item.quantity ?? 0) * (item.price ?? 0),
      0,
    );
    const totalQuantity = cart.cartItems.reduce(
      (sum: number, item: CartItems) => sum + (item.quantity ?? 0),
      0,
    );

    return { totalPrice, totalQuantity };
  }
}
