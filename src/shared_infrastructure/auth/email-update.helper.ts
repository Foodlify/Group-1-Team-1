import { z } from 'zod';

export const updateEmailSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newEmail:        z.string().email('Invalid email address'),
});

export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
