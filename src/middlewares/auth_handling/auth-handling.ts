import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomerRepository } from '../../modules/customerManagement/customer.repository';

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
  const id = req.headers.authorization;

  if (!id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Token missing',
    });
  }

  const customer_id = Number(id.split(' ')[1]);

  // Resolve the real User.id using the repository layer
  const customer = await CustomerRepository.findCustomerById(customer_id);

  if (!customer) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Customer not found',
    });
  }

  req.customerId = customer_id;
  req.userId     = customer.userId; // actual User.id from the relation
  next();
};
