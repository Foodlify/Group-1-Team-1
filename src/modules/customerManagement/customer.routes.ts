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
import { AddressController } from './controllers/address.controller';
import { ProfileController } from './controllers/profile.controller';

const router = Router();
const customerController = new CustomerController();
const addressController = new AddressController(); 
const profileController = new ProfileController(); 
router.post('/register', validateRegister, customerController.register);
router.post('/login', validateLogin, customerController.login);
router.post('/refresh-token', customerController.refreshToken);
router.post('/forgot-password', validateForgotPassword, customerController.forgotPassword);
router.post('/reset-password-from-link', validateResetPasswordFromLink, customerController.resetPasswordFromLink);

// Protected routes
router.post('/logout', authValidator, customerController.logout);
router.delete('/refresh-token', authValidator, customerController.revokeRefreshToken);
router.post('/change-password', authValidator, validateChangePassword, customerController.changePassword);


// add address
router.post('/log-address',authValidator, addressController.addAddress); 

// get and update profile
router.get('/get-profile/userId', authValidator, profileController.getProfileInfo); 
router.patch('/update-profile', authValidator, profileController.updateProfile); 
export default router;
