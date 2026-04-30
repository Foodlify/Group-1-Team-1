import { Request, Response } from 'express';
import { OrderService } from './Services/order.service';
import { sendSuccess, sendError } from '../../utils/reponse';
import asyncHandler from '../../utils/asyncHandler';
import { StatusCodes } from 'http-status-codes';
import { NotFound } from '../../shared_infrastructure/error/error.execption';
import { PriceNotMatch } from './order.exception';
import { successMessage } from '../../shared_infrastructure/success/successMessages';
import { QuantityExceed } from '../cartManagement/cart.execption';
import { ENTITIES } from '../../../prisma/entities';

const cartService = new OrderService();

export class OrderController {
  // ─── Place Order ────────────────────────────────────────────────────────────

  placeOrder = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    const { addressId, paymentTypeId, preferredDate } = req.body;
    try {
      const order = await OrderService.PlaceOrder({
        customerId,
        addressId,
        paymentTypeId,
        preferredDate,
      });
      sendSuccess(
        res,
        `${ENTITIES.ORDER} ${successMessage.RECORD_ADDED.message}`,
        StatusCodes.CREATED,
        order,
      );
    } catch (err) {
      if (
        err instanceof NotFound ||
        err instanceof PriceNotMatch ||
        err instanceof QuantityExceed
      ) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  // ─── View Single Order details ──────────────────────────────────────────────────────────────

  getSingleOrder = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    const orderId = Number(req.params.orderId);

    try {
      const order = await OrderService.getSingleOrder(customerId, orderId);
      sendSuccess(
        res,
        `${ENTITIES.ORDER} ${successMessage.RECORD_GET.message}`,
        StatusCodes.OK,
        order,
      );
    } catch (err) {
      if (err instanceof NotFound) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });
}
