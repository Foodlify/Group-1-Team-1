import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../../prisma/entities';
import { OrderService } from '../../orderManagment/Services/order.service';
import LoyaltyPointsRepository from '../Repositories/points.repository';
import {
  calculateLoyaltyPoints,
  convertLoyaltyPointsToMoney,
} from '../Helpers/loyalPoints.helper';

class LoyaltyPointsService {
  static async getLoyaltyPoints(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<number> {
    let points = await LoyaltyPointsRepository.getCustomerPoints(
      customerId,
      db,
    );
    if (!points) {
      points = 0;
    }
    return points;
  }
  static async addLoyaltyPoints(
    input: any,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const { customerId, orderId } = input;
    const order = (await OrderService.getSingleOrder(
      customerId,
      orderId,
    )) as any;
    if (!order) throw new NOT_FOUND(ENTITIES.ORDER);
    const orderExists =
      await LoyaltyPointsRepository.getCustomerPointsByOrderId(orderId, db);
    if (orderExists) throw new Error('Order already has points');
    const points = calculateLoyaltyPoints(order.totalPrice);
    return await LoyaltyPointsRepository.addPointsToCustomer(
      customerId,
      orderId,
      points,
      db,
    );
  }
  static async redeemLoyaltyPoints(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const loyalPoints = await LoyaltyPointsRepository.getCustomerPoints(
      customerId,
      db,
    );
    if (!loyalPoints || loyalPoints.points === 0) return 'No points to redeem';
    if (loyalPoints.expiresAt < new Date()) return 'Points expired';
    const money = convertLoyaltyPointsToMoney(loyalPoints.points);
    console.log(money);
    const redeemPoints = await LoyaltyPointsRepository.redeemPointsOfCustomer(
      customerId,
      loyalPoints.points,
      db,
    );
    return money;
  }
  static async expireLoyaltyPoints(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const loyalPoints = await LoyaltyPointsRepository.getCustomerPoints(
      customerId,
      db,
    );
    if (!loyalPoints || loyalPoints.points === 0) return 'No points to expire';
    if (loyalPoints.expiresAt > new Date()) return 'can not expire points';

    return await LoyaltyPointsRepository.expirePointsOfCustomer(
      customerId,
      loyalPoints.points,
      db,
    );
  }
}

export default LoyaltyPointsService;
