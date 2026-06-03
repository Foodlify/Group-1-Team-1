import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  dob: z.string().optional(), // Will be parsed to Date
  gender: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6, 'Confirmation password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export const resetPasswordFromLinkSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6, 'Confirmation password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export const updateCustomerProfileSchema = z.object({
  name:   z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone:  z.string().min(10, 'Phone must be at least 10 characters').optional(),
  dob:    z.string().optional(),
  gender: z.string().optional(),
});

export { updateEmailSchema } from '../../shared_infrastructure/auth/email-update.helper';
