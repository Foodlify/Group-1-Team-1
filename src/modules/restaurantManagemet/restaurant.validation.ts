import { z } from 'zod';

// ─── Menu mutations ───────────────────────────────────────────────────────────

export const createMenuSchema = z.object({
  restaurantId: z.number().int().min(1),
  body: z.object({
    name: z.string().min(1),
  }),
});

export const updateMenuSchema = z.object({
  restaurantId: z.number().int().min(1),
  menuId: z.number().int().min(1),
  body: z.object({
    name: z.string().min(1),
  }),
});

export const deleteMenuSchema = z.object({
  restaurantId: z.number().int().min(1),
  menuId: z.number().int().min(1),
});

// ─── MenuItem mutations ───────────────────────────────────────────────────────

export const createMenuItemSchema = z.object({
  restaurantId: z.number().int().min(1),
  menuId: z.number().int().min(1),
  body: z.object({
    itemName: z.string().min(1),
    price: z.number().int().min(0),
    stock: z.number().int().min(0).default(0),
  }),
});

export const updateMenuItemSchema = z.object({
  menuId: z.number().int().min(1),
  menuItemId: z.number().int().min(1),
  body: z.object({
    itemName: z.string().min(1).optional(),
    price: z.number().int().min(0).optional(),
    stock: z.number().int().min(0).optional(),
  }).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field required' }),
});

export const deleteMenuItemSchema = z.object({
  menuId: z.number().int().min(1),
  menuItemId: z.number().int().min(1),
});

// ─── Reads ────────────────────────────────────────────────────────────────────

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
