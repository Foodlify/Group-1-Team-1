import express from 'express';
import { RestaurantController } from './Controllers/restaurant.controller';
import {
  getMenuItemValidator,
  getMenuValidator,
  getRestaurantValidator,
} from './restaurant.middleware';

const router = express.Router();
const restaurantController = new RestaurantController();

router.get('/', restaurantController.getRestaurants);
router.get(
  '/:restaurantId',
  getRestaurantValidator,
  restaurantController.getSingleRestaurant,
);
router.get(
  '/:restaurantId/menus/:menuId',
  getMenuValidator,
  restaurantController.getMenu,
);
router.get(
  '/menus/:menuId/menuItem/:menuItemId',
  getMenuItemValidator,
  restaurantController.getMenuItem,
);

export { router as restaurantRouter };
