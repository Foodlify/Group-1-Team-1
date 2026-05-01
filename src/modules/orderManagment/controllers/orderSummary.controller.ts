import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../../utils/asyncHandler';
import { sendSuccess, sendError } from '../../../utils/reponse';
import { OrderSummaryService } from '../Services/orderSummary.service';

export class OrderSummaryController {
  getSummariesByCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    
    const summaries = await OrderSummaryService.getByCustomerId(customerId);
    
    sendSuccess(
      res,
      'Order summaries retrieved successfully',
      StatusCodes.OK,
      summaries
    );
  });
}
