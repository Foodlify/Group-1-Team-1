import { OrderTrackingRepository } from '../Repositories/orderTracking.repository';
import { OrderStatusEnum } from '@prisma/client' ;
export class OrderTrackingService {
 static async addOrderTrackingStatus(
  orderId: number,
  statusId: number
) {

  //////

    return OrderTrackingRepository.addOrderTrackingStatus(
      orderId,
      statusId
    );
  }


  // 3. transition rules
  // const allowedTransitions: Record<
  //   OrderStatusEnum,
  //   OrderStatusEnum[]
  // > = {
  //   [OrderStatusEnum.PENDING]: [
  //     OrderStatusEnum.CONFIRMED,
  //     OrderStatusEnum.CANCELLED,
  //   ],

  //   [OrderStatusEnum.CONFIRMED]: [
  //     OrderStatusEnum.PROCESSED,
  //     OrderStatusEnum.CANCELLED,
  //   ],

  //   [OrderStatusEnum.PROCESSED]: [
  //     OrderStatusEnum.READY_TO_PICKUP,
  //     OrderStatusEnum.OUT_FOR_DELIVERY,
  //   ],

  //   [OrderStatusEnum.READY_TO_PICKUP]: [
  //     OrderStatusEnum.DELIVERED,
  //   ],

  //   [OrderStatusEnum.OUT_FOR_DELIVERY]: [
  //     OrderStatusEnum.DELIVERED,
  //   ],

  //   [OrderStatusEnum.DELIVERED]: [
  //     OrderStatusEnum.REFUNDED, // optional
  //   ],

  //   [OrderStatusEnum.CANCELLED]: [],

  //   [OrderStatusEnum.REFUNDED]: [],
  // };

  // const currentStatus = latest.status.name as OrderStatusEnum ;
  // const allowed = allowedTransitions[currentStatus];

  // // 4. validation
  // if (!allowed.includes(newStatus)) {
  //   throw new Error(
  //     `Invalid transition from ${currentStatus} to ${newStatus}`
  //   );
  // }

  // 5. add new tracking
//   return OrderTrackingRepository.addOrderTrackingStatus(
//     orderId,
//     newStatus
//   );

  /** Get order tracking history for timeline  */
  static async getOrderTrackingHistory(orderId: number) {
    ///// validate order id 
  const trackings =
    await OrderTrackingRepository.getOrderTrackingsByOrderId(orderId);

  if (trackings.length == 0) {
    throw new Error('No tracking found for this order');
  }

  return trackings;
}
/** Get latest status by order id  */
static async getCurrentStatus(orderId: number) {
  const latest = await OrderTrackingRepository.getLatestStatus(orderId);

  if (!latest) {
    throw new Error('Order has no status yet');
  }

  return latest;
}

}