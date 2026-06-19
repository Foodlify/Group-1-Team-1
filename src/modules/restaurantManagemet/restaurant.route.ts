import express from 'express';
import { RoleEnum } from '@prisma/client';
import { RestaurantController } from './Controllers/restaurant.controller';
import {
  createMenuSchema,
  updateMenuSchema,
  deleteMenuSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  deleteMenuItemSchema,
  getRestaurantSchema,
  getMenuSchema,
  getMenuItemSchema,
} from './restaurant.validation';
import { authDashboard } from '../../middlewares/auth_handling/auth.middleware';
import { requireRole } from '../../middlewares/auth_handling/require-role';
import { validate } from '../../shared_infrastructure/middleware/validate';

const router = express.Router();
const restaurantController = new RestaurantController();

// ─── Public reads ─────────────────────────────────────────────────────────────
router.get('/', restaurantController.getRestaurants);
router.get('/:restaurantId', validate(getRestaurantSchema, (req) => req.params), restaurantController.getSingleRestaurant);
router.get('/:restaurantId/menus/:menuId', validate(getMenuSchema, (req) => req.params), restaurantController.getMenu);
router.get('/menus/:menuId/menuItem/:menuItemId', validate(getMenuItemSchema, (req) => req.params), restaurantController.getMenuItem);

// ─── Menu mutations (admin / restaurant owner) ────────────────────────────────
router.post(
  '/:restaurantId/menus',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  validate(createMenuSchema, (req) => ({ restaurantId: req.params.restaurantId, body: req.body })),
  restaurantController.createMenu,
);
router.patch(
  '/:restaurantId/menus/:menuId',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  validate(updateMenuSchema, (req) => ({ restaurantId: req.params.restaurantId, menuId: req.params.menuId, body: req.body })),
  restaurantController.updateMenu,
);
router.delete(
  '/:restaurantId/menus/:menuId',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  validate(deleteMenuSchema, (req) => ({ restaurantId: req.params.restaurantId, menuId: req.params.menuId })),
  restaurantController.deleteMenu,
);

// ─── MenuItem mutations (admin / restaurant owner) ────────────────────────────
router.post(
  '/:restaurantId/menus/:menuId/items',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  validate(createMenuItemSchema, (req) => ({ restaurantId: req.params.restaurantId, menuId: req.params.menuId, body: req.body })),
  restaurantController.createMenuItem,
);
router.patch(
  '/menus/:menuId/items/:menuItemId',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  validate(updateMenuItemSchema, (req) => ({ menuId: req.params.menuId, menuItemId: req.params.menuItemId, body: req.body })),
  restaurantController.updateMenuItem,
);
router.delete(
  '/menus/:menuId/items/:menuItemId',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  validate(deleteMenuItemSchema, (req) => ({ menuId: req.params.menuId, menuItemId: req.params.menuItemId })),
  restaurantController.deleteMenuItem,
);

// ─── Restaurant CRUD ──────────────────────────────────────────────────────────
router.post(
  '/restaurants/add-restaurant/',
  authDashboard,
  requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.RESTAURANT_OWNER),
  restaurantController.createRestaurant,
);

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
