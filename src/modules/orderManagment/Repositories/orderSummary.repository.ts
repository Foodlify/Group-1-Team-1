import prisma from '../../../../lib/prisma';

export class OrderSummaryRepository {
  /** Add order summary when order status is deliveried */
  static async addOrderSummary(summaryData: {
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
}
