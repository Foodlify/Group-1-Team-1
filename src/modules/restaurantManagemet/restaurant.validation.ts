import { z } from 'zod';

export const getRestaurantSchema = z.object({
  restaurantId: z.number().min(1),
});
export const getMenuSchema = z.object({
  restaurantId: z.number().min(1),
  menuId: z.number().min(1),
});
export const getMenuItemSchema = z.object({
  menuId: z.number().min(1),
  menuItemId: z.number().min(1),
});
