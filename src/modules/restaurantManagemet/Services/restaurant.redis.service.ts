/*
This service file for get restaurants and its menus to display them at client side
Not for get their ids and used in update or delete operations

 */
import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { redisClient } from '../../../../lib/redis';
import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { RestaurantRepository } from '../Repositories/restaurant.repository';
import { MenuRepository } from '../Repositories/menu.repository';
export class RestaurantRedisService {
  static async getRestaurants(db: Prisma.TransactionClient = prisma) {
    const cacheKey = 'restaurants:all';

    // 1. check redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. fetch from db
    const restaurants = await RestaurantRepository.getRestaurants();
    if (!restaurants || restaurants.length === 0) {
      throw new NOT_FOUND(ENTITIES.RESTAURANTS);
    }

    // 3. store in cache
    await redisClient.set(cacheKey, JSON.stringify(restaurants), {
      EX: 300,
    });
    return restaurants;
  }
  static async getSingleRestaurant(
    restaurantId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const cacheKey = `restaurants:restaurant-${restaurantId}`;

    // 1. check redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. fetch from db
    const restaurant = await RestaurantRepository.findRestaurantById(
      restaurantId,
      db,
    );
    if (!restaurant) {
      throw new NOT_FOUND(ENTITIES.RESTAURANT);
    }

    // 3. store in cache
    await redisClient.set(cacheKey, JSON.stringify(restaurant), {
      EX: 300,
    });
    return restaurant;
  }
  static async getMenu(
    restaurantId: number,
    menuId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const cacheKey = `restaurants:restaurant-${restaurantId}:menu-${menuId}`;

    // 1. check redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. fetch from db
    const menu = await MenuRepository.getMenuById(restaurantId, menuId, db);
    if (!menu) {
      throw new NOT_FOUND(ENTITIES.MENU);
    }

    // 3. store in cache
    await redisClient.set(cacheKey, JSON.stringify(menu), {
      EX: 300,
    });

    return menu;
  }
  static async getMenuItem(
    menuId: number,
    menuItemId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const cacheKey = `restaurants:menus:menu-${menuId}:menu-item-${menuItemId}`;

    // 1. check redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. fetch from db
    const menuItem = await MenuRepository.getMenuItem(menuId, menuItemId, db);
    if (!menuItem) {
      throw new NOT_FOUND(ENTITIES.MENU_ITEM);
    }

    // 3. store in cache
    await redisClient.set(cacheKey, JSON.stringify(menuItem), {
      EX: 300,
    });

    return menuItem;
  }
}
