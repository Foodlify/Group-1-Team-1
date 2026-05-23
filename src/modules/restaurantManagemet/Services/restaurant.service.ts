import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { RestaurantRepository } from '../Repositories/restaurant.repository';
export class RestaurantService {
  static async getRestaurantById(
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const restaurant = await RestaurantRepository.findRestaurantById(
      restaurantId,
      db,
    );
    return restaurant;
  }
}
