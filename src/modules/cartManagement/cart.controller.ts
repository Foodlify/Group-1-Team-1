import { Request, Response } from 'express';
import { CartService, ServiceError } from './cart.service';
import { validateAddToCartInput } from './cart.validation';
import { sendSuccess, sendError } from '../../utils/reponse';
import asyncHandler from '../../utils/asyncHandler';

const cartService = new CartService();

export class CartController {
  // ─── Add To Cart ────────────────────────────────────────────────────────────

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const { data, errors } = validateAddToCartInput(req.body);

    if (!data) {
      sendError(res, 'Validation failed', 402, errors);
      return;
    }

    try {
      const cart = await cartService.addToCart(data);
      sendSuccess(res, cart, 'Items added to cart successfully', 200);
    } catch (err) {
      if (err instanceof ServiceError) {
        sendError(res, err.message, err.statusCode, err.errors);
      } else {
        throw err;
      }
    }
  });

  // ─── View Cart ──────────────────────────────────────────────────────────────

  viewCart = asyncHandler(async (req: Request, res: Response) => {
    const cartId = parseInt(req.params.cartId as string, 10);

    if (isNaN(cartId)) {
      sendError(res, 'cartId must be a valid integer', 402);
      return;
    }

    try {
      const cart = await cartService.viewCart(cartId);
      if (!cart) {
        sendError(res, `Cart with id ${cartId} does not exist`, 404);
        return;
      }
      sendSuccess(res, cart, 'Cart retrieved successfully');
    } catch (err) {
      if (err instanceof ServiceError) {
        sendError(res, err.message, err.statusCode, err.errors);
      } else {
        throw err;
      }
    }
  });

  // ─── Update Item Quantity ────────────────────────────────────────────────────

  updateQuantity = asyncHandler(async (req: Request, res: Response) => {
    const cartId = parseInt(req.params.cartId as string, 10);
    const { menuItemId, quantity } = req.body as { menuItemId: number; quantity: number };

    if (isNaN(cartId) || !menuItemId || !quantity || quantity <= 0) {
      sendError(res, 'cartId, menuItemId and a positive quantity are required', 402);
      return;
    }

    try {
      await cartService.updateQuantity(cartId, menuItemId, quantity);
      sendSuccess(res, null, 'Item quantity updated successfully');
    } catch (err) {
      if (err instanceof ServiceError) {
        sendError(res, err.message, err.statusCode, err.errors);
      } else {
        throw err;
      }
    }
  });

  // ─── Clear Cart ──────────────────────────────────────────────────────────────

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const cartId = parseInt(req.params.cartId as string, 10);

    if (isNaN(cartId)) {
      sendError(res, 'cartId must be a valid integer', 402);
      return;
    }

    try {
      await cartService.clearCart(cartId);
      sendSuccess(res, null, 'Cart cleared successfully');
    } catch (err) {
      if (err instanceof ServiceError) {
        sendError(res, err.message, err.statusCode, err.errors);
      } else {
        throw err;
      }
    }
  });
}
