import { CartRepository } from './cart.repository';
import { AddToCartInput, CartResult } from './cart.model';

export class ServiceError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: unknown,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class CartService {
  // ─── Add To Cart ───────────────────────────────────────────────────────────

  async addToCart(input: AddToCartInput): Promise<CartResult> {
    const { userId, restaurantId, items } = input;

    // 1. Validate user and restaurant exist
    const user = await CartRepository.findUserById(userId);
    if (!user) {
      throw new ServiceError(`User with id ${userId} does not exist`, 404);
    }

    const restaurant = await CartRepository.findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new ServiceError(`Restaurant with id ${restaurantId} does not exist`, 404);
    }

    // 2. Check if cart already exists for this user
    let cart = await CartRepository.findCartByUserId(userId);

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
      const newCart = await CartRepository.createCart(userId);
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
      throw new ServiceError('Some items could not be added to the cart', 402, itemErrors);
    }

    // 6. Return the updated cart
    const updatedCart = await CartRepository.getCartWithItems(cartId);

    return {
      cartId: updatedCart!.id,
      userId: updatedCart!.userId,
      items: updatedCart!.cartItems.map((ci) => ({
        id: ci.id,
        cartId: ci.cartId,
        menuItemId: ci.menuItemId,
        quantity: ci.quantity,
        itemName: ci.menuItem.itemName,
        price: ci.menuItem.price,
      })),
    };
  }

  // ─── View Cart ─────────────────────────────────────────────────────────────

  async viewCart(cartId: number): Promise<CartResult | null> {
    const cart = await CartRepository.getCartWithItems(cartId);
    if (!cart) return null;

    return {
      cartId: cart.id,
      userId: cart.userId,
      items: cart.cartItems.map((ci) => ({
        id: ci.id,
        cartId: ci.cartId,
        menuItemId: ci.menuItemId,
        quantity: ci.quantity,
        itemName: ci.menuItem.itemName,
        price: ci.menuItem.price,
      })),
    };
  }

  // ─── Update Item Quantity ──────────────────────────────────────────────────

  async updateQuantity(cartId: number, menuItemId: number, quantity: number): Promise<void> {
    const cart = await CartRepository.getCartWithItems(cartId);
    if (!cart) {
      throw new ServiceError(`Cart with id ${cartId} does not exist`, 404);
    }

    const item = cart.cartItems.find((ci) => ci.menuItemId === menuItemId);
    if (!item) {
      throw new ServiceError(`Item with menuItemId ${menuItemId} not found in cart`, 404);
    }

    const menuItem = await CartRepository.findMenuItemById(menuItemId);
    if (!menuItem) {
      throw new ServiceError(`Menu item with id ${menuItemId} does not exist`, 404);
    }

    if (quantity > menuItem.quantity) {
      throw new ServiceError(`Requested quantity (${quantity}) exceeds available stock (${menuItem.quantity})`, 400);
    }

    await CartRepository.upsertCartItem(cartId, menuItemId, quantity);
  }

  // ─── Clear Cart ────────────────────────────────────────────────────────────

  async clearCart(cartId: number): Promise<void> {
    const cart = await CartRepository.getCartWithItems(cartId);
    if (!cart) {
      throw new ServiceError(`Cart with id ${cartId} does not exist`, 404);
    }

    await CartRepository.clearCart(cartId);
  }
}
