import asyncHandler from '../../../utils/asyncHandler';
import { NextFunction, Request, Response } from 'express';

import { sendSuccess, sendError } from '../../../utils/reponse';
import TicketService from '../Services/ticket.service';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { ENTITIES } from '../../../../prisma/entities';
import { StatusCodes } from 'http-status-codes';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import RateService from '../Services/rate.service';
export class RateController {
  static insertRestaurantRate = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = req.customerId!;
      const orderId = Number(req.params.orderId);
      const { restaurantId, rating, comment } = req.body;

      try {
        const rate = await RateService.insertRestaurantRate({
          customerId,
          restaurantId,
          rating,
          comment,
          orderId,
        });
        sendSuccess(
          res,
          `${ENTITIES.RESTAURANT_RATE} ${successMessage.RECORD_ADDED.message}`,
          StatusCodes.CREATED,
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
