import prisma from '../../../../lib/prisma';

export class OrderTrackingRepository {
  /** Add order tracking status */
  static async addOrderTrackingStatus(orderId: number, statusId: number) {
    return prisma.orderTracking.create({
      data: {
        orderId,
        statusId,
      },
      include: {
        status: true,
      },
    });
  }

  /** Get all order tracking columns by order id */
  static async getOrderTrackingsByOrderId(orderId: number) {
    return prisma.orderTracking.findMany({
      where: { orderId },
      include: {
        status: true,
      },
      orderBy: {
        statusDate: 'desc', // order by newest tracking first
      },
    });
  }
}
