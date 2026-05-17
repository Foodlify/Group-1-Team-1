export interface OrderDetails {
  name: string;
  quantity: number;
  price: number;
}

export interface CreateOrderInput {
  customerId: number;
  addressId: number;
  paymentTypeId: number;
  preferredDate: Date;
}
export interface CreateOrderResponse {
  orderId: number;
  totalPrice: number;
  createdAt: Date;
  restaurantId: number;
  addressId: number;
  statusId: number;
  orderDetails: OrderDetails[];
}
export interface SingleOrderResponse {
  orderId: number;
  totalPrice: number;
  date: Date;
  restaurantName: string;
  paymentMethod: string;
  state: string;
  city: string;
  street: string;
  status: string;
  orderDetails: OrderDetails[];
}

export interface CustomerOrdersByStatusResponse {
  orderId: number;
  totalPrice: number;
  date: Date;
  restaurantName: string;
  paymentMethod: string;
  state: string;
  city: string;
  street: string;
  status: string;
  orderDetails: OrderDetails[];
}

export interface OrderSummaryResponse {
  id: number;
  orderId: number;
  restaurantName: string;
  totalAmount: number;
  totalQuantity: number;
  orderDate: string; // formatted as YYYY-MM-DD
}

export interface CheckoutCartItem {
  menuItemId: number;
  quantity: number;
  price: number;
  name: string;
}

export interface CheckoutResponse {
  customerId: number;
  restaurantId: number;
  itemsCount: number;
  cartItems: CheckoutCartItem[];
}

export interface OrdersSummaryPaginatedResponse {
  data: OrderSummaryResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderTrackingHistoryResponse {
  id: number;
  orderId: number;
  statusId: number;
  createdBy: number | null;
  statusDate: Date;
  status: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}
