import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createRateSchema } from '../Validations/rate.validation';
export const validateRateRestaurant = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = Number(req.params.orderId);
  const result = createRateSchema.safeParse({ ...req.body, orderId: id });
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
