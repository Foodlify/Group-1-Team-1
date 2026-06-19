import { z } from 'zod';

export const CartSchema = z.object({
  itemId: z.coerce.number().int().min(1),
  itemQuantity: z.coerce.number().int().min(1),
});

export const DeleteCartSchema = z.object({
  itemId: z.coerce.number().int().min(1),
});





// add ---> body ---> id, quantity
// update ---> params-->id, body -->quantity
// delete ---> param-->id, 