import asyncHandler from '../../../utils/asyncHandler';
import { NextFunction, Request, Response } from 'express';

import { sendSuccess, sendError } from '../../../utils/reponse';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { ENTITIES } from '../../../../prisma/entities';
import { StatusCodes } from 'http-status-codes';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import LoyaltyPointsService from '../Services/points.service';
export class LoyaltyPointsController {
  static getPoints = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;

    try {
      const points = await LoyaltyPointsService.getLoyaltyPoints(customerId);
      sendSuccess(
        res,
        `${ENTITIES.LOYALTY_POINTS} ${successMessage.RECORD_GET.message}`,
        StatusCodes.OK,
        points,
      );
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });
  static redeemPointsToMoney = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = req.customerId!;

      try {
        const money =
          await LoyaltyPointsService.redeemLoyaltyPoints(customerId);
        sendSuccess(
          res,
          `${ENTITIES.LOYALTY_POINTS} ${successMessage.RECORD_GET.message}`,
          StatusCodes.OK,
          money,
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
