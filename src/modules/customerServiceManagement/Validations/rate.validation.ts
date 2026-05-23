import { TicketCategory, TicketStatus } from '@prisma/client';
import { z } from 'zod';

export const createRateSchema = z.object({
  orderId: z.number().min(1),
  restaurantId: z.number().min(1),
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject must not exceed 50 characters'),
});
