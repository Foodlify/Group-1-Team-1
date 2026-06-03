import { z } from 'zod';
import { RoleEnum } from '@prisma/client';

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordFromLinkSchema = z.object({
  token:              z.string().min(1, 'Token is required'),
  newPassword:        z.string().min(6, 'Password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: "Passwords don't match",
  path:    ['confirmNewPassword'],
});

export const changePasswordSchema = z.object({
  oldPassword:        z.string().min(1, 'Old password is required'),
  newPassword:        z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: "Passwords don't match",
  path:    ['confirmNewPassword'],
});

export const createUserSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role:     z.nativeEnum(RoleEnum),
});

export const updateUserSchema = z.object({
  name:  z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
});

export { updateEmailSchema } from '../../shared_infrastructure/auth/email-update.helper';
