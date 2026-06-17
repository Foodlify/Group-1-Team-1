import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccess, CustomerTokenPayload, AdminTokenPayload } from '../../shared_infrastructure/auth/jwt.helper';
import { USER_TYPE, UserTypeCode } from '../../shared_infrastructure/auth/user-type.constants';
import { CustomerRepository } from '../../modules/customerManagement/Repositories/customer.repository';
import { UserManagementRepository } from '../../modules/userManagement/repositories/userManagement.repository';

declare global {
  namespace Express {
    interface Request {
      customerId?: number;
      userId?:     number;
      userRole?:   string;
    }
  }
}

export const authenticate = (type: UserTypeCode) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Access token missing' });
    }

    try {
      const decoded = verifyAccess(token);

      if (type === USER_TYPE.CUSTOMER) {
        const payload = decoded as CustomerTokenPayload;
        if (!payload.customerId) {
          return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' });
        }
        const customer = await CustomerRepository.findCustomerById(payload.customerId);
        if (!customer) {
          return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Customer not found' });
        }
        req.customerId = customer.id;
        req.userId     = customer.userId;
      } else {
        const payload = decoded as AdminTokenPayload;
        if (!payload.userId) {
          return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' });
        }
        const user = await UserManagementRepository.findUserById(payload.userId);
        if (!user || !user.userRole) {
          return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found' });
        }
        req.userId   = user.id;
        req.userRole = user.userRole.role.name;
      }

      next();
    } catch {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
    }
  };

export const authCustomer  = authenticate(USER_TYPE.CUSTOMER);
export const authDashboard = authenticate(USER_TYPE.ADMIN);
