import { z } from 'zod';
import { RoleEnum } from '@prisma/client';
import { safeString } from '../../shared_infrastructure/middleware/safe-string';

export const loginSchema = z.object({
  email:    z.email({ error: 'Invalid email address' }),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
});

export const resetPasswordFromLinkSchema = z.object({
  token:              z.string().min(1, 'Token is required'),
  newPassword:        z.string().min(6, 'Password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: "Passwords don't match",
  path:    ['confirmNewPassword'],
});

export const changePasswordSchema = z.object({
  oldPassword:        z.string().min(1, 'Old password is required'),
  newPassword:        z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: "Passwords don't match",
  path:    ['confirmNewPassword'],
});

export const createUserSchema = z.object({
  name:     safeString(z.string().min(2, 'Name must be at least 2 characters')),
  email:    z.email({ error: 'Invalid email address' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role:     z.nativeEnum(RoleEnum),
});

export const updateUserSchema = z.object({
  name:  safeString(z.string().min(2, 'Name must be at least 2 characters')).optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
});

export const updateProfileSchema = z.object({
  name: safeString(z.string().min(2, 'Name must be at least 2 characters')).optional(),
});

export { updateEmailSchema } from '../../shared_infrastructure/auth/email-update.helper';
