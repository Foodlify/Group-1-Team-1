import { CartRepository } from './cart.repository';
import {
  AddToCartInput,
  CartResult,
  DeleteCartItemInput,
  DeleteCartItemResult,
  ModifyCartInput,
  ModifyCartResult,
} from './cart.model';
import { ErrorStatus } from '../../middlewares/error_handling/error_codes';
import { ServiceError } from '../../middlewares/error_handling/error-handling';
import { CartHelper } from './cart.helper';

export class CartService {
  async getCartAndItem(cartId: number, itemId: number) {
    const cart = await CartRepository.getCartWithItems(cartId);
    if (!cart) {
      throw new ServiceError(
        `Cart with id ${cartId} does not exist`,
        ErrorStatus.NOT_FOUND,
      );
    }
    // Find if item in cart
    const item = cart.cartItems.find((ci: { id: number }) => ci.id === itemId);
    if (!item) {
      throw new ServiceError(
        `Item with menuItemId ${itemId} not found in cart`,
        ErrorStatus.NOT_FOUND,
      );
    }
    return { cart, item };
  }
  // ─── Add To Cart ───────────────────────────────────────────────────────────

  async addToCart(input: AddToCartInput): Promise<CartResult> {
    const { customerId, restaurantId, items } = input;

    // 1. Validate user and restaurant exist
    const user = await CartRepository.findUserById(customerId);
    if (!user) {
      throw new ServiceError(`User with id ${customerId} does not exist`, 404);
    }

    const restaurant = await CartRepository.findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new ServiceError(
        `Restaurant with id ${restaurantId} does not exist`,
        404,
      );
    }

    // 2. Check if cart already exists for this user
    let cart = await CartRepository.findCartByUserId(customerId);

    // 3. If cart exists and has items, enforce single-restaurant rule
    if (cart && cart.cartItems.length > 0) {
      const existingRestaurantId = cart.cartItems[0].menuItem.menu.restaurantId;

      if (existingRestaurantId !== restaurantId) {
        throw new ServiceError(
          'Your cart already contains items from another restaurant. ' +
            'Only one restaurant is allowed per cart. ' +
            'Please clear your cart first if you want to order from a different restaurant.',
          400,
        );
      }
    }

    // 4. Create empty cart if none exists
    if (!cart) {
      const newCart = await CartRepository.createCart(customerId);
      cart = { ...newCart, cartItems: [] };
    }

    const cartId = cart.id;

    // 5. Validate each item and upsert into cart
    const itemErrors: string[] = [];
    for (const { itemId, quantity } of items) {
      const menuItem = await CartRepository.findMenuItemById(itemId);

      if (!menuItem) {
        itemErrors.push(`Menu item with id ${itemId} does not exist`);
        continue;
      }

      if (menuItem.menu.restaurantId !== restaurantId) {
        itemErrors.push(
          `Menu item "${menuItem.itemName}" (id: ${itemId}) does not belong to restaurant ${restaurantId}`,
        );
        continue;
      }

      if (quantity > menuItem.quantity) {
        itemErrors.push(
          `Requested quantity (${quantity}) for "${menuItem.itemName}" exceeds available stock (${menuItem.quantity})`,
        );
        continue;
      }

      await CartRepository.upsertCartItem(cartId, itemId, quantity);
    }

    if (itemErrors.length > 0) {
      throw new ServiceError(
        'Some items could not be added to the cart',
        402,
        itemErrors,
      );
    }

    // 6. Return the updated cart
    const updatedCart = await CartRepository.getCartWithItems(cartId);

    return {
      cartId: updatedCart!.id,
      userId: updatedCart!.customerId,
      items: updatedCart!.cartItems.map((ci: any) => ({
        cartItemId: ci.id,
        cartId: ci.cartId,
        menuItemId: ci.menuItemId,
        quantity: ci.quantity,
        itemName: ci.menuItem.itemName,
        price: ci.menuItem.price,
      })),
    };
  }

  // ─── View Cart ─────────────────────────────────────────────────────────────

  async viewCart(customerId: number): Promise<CartResult | null> {
    const cart = await CartRepository.findCartByUserId(customerId);
    if (!cart) return null;

    return {
      cartId: cart.id,
      userId: cart.customerId,
      items: cart.cartItems.map((ci: any) => ({
        cartItemId: ci.id,
        cartId: ci.cartId,
        menuItemId: ci.menuItemId,
        quantity: ci.quantity,
        itemName: ci.menuItem.itemName,
        price: ci.menuItem.price,
      })),
    };
  }

  // ─── Update Item Quantity ──────────────────────────────────────────────────

  async updateQuantity(
    input: ModifyCartInput,
  ): Promise<ModifyCartResult | null> {
    const { customerId, itemId, itemQuantity } = input;
    const cart = await CartRepository.findCartByUserId(customerId);
    if (!cart) return null;

    const { item } = await this.getCartAndItem(cart.id, itemId);
    const menuItem = await CartRepository.findMenuItemById(item.id);
    if (!menuItem) {
      throw new ServiceError(
        `Menu item with id ${itemId} does not exist`,
        ErrorStatus.NOT_FOUND,
      );
    }
    if (itemQuantity > menuItem.quantity) {
      throw new ServiceError(
        `Requested quantity (${itemQuantity}) exceeds available stock (${menuItem.quantity})`,
        ErrorStatus.BAD_REQUEST,
      );
    }

    const updateItem = await CartRepository.upsertCartItem(
      cart.id,
      item.id,
      itemQuantity,
    );
    if (!updateItem) {
      throw new ServiceError(
        'failed in update quantity of item',
        ErrorStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const totalPrice = await CartHelper.getTotalPrice(cart);
    const totalQuantity = await CartHelper.getTotalQuantity(cart);
    return {
      customerId,
      cartId: updateItem.cartId,
      itemId: updateItem.id,
      itemQuantity: updateItem.quantity,
      totalPrice,
      totalQuantity,
    };
  }

  // ─── Delete Cart Item ────────────────────────────────────────────────────────────
  async deleteCartItem(
    input: DeleteCartItemInput,
  ): Promise<DeleteCartItemResult | null> {
    const { customerId, itemId } = input;
    const cart = await CartRepository.findCartByUserId(customerId);
    if (!cart) return null;
    const { item } = await this.getCartAndItem(cart.id, itemId);
    const deletedItem = await CartRepository.deleteCartItem(cart.id, item.id);
    if (!deletedItem) {
      throw new ServiceError(
        'failed in deleting  the item',
        ErrorStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      customerId,
      itemId: deletedItem.id,
      cartId: deletedItem.cartId,
    };
  }

  // ─── Clear Cart ────────────────────────────────────────────────────────────

  async clearCart(customerId: number): Promise<void> {
    const cart = await CartRepository.findCartByUserId(customerId);
    if (!cart) {
      throw new ServiceError(
        `Cart for user with id ${customerId} does not exist`,
        404,
      );
    }

    await CartRepository.clearCart(cart.id);
  }
}
