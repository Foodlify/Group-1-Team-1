import { OrderSummaryRepository, OrderSummaryFilters } from '../Repositories/orderSummary.repository';
import { OrderSummaryResponse, OrdersSummaryPaginatedResponse } from '../order.model';
import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';

export class OrderSummaryService {
  static async addOrderSummary(
    summaryData: {
      customerId: number;
      orderId: number;
      restaurantName: string;
      totalAmount: number;
      totalQuantity: number;
      orderDate: Date;
    },
    db: Prisma.TransactionClient = prisma,
  ) {
    return OrderSummaryRepository.addOrderSummary(summaryData);
  }

  static async getOrdersSummaryByCustomerId(
    customerId: number,
    filters: OrderSummaryFilters = {},
  ): Promise<OrdersSummaryPaginatedResponse> {
    const result = await OrderSummaryRepository.getOrdersSummaryByCustomerId(
      customerId,
      filters,
    );

    const formatted: OrderSummaryResponse[] = result.data.map((s) => ({
      id: s.id,
      orderId: s.orderId,
      restaurantName: s.restaurantName,
      totalAmount: s.totalAmount,
      totalQuantity: s.totalQuantity,
      orderDate: new Date(s.orderDate).toISOString().split('T')[0],
    }));

    return {
      data: formatted,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}
