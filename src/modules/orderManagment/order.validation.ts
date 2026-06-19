import { z } from 'zod';

export const PlaceOrderSchema = z.object({
  addressId: z.number().min(1),
  paymentTypeId: z.number().min(1),
  preferredDate: z.iso.date().transform((str) => new Date(str)).pipe(
    z.date().min(new Date(), { error: 'Preferred date must be today or in the future' }),
  ),
});

export const GetOrderSchema = z.object({
  orderId: z.coerce.number().int().min(1),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.coerce.number().int().min(1),
  status: z.enum([
    'CONFIRMED',
    'PROCESSED',
    'READY_TO_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
});

export const GetOrdersByStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSED',
    'READY_TO_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
});

