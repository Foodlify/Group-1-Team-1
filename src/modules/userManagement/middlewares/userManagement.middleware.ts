import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodType } from 'zod';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordFromLinkSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
} from '../user.validation';

function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation failed',
        errors:  result.error.issues,
      });
    }
    next();
  };
}

export const validateLogin               = validate(loginSchema);
export const validateForgotPassword      = validate(forgotPasswordSchema);
export const validateResetPasswordLink   = validate(resetPasswordFromLinkSchema);
export const validateChangePassword      = validate(changePasswordSchema);
export const validateCreateUser          = validate(createUserSchema);
export const validateUpdateUser          = validate(updateUserSchema);
export const validateUpdateProfile       = validate(updateProfileSchema);
