import { Request, Response } from 'express';
import { CartRedisService } from './cart.redis.service';
import { sendSuccess, sendError } from '../../utils/reponse';
import asyncHandler from '../../utils/asyncHandler';
import { StatusCodes } from 'http-status-codes';
import {
  CartItemNotFound,
  CartNotFound,
  ItemIdempotency,
  MenuItemNotFound,
  QuantityExceed,
  RestaurantNotMatch,
} from './cart.execption';
import { successMessage } from '../../shared_infrastructure/success/successMessages';



export class CartController {
  // ─── Add To Cart ────────────────────────────────────────────────────────────

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    const { itemId, itemQuantity } = req.body;
    try {
      const cart = await CartRedisService.addToCart({
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
        err instanceof MenuItemNotFound ||
        err instanceof RestaurantNotMatch ||
        err instanceof ItemIdempotency ||
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
      const cart = await CartRedisService.viewCart(customerId);
      sendSuccess(
        res,
        successMessage.CART_VIEWED.message,
        StatusCodes.OK,
        cart,
      );
    } catch (err) {
      if (err instanceof CartNotFound) {
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
      const updatedItem = await CartRedisService.updateQuantity({
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
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  // ─── Delete Cart Item ────────────────────────────────────────────────────────

  deleteCartItem = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    const itemId = Number(req.params.itemId);
    try {
      const deletedItem = await CartRedisService.deleteCartItem({
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
        err instanceof CartItemNotFound
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
      await CartRedisService.clearCart(customerId);
      sendSuccess(
        res,
        successMessage.CART_CLEARED.message,
        StatusCodes.OK,
        null,
      );
    } catch (err) {
      if (err instanceof CartNotFound) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  // ─── Get Total Price & Quantity ───────────────────────────────────────────────

  getTotalPriceAndQuantity = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    try {
      const totalPrice = await CartRedisService.getTotalPriceAndQuantity(customerId);
      sendSuccess(
        res,
        successMessage.TOTAL_PRICE_GET.message,
        StatusCodes.OK,
        totalPrice,
      );
    } catch (err) {
      if (err instanceof CartNotFound) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

}
