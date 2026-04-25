import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { sendSuccess, sendError } from '../../utils/reponse';
import asyncHandler from '../../utils/asyncHandler';
import { StatusCodes } from 'http-status-codes';
import {
  CartItemNotFound,
  CartNotFound,
  QuantityExceed,
  RestaurantNotMatch,
} from './cart.execption';
import { successMessage } from '../../shared_infrastructure/error/errorMessages';

const cartService = new CartService();

export class CartController {
  // ─── Add To Cart ────────────────────────────────────────────────────────────

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    const { itemId, itemQuantity } = req.body;
    try {
      const cart = await cartService.addToCart({
        customerId,
        itemId,
        itemQuantity,
      });
      sendSuccess(
        res,
        successMessage.CART_ITEM_ADDED.message,
        StatusCodes.CREATED,
        cart,
      );
    } catch (err) {
      if (
        err instanceof CartNotFound ||
        err instanceof CartItemNotFound ||
        err instanceof RestaurantNotMatch ||
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  // ─── View Cart ──────────────────────────────────────────────────────────────

  viewCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;

    try {
      const cart = await cartService.viewCart(customerId);
      sendSuccess(
        res,
        successMessage.CART_VIEWED.message,
        StatusCodes.OK,
        cart,
      );
    } catch (err) {
      if (
        err instanceof CartNotFound ||
        err instanceof CartItemNotFound ||
        err instanceof RestaurantNotMatch ||
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  // ─── Update Item Quantity ────────────────────────────────────────────────────

  updateQuantity = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    const itemId = Number(req.params.itemId);
    const { itemQuantity } = req.body;
    try {
      const updatedItem = await cartService.updateQuantity({
        customerId,
        itemId,
        itemQuantity,
      });
      sendSuccess(
        res,
        successMessage.CART_ITEM_QUANTITY_UPDATED.message,
        StatusCodes.OK,
        updatedItem,
      );
    } catch (err) {
      if (
        err instanceof CartNotFound ||
        err instanceof CartItemNotFound ||
        err instanceof RestaurantNotMatch ||
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  deleteCartItem = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    const itemId = Number(req.params.itemId);
    try {
      const deletedItem = await cartService.deleteCartItem({
        customerId,
        itemId,
      });
      sendSuccess(
        res,
        successMessage.CART_ITEM_DELETED.message,
        StatusCodes.CREATED,
        deletedItem,
      );
    } catch (err) {
      if (
        err instanceof CartNotFound ||
        err instanceof CartItemNotFound ||
        err instanceof RestaurantNotMatch ||
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  // ─── Clear Cart ──────────────────────────────────────────────────────────────

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;

    try {
      const cart = await cartService.clearCart(customerId);
      sendSuccess(
        res,
        successMessage.CART_CLEARED.message,
        StatusCodes.OK,
        cart,
      );
    } catch (err) {
      if (
        err instanceof CartNotFound ||
        err instanceof CartItemNotFound ||
        err instanceof RestaurantNotMatch ||
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  getTotalPrice = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    try {
      const totalPrice = await cartService.getTotalPrice(customerId);
      sendSuccess(
        res,
        successMessage.TOTAL_PRICE_GET.message,
        StatusCodes.OK,
        totalPrice,
      );
    } catch (err) {
      if (
        err instanceof CartNotFound ||
        err instanceof CartItemNotFound ||
        err instanceof RestaurantNotMatch ||
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });
  getTotalQuantity = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    try {
      const totalQuantity = await cartService.getTotalQuantity(customerId);
      sendSuccess(
        res,
        successMessage.TOTAL_QUANTITY_GET.message,
        StatusCodes.OK,
        totalQuantity,
      );
    } catch (err) {
      if (
        err instanceof CartNotFound ||
        err instanceof CartItemNotFound ||
        err instanceof RestaurantNotMatch ||
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });
}
