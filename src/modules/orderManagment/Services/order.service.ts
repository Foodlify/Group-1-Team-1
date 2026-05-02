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
import { OrderContext } from '../States/OrderContext';
import { OrderSummaryService } from './orderSummary.service';
export class OrderService {
  // Validate if cart exist and its items are valid to create order [is exist, is stock ok, is price changed]
  static async validCartAntItems(customerId: number) {
    return await prisma.$transaction(async (tx) => {
      // Check if  customer has a cart
      const cart = await CartRepository.findCartByCustomerId(tx, customerId);
      if (!cart) {
        throw new NOT_FOUND(ENTITIES.CART);
      }
      // Check if  restaurant exist
      const restaurant = await RestaurantRepository.findRestaurantById(
        tx,
        cart.restaurantId,
      );
      if (!restaurant) {
        throw new NOT_FOUND(ENTITIES.RESTAURANT);
      }
      // Check cart items
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
      //  Calculate total price
      const totalPrice = cart.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      return { cart, totalPrice };
    });
  }

  static async placeOrder(
    input: CreateOrderInput,
  ): Promise<CreateOrderResponse> {
    const { customerId, addressId, paymentTypeId, preferredDate } = input;
    const { cart, totalPrice } = await this.validCartAntItems(customerId);
    return await prisma.$transaction(async (tx) => {
      // check if address belong to Customer
      const address = await AddressRepository.findAddressByIdAndCustomerId(
        tx,
        addressId,
        customerId,
      );
      if (!address) {
        throw new NOT_FOUND(ENTITIES.ADDRESS);
      }
      // Check if Payment integration type exist in system
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

      // Create Order and its details
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
    ) as any[];
    if (!order_MV || order_MV.length === 0) {
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
      totalPrice: orderRow.total_price,
      date: orderRow.timestamp,
      restaurantName: orderRow.restaurant_name,
      paymentMethod: orderRow.payment_method,
      state: orderRow.state,
      city: orderRow.city,
      street: orderRow.street,
      status: orderRow.order_status,
      orderDetails: orderRow.order_details.map((od: any) => ({
        name: od.name,
        quantity: od.quantity,
        price: od.price,
      })),
    } as SingleOrderResponse;
  }

  static async updateOrderStatus(
    customerId: number,
    orderId: number,
    action: 'confirm' | 'process' | 'pickup' | 'out_for_delivery' | 'deliver' | 'cancel' | 'refund'
  ): Promise<void> {
    const order = await OrderRepository.getSingleOrderById(customerId, orderId);
    if (!order) {
      throw new NOT_FOUND(ENTITIES.ORDER);
    }

    const currentStatusEntity = await OrderRepository.getOrderStatusById(order.orderStatusId);
    if (!currentStatusEntity) {
      throw new BAD_REQUEST(ENTITIES.ORDER_STATUS);
    }

    const context = new OrderContext(currentStatusEntity.name);

    switch (action) {
      case 'confirm':
        context.confirm();
        break;
      case 'process':
        context.process();
        break;
      case 'pickup':
        context.pickup();
        break;
      case 'out_for_delivery':
        context.outForDelivery();
        break;
      case 'deliver':
        context.deliver();
        await OrderService.insertOrderSummaryTrigger(customerId, orderId);
        break;
      case 'cancel':
        context.cancel();
        break;
      case 'refund':
        context.refund();
        break;
      default:
        throw new Error(`Invalid action ${action}`);
    }

    const newStatusEnum = context.getCurrentStatus();
    await OrderRepository.updateOrderStatusByName(orderId, newStatusEnum);
  }

  private static async insertOrderSummaryTrigger(customerId: number, orderId: number) {
    const orderDetails = await OrderService.getSingleOrder(customerId, orderId);

    const totalQuantity = orderDetails.orderDetails.reduce((sum: number, item: any) => sum + item.quantity, 0);

    await OrderSummaryService.addOrderSummary({
      customerId,
      orderId,
      restaurantName: orderDetails.restaurantName,
      totalAmount: orderDetails.totalPrice,
      totalQuantity,
      orderDate: orderDetails.date instanceof Date ? orderDetails.date : new Date(orderDetails.date)
    });
  }
}
