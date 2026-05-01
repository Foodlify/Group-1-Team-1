import prisma from '../../../../lib/prisma';
import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../../prisma/entities';
import {
  CreateOrderInput,
  CreateOrderResponse,
  SingleOrderResponse,
} from '../order.model';
import { OrderRepository } from '../Repositories/order.repository';
import { CartRepository } from '../../cartManagement/cart.repository';
import { QuantityExceed } from '../../cartManagement/cart.execption';
import { errorMessage } from '../../../shared_infrastructure/error/errorMessages';
import { PriceNotMatch } from '../order.exception';
import { MenuRepository } from '../../restaurantManagemet/menu.repository';
import { AddressRepository } from '../../customerManagement/address.repository';
import { RestaurantRepository } from '../../restaurantManagemet/restaurant.repository';
import { PaymentRepository } from '../../paymentManagement/payment.repository';
export class OrderService {
  static async placeOrder(
    input: CreateOrderInput,
  ): Promise<CreateOrderResponse> {
    const { customerId, addressId, paymentTypeId, preferredDate } = input;
    return await prisma.$transaction(async (tx) => {
      // check if cart exist
      const cart = await CartRepository.findCartByCustomerId(tx, customerId);
      if (!cart) {
        throw new NOT_FOUND(ENTITIES.CART);
      }
      // Check cartItems existence, quantity, price
      for (const ci of cart.cartItems) {
        const { menuItemId, quantity, price } = ci;
        const menuItem = await MenuRepository.findMenuItemById(tx, menuItemId);

        if (!menuItem) {
          throw new NOT_FOUND(ENTITIES.MENU_ITEM);
        }
        if (quantity > menuItem?.stock) {
          throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
        }
        if (price != menuItem?.price) {
          throw new PriceNotMatch(
            `${menuItem.itemName}: ${errorMessage.PRICE_NOT_MATCH.message}`,
          );
        }
      }
      // check if address belong to Customer
      const address = await AddressRepository.findAddressByIdAndCustomerId(
        tx,
        addressId,
        customerId,
      );
      if (!address) {
        throw new NOT_FOUND(ENTITIES.ADDRESS);
      }

      // get restaurant name
      const restaurant = await RestaurantRepository.findRestaurantById(
        tx,
        cart.restaurantId,
      );
      if (!restaurant) {
        throw new NOT_FOUND(ENTITIES.RESTAURANT);
      }

      // get paymentType name
      const paymentType = await PaymentRepository.findPaymentTypeById(
        tx,
        paymentTypeId,
      );
      if (!paymentType) {
        throw new NOT_FOUND(ENTITIES.PAYMENT_INTEGRATION_TYPE);
      }
      // get orderStatusId of "pending"
      const orderStatus = await OrderRepository.getOrderStatusPending(tx);
      if (!orderStatus) {
        throw new NOT_FOUND(ENTITIES.ORDER_STATUS);
      }

      // 2. Calculate total price
      const totalPrice = cart.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const order = await OrderRepository.createOrderAndDetails(tx, {
        customerId,
        addressId,
        paymentTypeId,
        preferredDate,
        orderStatusId: orderStatus.id,
        totalPrice,
        cart,
      });
      if (!order) {
        throw new BAD_REQUEST(ENTITIES.ORDER);
      }
      return {
        orderId: order.id,
        totalPrice: order.totalPrice,
        createdAt: order.timestamp,
        restaurantId: order.restaurantId,
        addressId: order.addressId,
        statusId: order.orderStatusId,
        orderDetails: ((order as any).orderDetails ?? []).map(
          (detail: any) => ({
            ...detail,
            name: detail.menuItemName,
          }),
        ),
      };
    });
  }
  static async getSingleOrder(
    customerId: number,
    orderId: number,
  ): Promise<SingleOrderResponse> {
    const order = await OrderRepository.getSingleOrderById(customerId, orderId);

    if (!order) {
      throw new NOT_FOUND(ENTITIES.ORDER);
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
      throw new NOT_FOUND(ENTITIES.ORDER);
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
