import { CartRepository } from './cart.repository';
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
  MenuItemNotFound,
  QuantityExceed,
  RestaurantNotMatch,
} from './cart.execption';
import { errorMessage } from '../../shared_infrastructure/error/errorMessages';

export class CartService {
  async getCustomerCart(customerId: number) {
    const cart = await CartRepository.findCartByCustomerId(customerId);
    if (!cart) {
      return null;
    }
    return cart;
  }

  // ─── Add To Cart ───────────────────────────────────────────────────────────

  async addToCart(input: CartItemInput): Promise<CartItemResponse> {
    const { customerId, itemId, itemQuantity } = input;

    // 2. Check if cart already exists for this user
    let cart = await this.getCustomerCart(customerId);

    // 3. If cart exists and has items, enforce single-restaurant rule
    if (cart && cart.cartItems.length > 0) {
      const existingRestaurantId = cart.restaurantId;
      // get menuItem from menuitem table
      const menuItem;

      if (existingRestaurantId !== menuItem.restaurantId) {
        throw new RestaurantNotMatch(errorMessage.RESTAURANT_NOT_MATCH.message);
      }
    }

    if (quantity > menuItem.quantity) {
      throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
    }

    const cartItem = CartRepository.createCartItem();
    // 4. Create empty cart if none exists
    if (!cart) {
      cart = await CartRepository.createCartAndCartItems(
        customerId,
        itemId,
        itemQuantity,
        menuItem,
      );
    }

    return {
      customerId,
      itemId,
      itemQuantity,
      itemName: '',
    };
  }

  // ─── View Cart ─────────────────────────────────────────────────────────────

  //   export interface CartItem {
  //   itemId: number;
  //   itemQuantity: number;
  //   itemPrice: number;
  //   ItemName: String;
  // }
  // export interface ViewCartResponse {
  //   cartId: number;
  //   cartItems: CartItem[];
  // }

  async viewCart(customerId: number): Promise<ViewCartResponse> {
    const cart = this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }

    return {
      cartId: cart.id,
      cartItems: cart.cartItems.map((ci: any) => ({
        ItemId: ci.id,
        itemQuantity: ci.quantity,
        itemName: ci.menuItem.itemName,
        itemPrice: ci.menuItem.price,
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

    const menuItem = await CartRepository.findMenuItemById(item.menuItemId);
    if (!menuItem) {
      throw new MenuItemNotFound(errorMessage.MENU_ITEM_NOT_FOUND.message);
    }
    if (itemQuantity > menuItem.quantity) {
      throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
    }
    const updateItem = await CartRepository.upsertCartItem(
      itemId,
      itemQuantity,
    );
    return {
      itemId,
      itemQuantity,
      itemName: menuItem.name,
    };
  }

  // ─── Delete Cart Item ────────────────────────────────────────────────────────────
  async deleteCartItem(
    input: DeleteCartItemInput,
  ): Promise<DeleteCartItemResponse> {
    const { customerId, itemId } = input;
    const cart = this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }
    const deletedItem = await CartRepository.deleteCartItem(cart.id, itemId);
    return {
      itemId: deletedItem.id,
      itemName: deletedItem.name,
    };
  }

  // ─── Clear Cart ────────────────────────────────────────────────────────────

  async clearCart(customerId: number): Promise<void> {
    const cart = this.getCustomerCart(customerId);
    if (!cart) {
      throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
    }

    await CartRepository.clearCart(cart.id);
  }

  async getTotalPrice(customerId: number): Promise<number> {
    const cart = this.getCustomerCart(customerId);
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
    const cart = this.getCustomerCart(customerId);
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
