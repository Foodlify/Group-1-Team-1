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
export interface SingleOrderResponse {
  orderId: number;
  totalPrice: number;
  date: Date;
  restaurantName: string;
  address: string;
  status: string;
  orderDetails: OrderDetails[];
}
