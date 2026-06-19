import { TicketCategory, TicketStatus } from '@prisma/client';
import { z } from 'zod';
import { safeString } from '../../../shared_infrastructure/middleware/safe-string';

export const createTicketSchema = z.object({
  orderId:     z.number().int().min(1).optional(),
  category:    z.enum(TicketCategory),
  subject:     safeString(z.string().min(1, 'Subject is required').max(50, 'Subject must not exceed 50 characters')),
  description: safeString(z.string().min(1, 'Description is required').max(250, 'Description must not exceed 250 characters')),
});

export const getTicketSchema = z.object({
  ticketId: z.string().min(1),
});

export const updateTicketSchema = z.object({
  ticketId: z.string().min(1),
  status:   z.enum(TicketStatus),
});

export const resolveTicketSchema = z.object({
  ticketId:   z.string().min(1),
  resolution: safeString(z.string().min(1, 'Resolution is required').max(250, 'Resolution must not exceed 250 characters')),
});
