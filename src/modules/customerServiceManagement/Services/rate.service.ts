import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../../prisma/entities';
import {} from '../Models/supportTicket.model';
import { OrderService } from '../../orderManagment/Services/order.service';
import RateRepository from '../Repositories/rate.repository';

class RateService {
  static async insertRestaurantRate(
    input: any,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const { customerId, orderId, restaurantId, rating, comment } = input;
    const order = (await OrderService.getSingleOrder(
      customerId,
      orderId,
    )) as any;
    if (!order) throw new NOT_FOUND(ENTITIES.ORDER);

    if (restaurantId !== order.restaurantId)
      throw new Error('Invalid Restaurant');

    const existingRate = await RateRepository.getRate(customerId, orderId, db);
    if (existingRate) throw new Error('Already Rated');
    return await db.restaurantRate.create({
      data: {
        customerId,
        orderId,
        restaurantId,
        rating,
        comment,
      },
    });
  }
  static async getRestaurantRatings(
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<number> {
    const ratings = await RateRepository.getAllRestaurantRatings(
      restaurantId,
      db,
    );
    const rate =
      ratings.length === 0
        ? Number(0)
        : Number(
            (
              ratings.reduce((acc: number, cur: any) => acc + cur.rating, 0) /
              ratings.length
            ).toFixed(1),
          );

    return rate;
  }
}

export default RateService;
