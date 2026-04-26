import { z } from 'zod';

export const CartSchema = z.object({
  itemId: z.number().min(1),
  itemQuantity: z.number().min(1),
});

export const DeleteCartSchema = z.object({
  itemId: z.number().min(1),
});





// add ---> body ---> id, quantity
// update ---> params-->id, body -->quantity
// delete ---> param-->id, 