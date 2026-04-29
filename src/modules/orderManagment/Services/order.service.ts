import { CartService } from '../../cartManagement/cart.service';
import { CreateOrderInput, SingleOrderResponse } from '../order.model';
import { OrderRepository } from '../Repositories/order.repository';
const cartService = new CartService();
export class OrderService {
  static async PlaceOrder(
    input: CreateOrderInput,
  ): Promise<SingleOrderResponse> {
    try {
      const result = await OrderRepository.createOrderAndDetails(input);
      return {
        orderId: result.id,
        totalPrice: result.totalPrice,
        date: result.timestamp,
        restaurantName: result.restaurantName,
        address: result.deliveryAddress,
        status: result.status,
        orderDetails: ((result as any).orderDetails ?? []).map(
          (detail: any) => ({
            ...detail,
            name: detail.menuItemName,
          }),
        ),
      };
    } catch (error) {
      throw error;
    }
  }
}
