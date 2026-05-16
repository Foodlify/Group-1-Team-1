import { Request, Response } from 'express';
import { OrderService } from '../Services/order.service';
import { sendSuccess, sendError } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { OrderTrackingService } from '../Services/orderTracking.service';
import { StatusCodes } from 'http-status-codes';
import { PriceNotMatch } from '../order.exception';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { QuantityExceed } from '../../cartManagement/cart.execption';
import { ENTITIES } from '../../../../prisma/entities';
import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../../shared_infrastructure/error/error.execption';
import { OrderStatusEnum } from '@prisma/client';


export class OrderTrackingController {
  updateOrderTrackingStatus = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = Number(req.params.customerId);
      const orderId = Number(req.params.orderId);
      const { newStatus } = req.body;
      try {
        const updatedOrder = await OrderService.updateOrderStatus(
          customerId,
          orderId,
          newStatus,
        );
        sendSuccess(
          res,
          `Order tracking status updated successfully `,
          StatusCodes.OK,
          null,
        );
      } catch (err) {
        if (err instanceof NOT_FOUND) {
          sendError(res, err.statusCode, err.code, err.message);
        } else {
          throw err;
        }
      }
    },
  );
}

// static async updateOrderTrackingStatus(orderId: number, newStatus: OrderStatusEnum) {
//   const order = await OrderTrackingRepository.findById(orderId)  as { status: OrderStatusEnum } | null;

//   if (!order) {
//     throw new Error("Order not found");
//   }

//   const currentStatus = order.status;

//   // transition rules
//   const allowedTransitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
//     pending: ["confirmed"],
//     confirmed: ["processed"],
//     processed: ["ready_to_pickup"],
//     ready_to_pickup: ["out_for_delivery"],
//     out_for_delivery: ["delivered"],
//     delivered: [],
//   };

//   if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
//     throw new Error(
//       `Cannot change status from ${currentStatus} to ${newStatus}`
//     );
//   }

//   return await OrderRepository.updateStatus(orderId, newStatus);
// }
