import prisma from '../../../../lib/prisma';
import { OrderStatusEnum } from '@prisma/client' ; 
export class OrderTrackingRepository {
  /** Add order tracking status */
  static async addOrderTrackingStatus(orderId: number, statusId: number ) {
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
    return await prisma.orderTracking.findMany({
      where: { orderId },
      include: {
        status: true,
      },
      orderBy: {
        statusDate: 'desc', // order by newest tracking first
      },
    });

  }
  /** get last status of an order */
  static async getLatestStatus(orderId: number) {
  return prisma.orderTracking.findFirst({
    where: { orderId },
    include: { status: true },
    orderBy: {
      statusDate: 'desc',
    },
  });
}
}
