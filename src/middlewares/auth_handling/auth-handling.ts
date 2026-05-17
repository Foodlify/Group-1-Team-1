import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomerRepository } from '../../modules/customerManagement/Repositories/customer.repository';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

declare global {
  namespace Express {
    interface Request {
      customerId?: number;
      userId?: number; // User.id resolved from Customer → User relation
    }
  }
}

export const authValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Token missing or invalid format',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Resolve the real User.id using the repository layer
    const customer = await CustomerRepository.findCustomerById(decoded.customerId);

    if (!customer) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Customer not found',
      });
    }

    req.customerId = customer.id;
    req.userId     = customer.userId; // actual User.id from the relation
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Invalid or expired token',
    });
  }
};
