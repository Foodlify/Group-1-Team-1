import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccess } from '../../shared_infrastructure/auth/jwt.helper';
import { USER_TYPE, UserTypeCode } from '../../shared_infrastructure/auth/user-type.constants';
import { CustomerService } from '../../modules/customerManagement/Services/customer.service';
import { UserService } from '../../modules/userManagement/services/user.service';

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

      if (decoded.userTypeCode !== type) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' });
      }

      if (type === USER_TYPE.CUSTOMER) {
        const resolved = await CustomerService.resolveById(decoded.customerId!);
        if (!resolved) {
          return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Customer not found' });
        }
        req.customerId = resolved.customerId;
        req.userId     = resolved.userId;
      } else {
        const resolved = await UserService.resolveByUserId(decoded.userId);
        if (!resolved) {
          return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found' });
        }
        req.userId   = resolved.userId;
        req.userRole = resolved.userRole;
      }

      next();
    } catch {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
    }
  };

export const authCustomer  = authenticate(USER_TYPE.CUSTOMER);
export const authDashboard = authenticate(USER_TYPE.ADMIN);
