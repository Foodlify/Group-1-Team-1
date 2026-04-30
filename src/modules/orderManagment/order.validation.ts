import { z } from 'zod';

export const PlaceOrderSchema = z.object({
  addressId: z.number().min(1),
  paymentTypeId: z.number().min(1),
  preferredDate: z.date(),
});

export const GetOrderSchema = z.object({
  orderId: z.number().min(1),
});
