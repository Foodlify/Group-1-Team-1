import { z } from 'zod';

export const PlaceOrderSchema = z.object({
  addressId: z.number().min(1),
  paymentTypeId: z.number().min(1),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD').transform((str) => new Date(str)),
});

export const GetOrderSchema = z.object({
  orderId: z.number().min(1),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.number().min(1),
  action: z.enum(['confirm', 'process', 'pickup', 'out_for_delivery', 'deliver', 'cancel', 'refund']),
});
