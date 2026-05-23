import { TicketCategory, TicketStatus } from '@prisma/client';
import { z } from 'zod';

export const createTicketSchema = z.object({
  orderId: z.number().min(1).optional(),
  category: z.enum(TicketCategory),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(50, 'Subject must not exceed 50 characters'),

  description: z
    .string()
    .min(1, 'Description is required')
    .max(250, 'Description must not exceed 250 characters'),
});

export const getTicketSchema = z.object({
  ticketId: z.string().min(1),
});
export const updateTicketSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(TicketStatus),
});
export const resolveTicketSchema = z.object({
  ticketId: z.string().min(1),
  resolution: z
    .string()
    .min(1, 'resolution is required')
    .max(250, 'resolution must not exceed 250 characters'),
});
