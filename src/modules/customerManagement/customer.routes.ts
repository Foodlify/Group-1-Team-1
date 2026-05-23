import { Router } from 'express';
import { CustomerController } from './controllers/customer.controller';
import { authValidator } from '../../middlewares/auth_handling/auth-handling';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPasswordFromLink,
  validateChangePassword,
} from './customer.middleware';

const router = Router();
const customerController = new CustomerController();

router.post('/register', validateRegister, customerController.register);
router.post('/login', validateLogin, customerController.login);
router.post('/refresh-token', customerController.refreshToken);
router.post('/forgot-password', validateForgotPassword, customerController.forgotPassword);
router.post('/reset-password-from-link', validateResetPasswordFromLink, customerController.resetPasswordFromLink);

// Protected routes
router.post('/logout', authValidator, customerController.logout);
router.delete('/refresh-token', authValidator, customerController.revokeRefreshToken);
router.post('/change-password', authValidator, validateChangePassword, customerController.changePassword);

export default router;
