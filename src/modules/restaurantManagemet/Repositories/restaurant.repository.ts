import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
export class RestaurantRepository {
  static async findRestaurantById(
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menus: { include: { menuItems: true } } },
    });
  }
  static async getRestaurants(db: Prisma.TransactionClient = prisma) {
    const restaurants = await db.restaurant.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return restaurants;
  }

  static async findRestaurantByName(restaurantName: string , db: Prisma.TransactionClient = prisma){
   return db.restaurant.findFirst({
    where: {name: restaurantName,
         mode: "insensitive",
    }, 
   })
  }
  
  static async create(
    data: Prisma.RestaurantCreateInput
  ) {
    return prisma.restaurant.create({
      data,
    });
  }

  static async update(
    id: number , 
    data: Prisma.RestaurantUpdateInput, 
    db: Prisma.TransactionClient = prisma){
      return db.restaurant.update({
        where: { id }, 
        data,
      }); 
  }
  
  static async delete(id: number, 
    db: Prisma.TransactionClient = prisma
  ) {
    return db.restaurant.delete({
      where: { id }, 
    }); 
  }
}
