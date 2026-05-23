export const ENTITIES = {
  USER: 'User',
  CUSTOMER: 'Customer',
  ADDRESS: 'Address',

  RESTAURANT: 'Restaurant',
  MENU: 'Menu',
  MENU_ITEM: 'MenuItem',

  CART: 'Cart',
  CART_ITEM: 'CartItem',

  ORDER: 'Order',
  ORDER_STATUS: 'OrderStatus',
  ORDER_DETAIL: 'OrderDetail',
  ORDER_TRACKING: 'OrderTracking',
  ORDER_SUMMARY: 'OrderSummary',

  PAYMENT_INTEGRATION_TYPE: 'PaymentIntegrationType',
  PAYMENT_CONFIGURATION: 'PaymentConfiguration',

  TRANSACTION: 'Transaction',
  TRANSACTION_STATUS: 'TransactionStatus',
  TRANSACTION_DETAIL: 'TransactionDetail',

  SUPPORT_TICKET: 'SupportTicket',
  RESTAURANT_RATE: 'RestaurantRate',
  LOYALTY_POINTS: 'LoyaltyPoints',
} as const;
