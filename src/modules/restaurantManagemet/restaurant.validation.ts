import { z } from 'zod';
import { safeString } from '../../shared_infrastructure/middleware/safe-string';

// ─── Menu mutations ───────────────────────────────────────────────────────────

export const createMenuSchema = z.object({
  restaurantId: z.coerce.number().int().min(1),
  body: z.object({
    name: safeString(z.string().min(1, 'Name is required')),
  }),
});

export const updateMenuSchema = z.object({
  restaurantId: z.coerce.number().int().min(1),
  menuId: z.coerce.number().int().min(1),
  body: z.object({
    name: safeString(z.string().min(1, 'Name is required')),
  }),
});

export const deleteMenuSchema = z.object({
  restaurantId: z.coerce.number().int().min(1),
  menuId: z.coerce.number().int().min(1),
});

// ─── MenuItem mutations ───────────────────────────────────────────────────────

export const createMenuItemSchema = z.object({
  restaurantId: z.coerce.number().int().min(1),
  menuId: z.coerce.number().int().min(1),
  body: z.object({
    itemName: safeString(z.string().min(1, 'Item name is required')),
    price: z.number().int().min(0),
    stock: z.number().int().min(0).default(0),
  }),
});

export const updateMenuItemSchema = z.object({
  menuId: z.coerce.number().int().min(1),
  menuItemId: z.coerce.number().int().min(1),
  body: z.object({
    itemName: safeString(z.string().min(1, 'Item name is required')).optional(),
    price: z.number().int().min(0).optional(),
    stock: z.number().int().min(0).optional(),
  }).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field required' }),
});

export const deleteMenuItemSchema = z.object({
  menuId: z.coerce.number().int().min(1),
  menuItemId: z.coerce.number().int().min(1),
});

// ─── Reads ────────────────────────────────────────────────────────────────────

export const getRestaurantSchema = z.object({
  restaurantId: z.coerce.number().int().min(1),
});
export const getMenuSchema = z.object({
  restaurantId: z.coerce.number().int().min(1),
  menuId: z.coerce.number().int().min(1),
});
export const getMenuItemSchema = z.object({
  menuId: z.coerce.number().int().min(1),
  menuItemId: z.coerce.number().int().min(1),
});
