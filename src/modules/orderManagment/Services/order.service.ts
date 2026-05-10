import prisma from '../../../../lib/prisma';
import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../../prisma/entities';
import { CreateOrderInput, SingleOrderResponse, CustomerOrdersByStatusResponse } from '../order.model';
import { OrderRepository } from '../Repositories/order.repository';
import { PaymentService } from '../../paymentManagement/Services/payment.service';
import { OrderContext } from '../States/OrderContext';
import { OrderSummaryService } from './orderSummary.service';
import { AddressService } from '../../customerManagement/Services/address.service';
import { CartService } from '../../cartManagement/cart.service';
import { PaymentStrategy } from '../../paymentManagement/PaymentStrategies/payment.strategy';
import { TransactionService } from '../../paymentManagement/Services/transaction.service';
import { OrderStatusEnum, PaymentTypeEnum, Prisma } from '@prisma/client';
const cart_service = new CartService();
export class OrderService {
  static async getOrderStatus(
    tx: Prisma.TransactionClient,
    paymentName: PaymentTypeEnum,
  ) {
    let orderStatus;
    if (paymentName === PaymentTypeEnum.CASH) {
      orderStatus = await OrderRepository.getOrderStatusByName(
        tx,
        OrderStatusEnum.CONFIRMED,
      );
    } else {
      orderStatus = await OrderRepository.getOrderStatusByName(
        tx,
        OrderStatusEnum.PENDING,
      );
    }
    if (!orderStatus) {
      throw new NOT_FOUND(ENTITIES.ORDER_STATUS);
    }
    return orderStatus.id;
  }
  static async placeOrder(input: CreateOrderInput): Promise<any> {
    const { customerId, addressId, paymentTypeId, preferredDate } = input;
    const cart = await cart_service.getCustomerCart(customerId);
    // prevent duplicate place order of same cart
    if (cart?.isLocked) {
      throw new Error('This cart already placed');
    }
    // check if address belong to Customer
    const address = await AddressService.getAddressByCustomerId(
      customerId,
      addressId,
    );
    // Check if Payment integration type exist in system
    const paymentType = await PaymentService.getPaymentTypeById(paymentTypeId);

    // Create Order and its details
    return await prisma.$transaction(async (tx) => {
      // lock Cart, Check price,deduct menu item stock
      const { cart, totalPrice } = await CartService.validCartAntItemsForOrder(
        tx,
        customerId,
      );
      // create Order
      const statusId = await OrderService.getOrderStatus(tx, paymentType.name);
      const order = await OrderRepository.createOrderAndDetails(tx, {
        customerId,
        addressId: address.id,
        paymentTypeId: paymentType.id,
        preferredDate,
        orderStatusId: statusId,
        totalPrice,
        cart,
      });

      if (!order) {
        throw new BAD_REQUEST(ENTITIES.ORDER);
      }
      // Create pending transaction
      const paymentStrategy = new PaymentStrategy(paymentType.name);
      const transaction = await paymentStrategy.createPayment(order);
      await TransactionService.createTransaction(
        tx,
        order.id,
        paymentType.id,
        transaction.id,
        order.totalPrice,
      );
      return transaction;
    });
  }
  // -------------------------------------------------------------------------------------------------------
  static async getSingleOrder(
    customerId: number,
    orderId: number,
  ): Promise<SingleOrderResponse> {
    const order = await OrderRepository.getSingleOrderById(customerId, orderId);
    if (!order) {
      throw new NOT_FOUND(ENTITIES.ORDER);
    }
    const result = await OrderRepository.getSingleOrderAndDetailsById(orderId);
    if (!result) {
      throw new NOT_FOUND(ENTITIES.ORDER);
    }
    const orderRow = result;
    return {
      orderId: orderRow.id,
      totalPrice: orderRow.totalPrice,
      date: orderRow.timestamp,
      restaurantName: orderRow.restaurant.name,
      paymentMethod: orderRow.paymentType.name,
      state: orderRow.address.state,
      city: orderRow.address.city,
      street: orderRow.address.street,
      status: orderRow.orderStatus.name,
      orderDetails: orderRow.orderDetails.map((od: any) => ({
        name: od.name,
        quantity: od.quantity,
        price: od.price,
      })),
    } as SingleOrderResponse;
  }

  static async updateOrderStatus(
    customerId: number,
    orderId: number,
    newStatus: OrderStatusEnum,
  ): Promise<void> {
    const order = await OrderRepository.getSingleOrderById(customerId, orderId);
    if (!order) {
      throw new NOT_FOUND(ENTITIES.ORDER);
    }

    const currentStatusEntity = await OrderRepository.getOrderStatusById(
      order.orderStatusId,
    );
    if (!currentStatusEntity) {
      throw new BAD_REQUEST(ENTITIES.ORDER_STATUS);
    }

    const context = new OrderContext(currentStatusEntity.name);

    // Map the target status enum to the corresponding state transition
    switch (newStatus) {
      case OrderStatusEnum.CONFIRMED:
        context.confirm();
        break;
      case OrderStatusEnum.PROCESSED:
        context.process();
        break;
      case OrderStatusEnum.READY_TO_PICKUP:
        context.pickup();
        break;
      case OrderStatusEnum.OUT_FOR_DELIVERY:
        context.outForDelivery();
        break;
      case OrderStatusEnum.DELIVERED:
        context.deliver();
        await OrderService.insertOrderSummaryTrigger(customerId, orderId);
        break;
      case OrderStatusEnum.CANCELLED:
        context.cancel();
        break;
      case OrderStatusEnum.REFUNDED:
        context.refund();
        break;
      default:
        throw new Error(`Cannot transition to status ${newStatus}`);
    }

    const resolvedStatus = context.getCurrentStatus();
    await OrderRepository.updateOrderStatusByName(orderId, resolvedStatus);
  }

  static async getOrdersByStatus(
    customerId: number,
    status: OrderStatusEnum,
  ): Promise<CustomerOrdersByStatusResponse[]> {
    const orders = await OrderRepository.getOrdersByCustomerAndOrderStatus(
      customerId,
      status,
    );

    return orders.map((order: any) => ({
      orderId: order.id,
      totalPrice: order.totalPrice,
      date: order.timestamp,
      restaurantName: order.restaurant.name,
      paymentMethod: order.paymentType.name,
      state: order.address.state,
      city: order.address.city,
      street: order.address.street,
      status: order.orderStatus.name,
      orderDetails: order.orderDetails.map((od: any) => ({
        name: od.menuItemName,
        quantity: od.quantity,
        price: od.price,
      })),
    }));
  }

  private static async insertOrderSummaryTrigger(
    customerId: number,
    orderId: number,
  ) {
    const orderDetails = await OrderService.getSingleOrder(customerId, orderId);

    const totalQuantity = orderDetails.orderDetails.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );

    await OrderSummaryService.addOrderSummary({
      customerId,
      orderId,
      restaurantName: orderDetails.restaurantName,
      totalAmount: orderDetails.totalPrice,
      totalQuantity,
      orderDate:
        orderDetails.date instanceof Date
          ? orderDetails.date
          : new Date(orderDetails.date),
    });
  }
}
