import { AddToCartInput, DeleteCartItem, ModifyCartInput } from './cart.model';

//******************************************************* */
// this validation error is generic so must move to error handling
export interface ValidationError {
  field: string;
  message: string;
}

// userId
// restaurantId
// items --- itemId, quantity
class CartValidator {
  // ─── Request Body Validation ───────────────────────────────────────────────────────────
  static bodyValidator(body: unknown) {
    if (!body || typeof body !== 'object') {
      return {
        field: 'Request Body',
        message: 'Request Body is required',
      };
    }
  }

  // ─── Generic Id / number Validation  ───────────────────────────────────────────────────────────
  static genericNumberValidator(param: unknown, type: string) {
    if (param === undefined || param === null) {
      return {
        field: type,
        message: `${type} is required`,
      };
    } else if (
      typeof param !== 'number' ||
      !Number.isInteger(param) ||
      param <= 0
    ) {
      return {
        field: type,
        message: `${type} is required`,
      };
    }
  }

  // ─── User Id Validation ───────────────────────────────────────────────────────────
  static customerIdValidator(customerId: unknown) {
    if (customerId === undefined || customerId === null) {
      return {
        field: 'customerId',
        message: 'customerId is required',
      };
    } else if (
      typeof customerId !== 'number' ||
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      return {
        field: 'customerId',
        message: 'customerId must be a positive integer',
      };
    }
  }
  // ─── Restaurant Id Validation ───────────────────────────────────────────────────────────
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
  // ─── Item Id Validation ───────────────────────────────────────────────────────────
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
  // ─── Quantity Validation ───────────────────────────────────────────────────────────
  static quantityValidator(quantity: unknown) {
    if (quantity === undefined || quantity === null) {
      return {
        field: 'quantity',
        message: 'quantity is required',
      };
    } else if (
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return {
        field: 'quantity',
        message: 'quantity must be a positive integer',
      };
    }
  }
  // ─── Items Validation ───────────────────────────────────────────────────────────
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
        let quantityErrors = CartValidator.quantityValidator(quantity);
        if (quantityErrors) {
          errors.push(quantityErrors);
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
      customerId: userId as number,
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
  const { customerId, itemId, quantity } = body as Record<string, unknown>;

  const customerIdErrors = CartValidator.genericNumberValidator(
    customerId,
    'customerId',
  );
  if (customerIdErrors) {
    errors.push(customerIdErrors);
  }
  const itemIdErrors = CartValidator.genericNumberValidator(itemId, 'itemId');
  if (itemIdErrors) {
    errors.push(itemIdErrors);
  }
  const quantityErrors = CartValidator.genericNumberValidator(
    quantity,
    'quantity',
  );
  if (quantityErrors) {
    errors.push(quantityErrors);
  }

  if (errors.length > 0) {
    return { data: null, errors };
  } else {
    return {
      data: {
        customerId: customerId as number,
        itemId: itemId as number,
        quantity: quantity as number,
      },
      errors: [],
    };
  }
};

export const validateDeleteCartItem = (
  body: unknown,
): { data: DeleteCartItem | null; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const bodyErrors = CartValidator.bodyValidator(body);
  if (bodyErrors) {
    return {
      data: null,
      errors: [bodyErrors],
    };
  }
  const { customerId, itemId } = body as Record<string, unknown>;
  const customerIdErrors = CartValidator.genericNumberValidator(
    customerId,
    'customerId',
  );
  if (customerIdErrors) {
    errors.push(customerIdErrors);
  }
  const itemIdErrors = CartValidator.genericNumberValidator(
    itemId,
    'itemId',
  );
  if (itemIdErrors) {
    errors.push(itemIdErrors);
  }


  if (errors.length > 0) {
    return { data: null, errors };
  } else {
    return {
      data: {
        customerId: customerId as number,
        itemId: itemId as number,
      },
      errors: [],
    };
  }
};
