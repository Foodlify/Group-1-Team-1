import { Request, Response, NextFunction } from 'express';
import { CartSchema, DeleteCartSchema } from './cart.validation';
import { StatusCodes } from 'http-status-codes';

export const addCartValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = CartSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
export const updateCartValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const itemId = Number(req.params.itemId);
  const result = CartSchema.safeParse({ ...req.body, itemId });
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};

export const deleteCartValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const itemId = Number(req.params.itemId);
  const result = DeleteCartSchema.safeParse({itemId});
  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
