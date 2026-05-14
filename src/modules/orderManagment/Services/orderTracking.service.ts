import prisma from '../../../../lib/prisma';
import { OrderTrackingRepository } from '../Repositories/orderTracking.repository';
import { OrderStatusEnum, Prisma } from '@prisma/client';
import { OrderTrackingHistoryResponse } from '../order.model';

export class OrderTrackingService {
  /**
   * Insert a tracking record.
   * Supports two call signatures for backward compatibility:
   *   addOrderTrackingStatus(orderId, statusId, db?)               ← legacy (concreteHandler, stripe)
   *   addOrderTrackingStatus(orderId, statusId, createdBy, db?)    ← new (controller)
   */
  static async addOrderTrackingStatus(
    orderId: number,
    statusId: number,
    createdByOrDb?: number | Prisma.TransactionClient,
    db: Prisma.TransactionClient = prisma,
  ) {
    let createdBy: number | undefined;
    let resolvedDb = db;

    if (typeof createdByOrDb === 'number') {
      createdBy = createdByOrDb;
      resolvedDb = db;
    } else if (createdByOrDb !== undefined) {
      // it's a TransactionClient (legacy call)
      resolvedDb = createdByOrDb as Prisma.TransactionClient;
    }

    return OrderTrackingRepository.addOrderTrackingStatus(
      orderId,
      statusId,
      createdBy,
      resolvedDb,
    );
  }

  /** Get tracking history for a timeline view */
  static async getOrderTrackingHistory(
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<OrderTrackingHistoryResponse[]> {
    const trackings = await OrderTrackingRepository.getOrderTrackingsByOrderId(
      orderId,
      db,
    );

    if (trackings.length === 0) {
      throw new Error('No tracking found for this order');
    }

    return trackings;
  }

  /** Get the current (latest) status of an order */
  // static async getCurrentStatus(orderId: number) {
  //   const latest = await OrderTrackingRepository.getLatestStatus(orderId);

  //   if (!latest) {
  //     throw new Error('Order has no status yet');
  //   }

  //   return latest;
  // }
}
