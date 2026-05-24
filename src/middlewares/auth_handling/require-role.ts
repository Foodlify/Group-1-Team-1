import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RoleEnum } from '@prisma/client';

export const requireRole = (...roles: RoleEnum[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole as RoleEnum)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Insufficient permissions' });
    }
    next();
  };
