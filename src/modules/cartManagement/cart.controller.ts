import { Request, Response } from 'express';
import { CartService } from './cart.service';
import {
  validateAddToCartInput,
  validateDeleteCartItem,
  validateUpdateQuantity,
} from './cart.validation';
import { sendSuccess, sendError } from '../../utils/reponse';
import asyncHandler from '../../utils/asyncHandler';
import {
  ErrorStatus,
  SuccessStatus,
} from '../../middlewares/error_handling/error_codes';
import { ServiceError } from '../../middlewares/error_handling/error-handling';

const cartService = new CartService();

export class CartController {
  // ─── Add To Cart ────────────────────────────────────────────────────────────

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const { data, errors } = validateAddToCartInput(req.body);

    if (!data) {
      sendError(res, 'Validation failed', 400, errors);
      return;
    }
    try {
      const cart = await cartService.addToCart(data);
      sendSuccess(res, 'Items added to cart successfully', 200, cart);
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
    const customerId = parseInt(req.params.customerId as string, 10);
    if (isNaN(customerId)) {
      sendError(res, 'customerId must be a valid integer', 402);
      return;
    }

    try {
      const cart = await cartService.viewCart(customerId);
      if (!cart) {
        sendError(res, `Cart for user with id ${customerId} does not exist`, 404);
        return;
      }
      sendSuccess(res, 'Cart retrieved successfully', 200, cart);
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
    if (isNaN(cartId)) {
      sendError(
        res,
        'cartId must be a valid integer',
        ErrorStatus.VALIDATION_ERROR,
      );
      return;
    }
    const { data, errors } = validateUpdateQuantity(req.body);

    if (!data) {
      sendError(res, 'Validation failed', ErrorStatus.VALIDATION_ERROR, errors);
      return;
    }

    try {
      const updatedItem = await cartService.updateQuantity({ ...data, cartId });
      sendSuccess(
        res,
        'Item quantity updated successfully',
        SuccessStatus.UPDATED,
        updatedItem,
      );
    } catch (err) {
      if (err instanceof ServiceError) {
        sendError(res, err.message, err.statusCode, err.errors);
      } else {
        throw err;
      }
    }
  });

  deleteCartItem = asyncHandler(async (req: Request, res: Response) => {
    const cartId = parseInt(req.params.cartId as string, 10);
    if (isNaN(cartId)) {
      sendError(
        res,
        'cartId must be a valid integer',
        ErrorStatus.VALIDATION_ERROR,
      );
      return;
    }
    const { data, errors } = validateDeleteCartItem(req.body);

    if (!data) {
      sendError(res, 'Validation failed', ErrorStatus.VALIDATION_ERROR, errors);
      return;
    }
    try {
      const deletedItem = await cartService.deleteCartItem({ ...data, cartId });
      sendSuccess(
        res,
        'Item deleted successfully',
        SuccessStatus.DELETED,
        deletedItem,
      );
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
    const customerId = parseInt(req.params.customerId as string, 10);

    if (isNaN(customerId)) {
      sendError(res, 'customerId must be a valid integer', 402);
      return;
    }

    try {
      await cartService.clearCart(customerId);
      sendSuccess(res, 'Cart cleared successfully');
    } catch (err) {
      if (err instanceof ServiceError) {
        sendError(res, err.message, err.statusCode, err.errors);
      } else {
        throw err;
      }
    }
  });
}
