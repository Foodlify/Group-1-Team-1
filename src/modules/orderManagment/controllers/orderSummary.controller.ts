import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../../utils/asyncHandler';
import { sendSuccess } from '../../../utils/reponse';
import { OrderSummaryService } from '../Services/orderSummary.service';
import { OrderSummaryFilters } from '../Repositories/orderSummary.repository';

export class OrderSummaryController {
  /**
   * GET /api/v1/order-summary
   *
   * Query params:
   *   orderId  — filter by specific order ID
   *   from     — filter orders on or after this date  (YYYY-MM-DD)
   *   to       — filter orders on or before this date (YYYY-MM-DD)
   *   page     — page number (default: 1)
   *   limit    — items per page (default: 10)
   */
  getSummariesByCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId!;

    const filters: OrderSummaryFilters = {
      ...(req.query.orderId && { orderId: Number(req.query.orderId) }),
      ...(req.query.from    && { from:    new Date(req.query.from as string) }),
      ...(req.query.to      && { to:      new Date(req.query.to   as string) }),
      ...(req.query.page    && { page:    Number(req.query.page)  }),
      ...(req.query.limit   && { limit:   Number(req.query.limit) }),
    };

    const result = await OrderSummaryService.getOrdersSummaryByCustomerId(
      customerId,
      filters,
    );

    sendSuccess(
      res,
      'Order summaries retrieved successfully',
      StatusCodes.OK,
      result,
    );
  });
}
