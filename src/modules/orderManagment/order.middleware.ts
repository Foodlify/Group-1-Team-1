import { Request, Response, NextFunction } from 'express';
import { PlaceOrderSchema, GetOrderSchema, UpdateOrderStatusSchema, GetOrdersByStatusSchema } from './order.validation';
import { StatusCodes } from 'http-status-codes';

export const placeOrderValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = PlaceOrderSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  req.body = result.data;
  next();
};
export const getOrderValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const orderId = Number(req.params.orderId);
  const result = GetOrderSchema.safeParse({ orderId });
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};

export const updateOrderStatusValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const orderId = Number(req.params.orderId);
  const status = req.body.status;
  const result = UpdateOrderStatusSchema.safeParse({ orderId, status });
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};

export const getOrdersByStatusValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = GetOrdersByStatusSchema.safeParse({ status: req.query.status });
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};

