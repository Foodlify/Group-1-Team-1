import prisma from '../../../../lib/prisma';

export interface OrderSummaryFilters {
  orderId?: number;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export class OrderSummaryRepository {
  /** Add order summary when order status is delivered */
  static async addOrderSummary(summaryData: {
    customerId: number;
    orderId: number;
    restaurantName: string;
    totalAmount: number;
    totalQuantity: number;
    orderDate: Date;
  }) {
    return prisma.orderSummary.create({
      data: summaryData,
    });
  }

  /** Get all order summaries for a customer with optional filters & pagination */
  static async getOrdersSummaryByCustomerId(
    customerId: number,
    filters: OrderSummaryFilters = {},
  ) {
    const { orderId, from, to, page = 1, limit = 10 } = filters;

    const where: any = { customerId };

    if (orderId !== undefined) {
      where.orderId = orderId;
    }

    if (from || to) {
      where.orderDate = {
        ...(from && { gte: from }),
        ...(to   && { lte: to   }),
      };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.orderSummary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderDate: 'desc' },
      }),
      prisma.orderSummary.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
