import { z } from 'zod';
import { safeString } from '../../../shared_infrastructure/middleware/safe-string';

export const createRateSchema = z.object({
  orderId:      z.coerce.number().int().min(1),
  restaurantId: z.number().int().min(1),
  rating:       z.number().min(1).max(5),
  comment:      safeString(z.string().min(1, 'Comment is required').max(100, 'Comment must not exceed 100 characters')),
});
