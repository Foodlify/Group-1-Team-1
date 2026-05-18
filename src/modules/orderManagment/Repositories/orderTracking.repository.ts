import prisma from '../../../../lib/prisma';
import { Prisma } from '@prisma/client';

export class OrderTrackingRepository {
  /** Add a tracking record — records who triggered the status change */
  static async addOrderTrackingStatus(
    orderId: number,
    statusId: number,
    createdBy?: number, // undefined = system/automated trigger
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.orderTracking.create({
      data: {
        orderId,
        statusId,
        ...(createdBy !== undefined ? { createdBy } : {}),
      },
    });
  }

  /** Get full tracking history for an order, newest first */
  static async getOrderTrackingsByOrderId(
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return await db.orderTracking.findMany({
      where: { orderId },
      include: {
        status: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { statusDate: 'desc' },
    });
  }

  /** Get the latest (current) status of an order */
  static async getLatestStatus(orderId: number) {
    return prisma.orderTracking.findFirst({
      where: { orderId },
      include: {
        status: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { statusDate: 'desc' },
    });
  }
}
