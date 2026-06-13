import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { RestaurantRepository } from '../Repositories/restaurant.repository';
import { sendError } from '../../../utils/reponse';
import { errorMessage } from '../../../shared_infrastructure/error/errorMessages';
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

  static async createRestaurant( name: string,) {
    if (!name?.trim()) {
      throw new Error("Restaurant name is required");
    }
    const existingRestaurant =
  await RestaurantRepository.findRestaurantByName(name);
    if (existingRestaurant) {
   throw new Error("Restaurant already exists");
}
    return RestaurantRepository.create({
      name
    });
  }

  static async updateRestaurant(id : number , name: string){
    const restaurant = await RestaurantRepository.findRestaurantById(id);
    if (!restaurant) {
    throw new Error("Restaurant NOT found ")
     }
    if (!name){
    throw new Error("Restaurant name is required"); 
    }
    if (!name?.trim()) {
  throw new Error("Restaurant name is required");
    }
    const existingRestaurant =
  await RestaurantRepository.findRestaurantByName(name.trim());
if (
    existingRestaurant &&
    existingRestaurant.id !== id
) {
   throw new Error("Restaurant name already exists");
}
   const updatedRestaurant = await RestaurantRepository.update(id ,{name}); 
   return updatedRestaurant; 
  }

  static async deleteRestaurant(id: number){
    const restaurant = await RestaurantRepository.findRestaurantById(id); 
    if (!restaurant) {
    throw new Error("Restaurant NOT found ")
     }
     else {
      const deletedRestaurant = await RestaurantRepository.delete(id); 
      return deletedRestaurant; 
     }
  }
}
