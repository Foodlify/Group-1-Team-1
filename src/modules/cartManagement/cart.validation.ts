import { AddToCartInput, deleteItem, ModifyCartInput } from './cart.model';

export interface ValidationError {
  field: string;
  message: string;
}
// userId
// restaurantId
// items --- itemId, quantity
class CartValidator {
  static errors: ValidationError[] = [];
  static bodyValidator(body: unknown) {
    if (!body || typeof body !== 'object') {
      return {
        field: 'Request Body',
        message: 'Request Body is required',
      };
    }
  }
  static userIdValidator(userId: unknown) {
    if (userId === undefined || userId === null) {
      return {
        field: 'userId',
        message: 'userId is required',
      };
    } else if (
      typeof userId !== 'number' ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return {
        field: 'userId',
        message: 'userId must be a positive integer',
      };
    }
  }
  static restaurantIdIdValidator(restaurantId: unknown) {
    if (restaurantId === undefined || restaurantId === null) {
      return {
        field: 'restaurantId',
        message: 'restaurantId is required',
      };
    } else if (
      typeof restaurantId !== 'number' ||
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0
    ) {
      return {
        field: 'restaurantId',
        message: 'restaurantId must be a positive integer',
      };
    }
  }
  static ItemIdValidator(itemId: unknown) {
    if (itemId === undefined || itemId === null) {
      return {
        field: 'ItemId',
        message: 'ItemId is required',
      };
    } else if (
      typeof itemId !== 'number' ||
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return {
        field: 'itemId',
        message: 'itemId must be a positive integer',
      };
    }
  }

  static itemsValidator(items: unknown) {
    const errors: ValidationError[] = [];
    if (!Array.isArray(items) || items.length === 0) {
      return [{ field: 'items', message: 'items must be a non-empty array' }];
    } else {
      items.forEach((item: unknown, index: number) => {
        if (!item || typeof item !== 'object') {
          errors.push({
            field: `items[${index}]`,
            message: 'Each item must be an object',
          });
        }
        const { itemId, quantity } = item as Record<string, unknown>;
        let itemIdErrors = CartValidator.ItemIdValidator(itemId);
        if (itemIdErrors) {
          errors.push(itemIdErrors);
        }
        if (
          quantity === undefined ||
          typeof quantity !== 'number' ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          errors.push({
            field: `items[${index}].quantity`,
            message: 'quantity must be a positive integer',
          });
        }
      });
      return errors;
    }
  }
}

export const validateAddToCartInput = (
  body: unknown,
):
  | { data: AddToCartInput; errors: ValidationError[] }
  | { data: null; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return {
      data: null,
      errors: [{ field: 'body', message: 'Request body is required' }],
    };
  }
  const { userId, restaurantId, items } = body as Record<string, unknown>;

  // ─── userId ───────────────────────────────────────────────────────────────
  if (userId === undefined || userId === null) {
    errors.push({ field: 'userId', message: 'userId is required' });
  } else if (
    typeof userId !== 'number' ||
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    errors.push({
      field: 'userId',
      message: 'userId must be a positive integer',
    });
  }

  // ─── restaurantId ─────────────────────────────────────────────────────────
  if (restaurantId === undefined || restaurantId === null) {
    errors.push({ field: 'restaurantId', message: 'restaurantId is required' });
  } else if (
    typeof restaurantId !== 'number' ||
    !Number.isInteger(restaurantId) ||
    restaurantId <= 0
  ) {
    errors.push({
      field: 'restaurantId',
      message: 'restaurantId must be a positive integer',
    });
  }

  // ─── items ────────────────────────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    errors.push({ field: 'items', message: 'items must be a non-empty array' });
  } else {
    items.forEach((item: unknown, index: number) => {
      if (!item || typeof item !== 'object') {
        errors.push({
          field: `items[${index}]`,
          message: 'Each item must be an object',
        });
        return;
      }

      const { itemId, quantity } = item as Record<string, unknown>;

      if (
        itemId === undefined ||
        typeof itemId !== 'number' ||
        !Number.isInteger(itemId) ||
        itemId <= 0
      ) {
        errors.push({
          field: `items[${index}].itemId`,
          message: 'itemId must be a positive integer',
        });
      }
      if (
        quantity === undefined ||
        typeof quantity !== 'number' ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        errors.push({
          field: `items[${index}].quantity`,
          message: 'quantity must be a positive integer',
        });
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
      items: (items as Array<{ itemId: number; quantity: number }>).map(
        (i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
        }),
      ),
    },
    errors: [],
  };
};

export const validateUpdateQuantity = (
  body: unknown,
):
  | {
      data: ModifyCartInput;
      errors: ValidationError[];
    }
  | { data: null; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const bodyErrors = CartValidator.bodyValidator(body);
  if (bodyErrors) {
    return {
      data: null,
      errors: [bodyErrors],
    };
  }
  const { userId, items } = body as Record<string, unknown>;
  const userIdErrors = CartValidator.userIdValidator(userId);
  if (userIdErrors) {
    errors.push(userIdErrors);
  }
  const ItemsErrors = CartValidator.itemsValidator(items);
  if (ItemsErrors) {
    errors.push(...ItemsErrors);
  }
  if (errors.length > 0) {
    return { data: null, errors };
  } else {
    return {
      data: {
        userId: userId as number,
        items: (items as Array<{ itemId: number; quantity: number }>).map(
          (i) => ({
            itemId: i.itemId,
            quantity: i.quantity,
          }),
        ),
      },
      errors: [],
    };
  }
};

// export const validateDeleteCartItem = (
//   body: unknown,
// ): { data: deleteItem | null; errors: ValidationError[] } => {
// const errors: ValidationError[] = [];
// const bodyErrors = CartValidator.bodyValidator(body);
// if (bodyErrors && bodyErrors.errors && bodyErrors.errors.length > 0) {
//   return bodyErrors;
// }
// const { userId, cartId, itemId } = body as Record<string, unknown>;
// const userIdErrors = CartValidator.userIdValidator(userId);
// errors.push(...userIdErrors);

// const cartIdErrors = CartValidator.cartIdValidator(cartId);
// errors.push(...cartIdErrors);

// const ItemIdErrors = CartValidator.itemsValidator(itemId);
// errors.push(...ItemIdErrors);

// if (errors.length > 0) {
//   return { data: null, errors };
// } else {
//   return {
//     data: {
//       userId: userId as number,
//       cartId: cartId as number,
//       itemId: itemId as number,
//     },
//     errors: [],
//   };
// }
// };
