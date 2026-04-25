import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

declare global {
  namespace Express {
    interface Request {
      customerId?: number;
    }
  }
}
export const authValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.headers.authorization;
  const customer_id = Number(id?.split(' ')[1]);

  if (!id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Token missing',
    });
  }
  req.customerId = customer_id;
  next();
};
