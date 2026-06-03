import { Router } from 'express';
import { CustomerController } from './controllers/customer.controller';
import { CustomerProfileController } from './controllers/customer.profile.controller';
import { authCustomer as authValidator } from '../../middlewares/auth_handling/auth.middleware';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPasswordFromLink,
  validateChangePassword,
  validateUpdateCustomerProfile,
  validateUpdateEmail,
} from './customer.middleware';

const router = Router();
const customerController = new CustomerController();
const profileController  = new CustomerProfileController();

router.post('/register', validateRegister, customerController.register);
router.post('/login', validateLogin, customerController.login);
router.post('/refresh-token', customerController.refreshToken);
router.post('/forgot-password', validateForgotPassword, customerController.forgotPassword);
router.post('/reset-password-from-link', validateResetPasswordFromLink, customerController.resetPasswordFromLink);

// Protected routes
router.post('/logout', authValidator, customerController.logout);
router.delete('/refresh-token', authValidator, customerController.revokeRefreshToken);
router.post('/change-password', authValidator, validateChangePassword, customerController.changePassword);

// Profile
router.get(  '/profile',       authValidator,                               profileController.getCustomerProfile);
router.patch('/profile',       authValidator, validateUpdateCustomerProfile, profileController.updateCustomerProfile);
router.patch('/profile/email', authValidator, validateUpdateEmail,           profileController.updateEmail);

export default router;
