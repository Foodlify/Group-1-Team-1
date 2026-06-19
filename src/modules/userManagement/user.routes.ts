import { Router } from 'express';
import { RoleEnum } from '@prisma/client';
import { UserAuthController }  from './controllers/auth.controller';
import { UserController }      from './controllers/user.controller';
import { ProfileController }   from './controllers/profile.controller';
import { authDashboard }       from '../../middlewares/auth_handling/auth.middleware';
import { requireRole }         from '../../middlewares/auth_handling/require-role';
import { validate }            from '../../shared_infrastructure/middleware/validate';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordFromLinkSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  updateEmailSchema,
} from './user.validation';

const router             = Router();
const authController     = new UserAuthController();
const userController     = new UserController();
const profileController  = new ProfileController();

// ─── Auth (public) ───────────────────────────────────────────────────────────
router.post('/auth/login',             validate(loginSchema),              authController.login);
router.post('/auth/refresh-token',                                         authController.refreshToken);
router.post('/auth/forgot-password',   validate(forgotPasswordSchema),     authController.forgotPassword);
router.post('/auth/reset-password',    validate(resetPasswordFromLinkSchema), authController.resetPasswordFromLink);

// ─── Authenticated ────────────────────────────────────────────────────────────
router.post(  '/auth/logout',          authDashboard,                                       authController.logout);
router.delete('/auth/refresh-token',   authDashboard,                                       authController.revokeRefreshToken);
router.post(  '/auth/change-password', authDashboard, validate(changePasswordSchema),        authController.changePassword);

// ─── Profile ─────────────────────────────────────────────────────────────────
router.get(  '/profile',               authDashboard,                                                   profileController.getProfile);
router.patch('/profile',               authDashboard, validate(updateProfileSchema),                     profileController.updateProfile);
router.patch('/profile/email',         authDashboard, validate(updateEmailSchema),                       profileController.updateEmail);

// ─── User CRUD (ADMIN+) ───────────────────────────────────────────────────────
router.get(   '/users',                authDashboard, requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN),  userController.getAll);
router.get(   '/users/:id',            authDashboard, requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN),  userController.getOne);
router.post(  '/users',                authDashboard, requireRole(RoleEnum.SUPER_ADMIN), validate(createUserSchema), userController.create);
router.patch( '/users/:id',            authDashboard, requireRole(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN), validate(updateUserSchema), userController.update);
router.delete('/users/:id',            authDashboard, requireRole(RoleEnum.SUPER_ADMIN),                  userController.delete);

export default router;
