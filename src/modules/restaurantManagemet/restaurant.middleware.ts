import { Request, Response, NextFunction } from 'express';
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
import { StatusCodes } from 'http-status-codes';

// ─── Menu mutation validators ─────────────────────────────────────────────────

export const createMenuValidator = (req: Request, res: Response, next: NextFunction) => {
  const result = createMenuSchema.safeParse({ restaurantId: Number(req.params.restaurantId), body: req.body });
  if (!result.success) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation failed', errors: result.error.issues });
  next();
};

export const updateMenuValidator = (req: Request, res: Response, next: NextFunction) => {
  const result = updateMenuSchema.safeParse({
    restaurantId: Number(req.params.restaurantId),
    menuId: Number(req.params.menuId),
    body: req.body,
  });
  if (!result.success) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation failed', errors: result.error.issues });
  next();
};

export const deleteMenuValidator = (req: Request, res: Response, next: NextFunction) => {
  const result = deleteMenuSchema.safeParse({
    restaurantId: Number(req.params.restaurantId),
    menuId: Number(req.params.menuId),
  });
  if (!result.success) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation failed', errors: result.error.issues });
  next();
};

// ─── MenuItem mutation validators ─────────────────────────────────────────────

export const createMenuItemValidator = (req: Request, res: Response, next: NextFunction) => {
  const result = createMenuItemSchema.safeParse({
    restaurantId: Number(req.params.restaurantId),
    menuId: Number(req.params.menuId),
    body: req.body,
  });
  if (!result.success) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation failed', errors: result.error.issues });
  next();
};

export const updateMenuItemValidator = (req: Request, res: Response, next: NextFunction) => {
  const result = updateMenuItemSchema.safeParse({
    menuId: Number(req.params.menuId),
    menuItemId: Number(req.params.menuItemId),
    body: req.body,
  });
  if (!result.success) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation failed', errors: result.error.issues });
  next();
};

export const deleteMenuItemValidator = (req: Request, res: Response, next: NextFunction) => {
  const result = deleteMenuItemSchema.safeParse({
    menuId: Number(req.params.menuId),
    menuItemId: Number(req.params.menuItemId),
  });
  if (!result.success) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation failed', errors: result.error.issues });
  next();
};

// ─── Read validators ──────────────────────────────────────────────────────────

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


// RESTAURANT VALIDATOR 
