import { Request, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
