import { NotFound } from '../../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../../prisma/entities';
import {
  CreateOrderInput,
  CreateOrderResponse,
  SingleOrderResponse,
} from '../order.model';
import { OrderRepository } from '../Repositories/order.repository';
export class OrderService {
  static async placeOrder(
    input: CreateOrderInput,
  ): Promise<CreateOrderResponse> {
    try {
      const result = await OrderRepository.createOrderAndDetails(input);
      return {
        orderId: result.id,
        totalPrice: result.totalPrice,
        createdAt: result.timestamp,
        restaurantId: result.restaurantId,
        addressId: result.addressId,
        statusId: result.orderStatusId,
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
  static async getSingleOrder(
    customerId: number,
    orderId: number,
  ): Promise<SingleOrderResponse> {
    const order = await OrderRepository.getSingleOrderById(customerId, orderId);

    if (!order) {
      throw new NotFound(ENTITIES.ORDER);
    }

    const order_MV = await OrderRepository.getSingleOrderByIdMV(
      customerId,
      orderId,
    );
    if (!order_MV) {
      await OrderRepository.refreshSingleOrderMV();
    }
    const result = (await OrderRepository.getSingleOrderAndDetailsById(
      orderId,
    )) as any[];
    if (!result || result.length === 0) {
      throw new NotFound(ENTITIES.ORDER);
    }
    const orderRow = result[0];
    return {
      orderId: orderRow.order_id,
      totalPrice: orderRow.totalPrice,
      date: orderRow.date,
      restaurantName: orderRow.restaurant_name,
      paymentMethod: orderRow.paymentMethod,
      state: orderRow.state,
      city: orderRow.city,
      street: orderRow.street,
      status: orderRow.status,
      orderDetails: orderRow.order_details.map((od: any) => ({
        name: od.item_name,
        quantity: od.quantity,
        price: od.price,
      })),
    } as SingleOrderResponse;
  }
}


