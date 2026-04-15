import { Request, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';
import { ErrorStatus } from './error_codes';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || ErrorStatus.INTERNAL_SERVER_ERROR;

  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message,
  });
};


// Error will be repeated in each service so must be put in error-handling.ts in middlewares
export class ServiceError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errors?: unknown,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
