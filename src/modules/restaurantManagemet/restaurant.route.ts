import express from 'express';
import { RoleEnum } from '@prisma/client';
import { RestaurantController } from './Controllers/restaurant.controller';
import {
  createMenuValidator,
  updateMenuValidator,
  deleteMenuValidator,
  createMenuItemValidator,
  updateMenuItemValidator,
  deleteMenuItemValidator,
  getMenuItemValidator,
  getMenuValidator,
  getRestaurantValidator,
} from './restaurant.middleware';
import { authDashboard } from '../../middlewares/auth_handling/auth.middleware';
import { requireRole } from '../../middlewares/auth_handling/require-role';

const router = express.Router();
const restaurantController = new RestaurantController();

// ─── Public reads ─────────────────────────────────────────────────────────────
router.get('/', restaurantController.getRestaurants);
router.get('/:restaurantId', getRestaurantValidator, restaurantController.getSingleRestaurant);
router.get('/:restaurantId/menus/:menuId', getMenuValidator, restaurantController.getMenu);
router.get('/menus/:menuId/menuItem/:menuItemId', getMenuItemValidator, restaurantController.getMenuItem);

// ─── Menu mutations (admin / restaurant owner) ────────────────────────────────
router.post(
  '/:restaurantId/menus',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  createMenuValidator,
  restaurantController.createMenu,
);
router.patch(
  '/:restaurantId/menus/:menuId',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  updateMenuValidator,
  restaurantController.updateMenu,
);
router.delete(
  '/:restaurantId/menus/:menuId',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  deleteMenuValidator,
  restaurantController.deleteMenu,
);

// ─── MenuItem mutations (admin / restaurant owner) ────────────────────────────
router.post(
  '/:restaurantId/menus/:menuId/items',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  createMenuItemValidator,
  restaurantController.createMenuItem,
);
router.patch(
  '/menus/:menuId/items/:menuItemId',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  updateMenuItemValidator,
  restaurantController.updateMenuItem,
);
router.delete(
  '/menus/:menuId/items/:menuItemId',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  deleteMenuItemValidator,
  restaurantController.deleteMenuItem,
);

// ─── RESTAURANT CRAD  ────────────────────────────

router.post(
'/restaurants/add-restaurant/',
authDashboard, 
requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER), 
 restaurantController.createRestaurant, 
) ;

router.patch(
  '/restaurants/update/:restaurantId/', 
  authDashboard, 
  restaurantController.updateRestaurant,
); 

router.delete(
'/restaurants/delete/:restaurantId/', 
authDashboard, 
restaurantController.deleteRestaurant, 
); 
export { router as restaurantRouter };
