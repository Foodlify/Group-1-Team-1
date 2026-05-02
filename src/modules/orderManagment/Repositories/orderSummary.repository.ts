import prisma from '../../../../lib/prisma';

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

  /** Get all order summaries for a specific customer */
  static async getByCustomerId(customerId: number) {
    return prisma.orderSummary.findMany({
      where: {
        customerId: customerId,
      },
    });
  }
}
