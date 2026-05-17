import prisma from '../../../../lib/prisma';
import { OrderTrackingRepository } from '../Repositories/orderTracking.repository';
import { OrderStatusEnum, Prisma } from '@prisma/client';
import { OrderTrackingHistoryResponse } from '../order.model';
import loggerService from '../../../shared_infrastructure/logger/logger';

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
      resolvedDb = createdByOrDb as Prisma.TransactionClient;
    }

    loggerService.info('Adding order tracking status', { orderId, statusId, createdBy });
    const result = await OrderTrackingRepository.addOrderTrackingStatus(orderId, statusId, createdBy, resolvedDb);
    loggerService.info('Order tracking status added', { orderId, statusId });
    return result;
  }

  static async getOrderTrackingHistory(
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<OrderTrackingHistoryResponse[]> {
    loggerService.info('Get order tracking history', { orderId });

    const trackings = await OrderTrackingRepository.getOrderTrackingsByOrderId(orderId, db);

    if (trackings.length === 0) {
      loggerService.warn('No tracking found for order', { orderId });
      throw new Error('No tracking found for this order');
    }

    loggerService.info('Order tracking history retrieved', { orderId, count: trackings.length });
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
