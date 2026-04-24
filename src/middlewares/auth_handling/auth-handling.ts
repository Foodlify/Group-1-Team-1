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
  const id = Number(req.headers.authorization);
  if (!id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Token missing',
    });
  }
  req.customerId = id;
  next();
};
