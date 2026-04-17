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
  // ─── Request Body Validation ────────────────────────────────────────────────
  static bodyValidator(body: unknown) {
    if (!body || typeof body !== 'object') {
      return {
        field: 'Request Body',
        message: 'Request Body is required',
      };
    }
  }

  // ─── Generic Id / number Validation ─────────────────────────────────────────
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
        message: `${type} must be a positive integer`,
      };
    }
  }

  // ─── Customer Id Validation ──────────────────────────────────────────────────
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

  // ─── Restaurant Id Validation ────────────────────────────────────────────────
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

  // ─── Item Id Validation ──────────────────────────────────────────────────────
  static ItemIdValidator(itemId: unknown) {
    if (itemId === undefined || itemId === null) {
      return {
        field: 'itemId',
        message: 'itemId is required',
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

  // ─── Quantity Validation ─────────────────────────────────────────────────────
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

  // ─── Items Array Validation ──────────────────────────────────────────────────
  static itemsValidator(items: unknown) {
    const errors: ValidationError[] = [];
    if (!Array.isArray(items) || items.length === 0) {
      return [{ field: 'items', message: 'items must be a non-empty array' }];
    }
    items.forEach((item: unknown, index: number) => {
      if (!item || typeof item !== 'object') {
        errors.push({
          field: `items[${index}]`,
          message: 'Each item must be an object',
        });
        return;
      }
      const { itemId, quantity } = item as Record<string, unknown>;

      const itemIdError = CartValidator.ItemIdValidator(itemId);
      if (itemIdError) {
        errors.push({ ...itemIdError, field: `items[${index}].itemId` });
      }

      const quantityError = CartValidator.quantityValidator(quantity);
      if (quantityError) {
        errors.push({ ...quantityError, field: `items[${index}].quantity` });
      }
    });
    return errors;
  }
}

// ==============================================================================
// ─── Public Standalone Validator Functions ─────────────────────────────────────
// ==============================================================================

export const validateBody = (body: unknown) =>
  CartValidator.bodyValidator(body);

export const validateGenericNumber = (param: unknown, type: string) =>
  CartValidator.genericNumberValidator(param, type);

export const validateCustomerId = (customerId: unknown) =>
  CartValidator.customerIdValidator(customerId);

export const validateRestaurantId = (restaurantId: unknown) =>
  CartValidator.restaurantIdIdValidator(restaurantId);

export const validateItemId = (itemId: unknown) =>
  CartValidator.ItemIdValidator(itemId);

export const validateQuantity = (quantity: unknown) =>
  CartValidator.quantityValidator(quantity);

export const validateItems = (items: unknown) =>
  CartValidator.itemsValidator(items);

// ==============================================================================
// ─── Composed Validators ───────────────────────────────────────────────────────
// ==============================================================================

export const validateAddToCartInput = (
  body: unknown,
):
  | { data: AddToCartInput; errors: ValidationError[] }
  | { data: null; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  // ─── body ──────────────────────────────────────────────────────────────────
  const bodyError = validateBody(body);
  if (bodyError) {
    return { data: null, errors: [bodyError] };
  }

  const { userId, restaurantId, items } = body as Record<string, unknown>;

  // ─── userId ────────────────────────────────────────────────────────────────
  const userIdError = validateGenericNumber(userId, 'userId');
  if (userIdError) errors.push(userIdError);

  // ─── restaurantId ──────────────────────────────────────────────────────────
  const restaurantIdError = validateRestaurantId(restaurantId);
  if (restaurantIdError) errors.push(restaurantIdError);

  // ─── items ─────────────────────────────────────────────────────────────────
  const itemsErrors = validateItems(items);
  if (itemsErrors && itemsErrors.length > 0) errors.push(...itemsErrors);

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
  | { data: ModifyCartInput; errors: ValidationError[] }
  | { data: null; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  const bodyError = validateBody(body);
  if (bodyError) {
    return { data: null, errors: [bodyError] };
  }

  const { customerId, itemId, quantity } = body as Record<string, unknown>;

  const customerIdError = validateGenericNumber(customerId, 'customerId');
  if (customerIdError) errors.push(customerIdError);

  const itemIdError = validateGenericNumber(itemId, 'itemId');
  if (itemIdError) errors.push(itemIdError);

  const quantityError = validateGenericNumber(quantity, 'quantity');
  if (quantityError) errors.push(quantityError);

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      customerId: customerId as number,
      itemId: itemId as number,
      quantity: quantity as number,
    },
    errors: [],
  };
};

export const validateDeleteCartItem = (
  body: unknown,
): { data: DeleteCartItem | null; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  const bodyError = validateBody(body);
  if (bodyError) {
    return { data: null, errors: [bodyError] };
  }

  const { customerId, itemId } = body as Record<string, unknown>;

  const customerIdError = validateGenericNumber(customerId, 'customerId');
  if (customerIdError) errors.push(customerIdError);

  const itemIdError = validateGenericNumber(itemId, 'itemId');
  if (itemIdError) errors.push(itemIdError);

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      customerId: customerId as number,
      itemId: itemId as number,
    },
    errors: [],
  };
};
