import { z } from 'zod';
import { safeString } from '../../shared_infrastructure/middleware/safe-string';

const dobSchema = z.iso
  .date()
  .transform((str) => new Date(str))
  .pipe(
    z.date()
      .min(new Date('1900-01-01'), { error: 'Date of birth too far in the past' })
      .max(new Date(), { error: 'Date of birth must be in the past' }),
  );

export const registerSchema = z.object({
  name:     safeString(z.string().min(2, 'Name must be at least 2 characters')),
  email:    z.email({ error: 'Invalid email address' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone:    safeString(z.string().min(10, 'Phone must be at least 10 characters')),
  dob:      dobSchema.optional(),
  gender:   z.string().optional(),
});

export const loginSchema = z.object({
  email:    z.email({ error: 'Invalid email address' }),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
});

export const resetPasswordSchema = z.object({
  oldPassword:        z.string().min(1, 'Old password is required'),
  newPassword:        z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6, 'Confirmation password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
});

export const resetPasswordFromLinkSchema = z.object({
  token:              z.string().min(1, 'Reset token is required'),
  newPassword:        z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6, 'Confirmation password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
});

export const updateCustomerProfileSchema = z.object({
  name:   safeString(z.string().min(2, 'Name must be at least 2 characters')).optional(),
  phone:  safeString(z.string().min(10, 'Phone must be at least 10 characters')).optional(),
  dob:    dobSchema.optional(),
  gender: z.string().optional(),
});

export { updateEmailSchema } from '../../shared_infrastructure/auth/email-update.helper';
