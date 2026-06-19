import { Router } from 'express';
import { CustomerController } from './controllers/customer.controller';
import { CustomerProfileController } from './controllers/customer.profile.controller';
import { authCustomer as authValidator } from '../../middlewares/auth_handling/auth.middleware';
import { validate } from '../../shared_infrastructure/middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordFromLinkSchema,
  resetPasswordSchema,
  updateCustomerProfileSchema,
  updateEmailSchema,
} from './customer.validation';

const router = Router();
const customerController = new CustomerController();
const profileController  = new CustomerProfileController();

router.post('/register',                   validate(registerSchema),                    customerController.register);
router.post('/login',                      validate(loginSchema),                       customerController.login);
router.post('/refresh-token',                                                           customerController.refreshToken);
router.post('/forgot-password',            validate(forgotPasswordSchema),              customerController.forgotPassword);
router.post('/reset-password-from-link',   validate(resetPasswordFromLinkSchema),       customerController.resetPasswordFromLink);

// Protected routes
router.post(  '/logout',                   authValidator,                               customerController.logout);
router.delete('/refresh-token',            authValidator,                               customerController.revokeRefreshToken);
router.post(  '/change-password',          authValidator, validate(resetPasswordSchema), customerController.changePassword);

// Profile
router.get(  '/profile',                   authValidator,                                               profileController.getCustomerProfile);
router.patch('/profile',                   authValidator, validate(updateCustomerProfileSchema),         profileController.updateCustomerProfile);
router.patch('/profile/email',             authValidator, validate(updateEmailSchema),                   profileController.updateEmail);

export default router;
