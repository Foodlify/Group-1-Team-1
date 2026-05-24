
export const errorMessage = {
  NOT_FOUND: {
    code: 'NotFoundException',
    message: 'with the specified ID does not exist',
  },
  BAD_REQUEST: {
    code: 'BadRequestException',
    message: 'failed to created',
  },
  CART_NOT_FOUND: {
    code: 'CartNotFoundException',
    message: 'Cart with the specified ID does not exist',
  },
  CART_ITEM_NOT_FOUND: {
    code: 'CartItemNotFoundException',
    message: 'CartItem with the specified ID does not exist',
  },
  MENU_ITEM_NOT_FOUND: {
    code: 'MenuItemNotFoundException',
    message: 'MenuItem with the specified ID does not exist',
  },
  ITEM_IDEMPOTENCY: {
    code: 'CartItemIdempotencyException',
    message: 'Item is already in the cart',
  },
  RESTAURANT_NOT_MATCH: {
    code: 'RestaurantNotMatchException',
    message:
      'Your cart already contains items from another restaurant. ' +
      'Only one restaurant is allowed per cart. ' +
      'Please clear your cart first if you want to order from a different restaurant.',
  },
  QUANTITY_EXCEED: {
    code: 'QuantityExceedException',
    message: 'Requested exceeds available stock',
  },
  PRICE_NOT_MATCH: {
    code: 'PriceNotMatchException',
    message: 'price has changed, please confirm if proceed or remove the item'
  },
  EMAIL_ALREADY_REGISTERED: {
    code: 'EmailAlreadyRegisteredException',
    message: 'Email already registered',
  },
  PHONE_ALREADY_REGISTERED: {
    code: 'PhoneAlreadyRegisteredException',
    message: 'Phone already registered',
  },
  INVALID_CREDENTIALS: {
    code: 'InvalidCredentialsException',
    message: 'Invalid email or password',
  },
  INVALID_TOKEN: {
    code: 'InvalidTokenException',
    message: 'Invalid or expired token',
  },
  CUSTOMER_NOT_FOUND: {
    code: 'CustomerNotFoundException',
    message: 'Customer not found',
  },
  PASSWORD_MISMATCH: {
    code: 'PasswordMismatchException',
    message: 'Passwords do not match',
  },
  USER_NOT_FOUND: {
    code: 'UserNotFoundException',
    message: 'User not found',
  },
  USER_EMAIL_TAKEN: {
    code: 'UserEmailTakenException',
    message: 'Email already registered',
  },
  ROLE_NOT_FOUND: {
    code: 'RoleNotFoundException',
    message: 'Role not found',
  },
};


