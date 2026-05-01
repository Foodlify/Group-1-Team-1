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
    return prisma.orderSummary.upsert({
      where: { customerId: summaryData.customerId },
      update: {
        orderId: summaryData.orderId,
        restaurantName: summaryData.restaurantName,
        totalAmount: summaryData.totalAmount,
        totalQuantity: summaryData.totalQuantity,
        orderDate: summaryData.orderDate,
      },
      create: summaryData,
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
