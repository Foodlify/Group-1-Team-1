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
