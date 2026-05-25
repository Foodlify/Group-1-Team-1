import { Request, Response, NextFunction } from 'express';
import {
  getRestaurantSchema,
  getMenuSchema,
  getMenuItemSchema,
} from './restaurant.validation';
import { StatusCodes } from 'http-status-codes';

export const getRestaurantValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const restaurantId = Number(req.params.restaurantId);
  const result = getRestaurantSchema.safeParse({ restaurantId });

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
export const getMenuValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const restaurantId = Number(req.params.restaurantId);
  const menuId = Number(req.params.menuId);
  const result = getMenuSchema.safeParse({ restaurantId, menuId });

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
export const getMenuItemValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const menuId = Number(req.params.menuId);
  const menuItemId = Number(req.params.menuItemId);
  const result = getMenuItemSchema.safeParse({ menuId, menuItemId });

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
