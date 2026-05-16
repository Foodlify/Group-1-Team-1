import prisma from '../../../../lib/prisma';
import { OrderStatusEnum, Prisma } from '@prisma/client';
export class OrderTrackingRepository {
  /** Add order tracking status */
  static async addOrderTrackingStatus(
    orderId: number,
    statusId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.orderTracking.create({
      data: {
        orderId,
        statusId,
      },
    });
  }

  /** Get all order tracking columns by order id */
  static async getOrderTrackingsByOrderId(
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return await db.orderTracking.findMany({
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
