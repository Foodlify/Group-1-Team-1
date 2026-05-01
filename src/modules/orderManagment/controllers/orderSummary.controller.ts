import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../../utils/asyncHandler';
import { sendSuccess, sendError } from '../../../utils/reponse';
import { OrderSummaryService } from '../Services/orderSummary.service';

export class OrderSummaryController {
  getSummariesByCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;
    
    const summaries = await OrderSummaryService.getByCustomerId(customerId);
    
    const formatted = summaries.map((s: any) => ({
      ...s,
      orderDate: new Date(s.orderDate).toISOString().split('T')[0],
    }));

    sendSuccess(
      res,
      'Order summaries retrieved successfully',
      StatusCodes.OK,
      formatted
    );
  });
}
