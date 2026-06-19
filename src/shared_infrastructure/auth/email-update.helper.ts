import { z } from 'zod';

export const updateEmailSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newEmail:        z.email({ error: 'Invalid email address' }),
});

export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
