import asyncHandler from '../../../utils/asyncHandler';
import { Request, Response } from 'express';
import { RestaurantRedisService } from '../Services/restaurant.redis.service';
import { MenuService } from '../Services/menu.service';
import { sendError, sendSuccess } from '../../../utils/reponse';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { StatusCodes } from 'http-status-codes';
import { ENTITIES } from '../../../../prisma/entities';
import { RestaurantService } from '../Services/restaurant.service';
import { STATUS_CODES } from 'node:http';
import { errorMessage } from '../../../shared_infrastructure/error/errorMessages';
export class RestaurantController {
  getRestaurants = asyncHandler(async (_req: Request, res: Response) => {
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

  // ─── Menu mutations ───────────────────────────────────────────────────────────

  createMenu = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const { name } = req.body;
    try {
      const menu = await MenuService.createMenu(restaurantId, name);
      sendSuccess(res, `${ENTITIES.MENU} ${successMessage.RECORD_ADDED.message}`, StatusCodes.CREATED, menu);
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  updateMenu = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const menuId = Number(req.params.menuId);
    const { name } = req.body;
    try {
      const menu = await MenuService.updateMenu(menuId, restaurantId, name);
      sendSuccess(res, `${ENTITIES.MENU} ${successMessage.RECORD_updated.message}`, StatusCodes.OK, menu);
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  deleteMenu = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const menuId = Number(req.params.menuId);
    try {
      await MenuService.deleteMenu(menuId, restaurantId);
      sendSuccess(res, `${ENTITIES.MENU} ${'deleted successfully'}`, StatusCodes.OK, null);
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  // ─── MenuItem mutations ───────────────────────────────────────────────────────

  createMenuItem = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const menuId = Number(req.params.menuId);
    const { itemName, price, stock } = req.body;
    try {
      const item = await MenuService.createMenuItem({ menuId, restaurantId, itemName, price, stock: stock ?? 0 });
      sendSuccess(res, `${ENTITIES.MENU_ITEM} ${successMessage.RECORD_ADDED.message}`, StatusCodes.CREATED, item);
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const menuId = Number(req.params.menuId);
    const menuItemId = Number(req.params.menuItemId);
    const { itemName, price, stock } = req.body;
    try {
      const item = await MenuService.updateMenuItem(menuItemId, menuId, restaurantId, { itemName, price, stock });
      sendSuccess(res, `${ENTITIES.MENU_ITEM} ${successMessage.RECORD_updated.message}`, StatusCodes.OK, item);
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const menuId = Number(req.params.menuId);
    const menuItemId = Number(req.params.menuItemId);
    try {
      await MenuService.deleteMenuItem(menuItemId, menuId, restaurantId);
      sendSuccess(res, `${ENTITIES.MENU_ITEM} ${'deleted successfully'}`, StatusCodes.OK, null);
    } catch (err) {
      if (err instanceof NOT_FOUND) {
        sendError(res, err.statusCode, err.code, err.message);
      } else {
        throw err;
      }
    }
  });

  createRestaurant = asyncHandler(async(req: Request, res: Response) => {
     const { name } = req.body;
     try {
     const restaurant = await RestaurantService.createRestaurant(name);
     sendSuccess(res, successMessage.CREATE_RESTAURANT.message , StatusCodes.CREATED , restaurant); 
     } catch(err){
       if (err){
        sendError(res, StatusCodes.NOT_ACCEPTABLE, errorMessage.RESTAURANT_NAME_TAKEN.message, errorMessage.RESTAURANT_NAME_TAKEN.code); 
       }
     }
    });

  updateRestaurant = asyncHandler(async(req: Request , res: Response ) => {
    const  restaurantId  = Number(req.params.restaurantId) ; 
    const { restaurantName } = req.body ;
    try {
    const restaurant = await RestaurantService.updateRestaurant(restaurantId, restaurantName); 
    sendSuccess(res,successMessage.UPDATE_RESTAURANT.message, StatusCodes.OK, restaurant)
      } catch(err){
       if (err){
        sendError(res, StatusCodes.NOT_FOUND , errorMessage.NOT_FOUND.message, errorMessage.NOT_FOUND.code); 
       }
    }
  }); 

  deleteRestaurant = asyncHandler(async(req: Request , res: Response) => {
    const restaurantId = Number(req.params.restaurantId) ;
    try{
     const deletedRestaurant = await RestaurantService.deleteRestaurant(restaurantId); 
     sendSuccess(res, successMessage.DELETE_RESTAURANT.message, StatusCodes.OK , deletedRestaurant); 
    } catch(err){
     if (err){
     sendError(res, StatusCodes.NOT_FOUND, errorMessage.NOT_FOUND.message, errorMessage.NOT_FOUND.code) ;
     }
    }
  }); 
}
