import { Request, Response } from 'express';
import { OrderService } from '../Services/order.service';
import { sendSuccess, sendError } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { OrderTrackingService } from '../Services/orderTracking.service';
import { StatusCodes } from 'http-status-codes';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../../shared_infrastructure/error/error.execption';
import { OrderStatusEnum } from '@prisma/client';

export class OrderTrackingController {
  /**
   * PATCH /api/v1/orders/:customerId/:orderId/status
   *
   * Body: { newStatus: OrderStatusEnum }
   *
   * The authenticated user's ID (req.userId from auth middleware) is stored
   * as createdBy in the OrderTracking record so we know who changed each status.
   */
  // updateOrderTrackingStatus = asyncHandler(
  //   async (req: Request, res: Response) => {
  //     const customerId = Number(req.params.customerId);
  //     const orderId    = Number(req.params.orderId);
  //     const { newStatus } = req.body;

  //     // req.userId is the User.id of the authenticated actor (set by authValidator)
  //     const createdBy = req.userId!;

  //     try {
  //       await OrderService.updateOrderStatus(
  //         customerId,
  //         orderId,
  //         newStatus,
  //         undefined, // use default prisma client (no outer tx)
  //         createdBy,
  //       );

  //       sendSuccess(
  //         res,
  //         'Order tracking status updated successfully',
  //         StatusCodes.OK,
  //         null,
  //       );
  //     } catch (err) {
  //       if (err instanceof NOT_FOUND || err instanceof BAD_REQUEST) {
  //         sendError(res, err.statusCode, err.code, err.message);
  //       } else {
  //         throw err;
  //       }
  //     }
  //   },
  // );

  /** GET /api/v1/orders/:orderId/tracking — full status history */
  getOrderTrackingHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const orderId = Number(req.params.orderId);

      const history = await OrderTrackingService.getOrderTrackingHistory(orderId);

      sendSuccess(
        res,
        'Order tracking history retrieved successfully',
        StatusCodes.OK,
        history,
      );
    },
  );

  /** GET /api/v1/orders/:orderId/tracking/current — latest status only */
  // getCurrentStatus = asyncHandler(
  //   async (req: Request, res: Response) => {
  //     const orderId = Number(req.params.orderId);

  //     const latest = await OrderTrackingService.getCurrentStatus(orderId);

  //     sendSuccess(
  //       res,
  //       'Current order status retrieved successfully',
  //       StatusCodes.OK,
  //       latest,
  //     );
  //   },
  // );
}
