import { AddToCartInput } from './cart.model';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateAddToCartInput = (body: unknown): { data: AddToCartInput; errors: ValidationError[] } | { data: null; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return { data: null, errors: [{ field: 'body', message: 'Request body is required' }] };
  }

  const { userId, restaurantId, items } = body as Record<string, unknown>;

  // ─── userId ───────────────────────────────────────────────────────────────
  if (userId === undefined || userId === null) {
    errors.push({ field: 'userId', message: 'userId is required' });
  } else if (typeof userId !== 'number' || !Number.isInteger(userId) || userId <= 0) {
    errors.push({ field: 'userId', message: 'userId must be a positive integer' });
  }

  // ─── restaurantId ─────────────────────────────────────────────────────────
  if (restaurantId === undefined || restaurantId === null) {
    errors.push({ field: 'restaurantId', message: 'restaurantId is required' });
  } else if (typeof restaurantId !== 'number' || !Number.isInteger(restaurantId) || restaurantId <= 0) {
    errors.push({ field: 'restaurantId', message: 'restaurantId must be a positive integer' });
  }

  // ─── items ────────────────────────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    errors.push({ field: 'items', message: 'items must be a non-empty array' });
  } else {
    items.forEach((item: unknown, index: number) => {
      if (!item || typeof item !== 'object') {
        errors.push({ field: `items[${index}]`, message: 'Each item must be an object' });
        return;
      }
      const { itemId, quantity } = item as Record<string, unknown>;

      if (itemId === undefined || typeof itemId !== 'number' || !Number.isInteger(itemId) || itemId <= 0) {
        errors.push({ field: `items[${index}].itemId`, message: 'itemId must be a positive integer' });
      }
      if (quantity === undefined || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
        errors.push({ field: `items[${index}].quantity`, message: 'quantity must be a positive integer' });
      }
    });
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      userId: userId as number,
      restaurantId: restaurantId as number,
      items: (items as Array<{ itemId: number; quantity: number }>).map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
      })),
    },
    errors: [],
  };
};
