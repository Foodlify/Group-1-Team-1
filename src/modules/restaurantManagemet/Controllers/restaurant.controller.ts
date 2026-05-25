import asyncHandler from '../../../utils/asyncHandler';
import { Request, Response } from 'express';
import { RestaurantRedisService } from '../Services/restaurant.redis.service';
import { sendError, sendSuccess } from '../../../utils/reponse';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { StatusCodes } from 'http-status-codes';
import { ENTITIES } from '../../../../prisma/entities';

export class RestaurantController {
  getRestaurants = asyncHandler(async (req: Request, res: Response) => {
    try {
      const restaurants = await RestaurantRedisService.getRestaurants();
      sendSuccess(
        res,
        `${ENTITIES.RESTAURANTS} ${successMessage.RECORD_GET.message}`,
        StatusCodes.OK,
        restaurants,
      );
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });
  getSingleRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId: id } = req.params;

    try {
      const restaurant = await RestaurantRedisService.getSingleRestaurant(+id);
      sendSuccess(
        res,
        `${ENTITIES.RESTAURANT} ${successMessage.RECORD_GET.message}`,
        StatusCodes.OK,
        restaurant,
      );
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  getMenu = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, menuId } = req.params;

    try {
      const menu = await RestaurantRedisService.getMenu(+restaurantId, +menuId);
      sendSuccess(
        res,
        `${ENTITIES.MENU} ${successMessage.RECORD_GET.message}`,
        StatusCodes.OK,
        menu,
      );
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });
  getMenuItem = asyncHandler(async (req: Request, res: Response) => {
    const { menuId, menuItemId } = req.params;

    try {
      const menuItem = await RestaurantRedisService.getMenuItem(+menuId, +menuItemId);
      sendSuccess(
        res,
        `${ENTITIES.MENU_ITEM} ${successMessage.RECORD_GET.message}`,
        StatusCodes.OK,
        menuItem,
      );
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });
}
