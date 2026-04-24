// export const errorMessage = {
//     customer_not_found : 'CustomerNotFoundException',
//     message : 'Customer with the specified ID does not exist'
// }

export const errorMessage = {
  CUSTOMER_NOT_FOUND: {
    code: 'CustomerNotFoundException',
    message: 'Customer with the specified ID does not exist',
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
};

export const successMessage = {
  CUSTOMER_FOUND: {
    message: 'Customer login  successfully ',
  },
  CART_ITEM_ADDED: {
    message: 'Items added to cart successfully',
  },
  CART_ITEM_QUANTITY_UPDATED: {
    message: 'Item quantity updated successfully',
  },
  CART_ITEM_DELETED: {
    message: 'Item deleted successfully',
  },
  CART_CLEARED: {
    message: 'Cart cleared successfully',
  },
  CART_VIEWED: {
    message: 'Cart retrieved successfully',
  },
  TOTAL_PRICE_GET: {
    message: 'Total price returned successfully',
  },
  TOTAL_QUANTITY_GET: {
    message: 'Total quantity returned successfully',
  },
};
