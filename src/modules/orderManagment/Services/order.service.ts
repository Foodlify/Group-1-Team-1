import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../../shared_infrastructure/error/error.execption';
import { PriceNotMatch } from '../order.exception';
import { ENTITIES } from '../../../../prisma/entities';
import {
  CreateOrderInput,
  SingleOrderResponse,
  CustomerOrdersByStatusResponse,
} from '../order.model';
import { OrderRepository } from '../Repositories/order.repository';
import { OrderContext } from '../States/OrderContext';
import { OrderSummaryService } from './orderSummary.service';
import { OrderTrackingService } from './orderTracking.service';

import { CartService } from '../../cartManagement/cart.service';
import {
  OrderStatusEnum,
  PaymentTypeEnum,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { CreateOrder } from '../chainPattern/createOrder';
import prisma from '../../../../lib/prisma';
import { MenuService } from '../../restaurantManagemet/Services/menu.service';
import { CartRepository } from '../../cartManagement/cart.repository';
import { CartRedisRepository } from '../../cartManagement/cart.redis.repository';
import {
  MenuItemNotFound,
  QuantityExceed,
  RestaurantNotMatch,
} from '../../cartManagement/cart.execption';
import { CheckoutResponse } from '../order.model';
import { errorMessage } from '../../../shared_infrastructure/error/errorMessages';

export class OrderService {
  static async getOrderStatus(
    paymentName: PaymentTypeEnum,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Getting order status for payment type', {
      paymentName,
    });
    let orderStatus;
    if (paymentName === PaymentTypeEnum.CASH) {
      orderStatus = await OrderRepository.getOrderStatusByName(
        OrderStatusEnum.CONFIRMED,
        db,
      );
    } else {
      orderStatus = await OrderRepository.getOrderStatusByName(
        OrderStatusEnum.PENDING,
        db,
      );
    }
    if (!orderStatus) {
      loggerService.warn('Order status not found', { paymentName });
      throw new NOT_FOUND(ENTITIES.ORDER_STATUS);
    }
    loggerService.info('Order status resolved', {
      paymentName,
      statusId: orderStatus.id,
    });
    return orderStatus.id;
  }

  static async placeOrder(input: CreateOrderInput): Promise<any> {
    const { customerId, addressId, paymentTypeId, preferredDate } = input;
    loggerService.info('Place order attempt', {
      customerId,
      addressId,
      paymentTypeId,
    });

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        const result = await CreateOrder.processOrder().handle(
          { customerId, addressId, paymentTypeId, preferredDate },
          { tx, customerId },
        );
        loggerService.info('Order placed successfully', {
          customerId,
          addressId,
          paymentTypeId,
        });
        return result;
      } catch (error) {
        loggerService.error('Place order failed', error as Error, {
          customerId,
          addressId,
          paymentTypeId,
        });
        throw error;
      }
    });
  }

  static async checkout(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<CheckoutResponse> {
    loggerService.info('Checkout attempt', { customerId });

    const redisCart =
      await CartRedisRepository.findCartByCustomerId(customerId);
    if (!redisCart || redisCart.items.length === 0) {
      loggerService.warn('Checkout failed: cart empty or not found', {
        customerId,
      });
      throw new Error('Cart is empty or not found');
    }

    const items = redisCart.items;
    const itemIds = items.map((i) => i.menuItemId);

    // 2. Fetch all menu items in a single query (findMany) via MenuService
    const menuItems = await MenuService.getMenuItemsByIds(itemIds, db);

    if (menuItems.length !== items.length) {
      loggerService.warn('Checkout failed: one or more menu items not found', {
        customerId,
      });
      throw new MenuItemNotFound('One or more menu items were not found');
    }

    const restaurantId = menuItems[0].restaurantId;

    for (const item of items) {
      const menuItem = menuItems.find((mi: any) => mi.id === item.menuItemId)!;

      if (menuItem.restaurantId !== restaurantId) {
        loggerService.warn('Checkout failed: restaurant mismatch', {
          customerId,
          menuItemId: item.menuItemId,
        });
        throw new RestaurantNotMatch(errorMessage.RESTAURANT_NOT_MATCH.message);
      }
      if (item.quantity > menuItem.stock) {
        loggerService.warn('Checkout failed: quantity exceeds stock', {
          customerId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          stock: menuItem.stock,
        });
        throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
      }
      if (Number(menuItem.price) !== item.price) {
        loggerService.warn('Checkout failed: price changed', {
          customerId,
          menuItemId: item.menuItemId,
          cartPrice: item.price,
          currentPrice: menuItem.price,
        });
        throw new PriceNotMatch(
          `Price changed for item ${menuItem.itemName}. Please update your cart.`,
        );
      }
    }

    return await prisma.$transaction(async (tx) => {
      const existingCart = await CartRepository.findCartByCustomerId(
        customerId,
        tx,
      );
      if (existingCart) {
        if (existingCart.isLocked) {
          loggerService.warn('Checkout failed: cart is locked', {
            customerId,
            cartId: existingCart.id,
          });
          throw new Error("This cart is locked, you can't checkout right now");
        }
        await CartRepository.clearCart(existingCart.id, tx);
      }

      const cartItemsToInsert = items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      await CartRepository.createCartWithManyItems(
        customerId,
        restaurantId,
        cartItemsToInsert,
        tx,
      );

      loggerService.info('Checkout completed', {
        customerId,
        restaurantId,
        itemsCount: items.length,
      });
      return {
        customerId,
        restaurantId,
        itemsCount: items.length,
        cartItems: cartItemsToInsert,
      };
    });
  }

  // -------------------------------------------------------------------------------------------------------
  static async getSingleOrder(
    customerId: number,
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<SingleOrderResponse> {
    loggerService.info('Get single order', { customerId, orderId });

    const order = await OrderRepository.getSingleOrderById(
      customerId,
      orderId,
      db,
    );
    if (!order) {
      loggerService.warn('Order not found', { customerId, orderId });
      throw new NOT_FOUND(ENTITIES.ORDER);
    }
    const result = await OrderRepository.getSingleOrderAndDetailsById(
      orderId,
      db,
    );
    if (!result) {
      loggerService.warn('Order details not found', { customerId, orderId });
      throw new NOT_FOUND(ENTITIES.ORDER);
    }
    loggerService.info('Single order retrieved', { customerId, orderId });
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

  /**
   * Update order status + automatically insert a tracking record.
   * @param createdBy  User ID of the actor making this change (from auth middleware)
   */
  static async updateOrderStatus(
    customerId: number,
    orderId: number,
    newStatus: OrderStatusEnum,
    db: Prisma.TransactionClient = prisma,
    createdBy?: number,
  ): Promise<void> {
    loggerService.info('Update order status', {
      customerId,
      orderId,
      newStatus,
    });

    const order = await OrderRepository.getSingleOrderById(
      customerId,
      orderId,
      db,
    );
    if (!order) {
      loggerService.warn('Update order status failed: order not found', {
        customerId,
        orderId,
      });
      throw new NOT_FOUND(ENTITIES.ORDER);
    }

    const currentStatusEntity = await OrderRepository.getOrderStatusById(
      order.orderStatusId,
      db,
    );
    if (!currentStatusEntity) {
      loggerService.warn(
        'Update order status failed: current status not found',
        { orderId, orderStatusId: order.orderStatusId },
      );
      throw new BAD_REQUEST(ENTITIES.ORDER_STATUS);
    }

    const context = new OrderContext(currentStatusEntity.name);

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
        await OrderService.insertOrderSummaryTrigger(customerId, orderId, db);
        break;
      case OrderStatusEnum.CANCELLED:
        context.cancel();
        break;
      case OrderStatusEnum.REFUNDED:
        context.refund();
        break;
      default:
        loggerService.warn('Update order status failed: invalid transition', {
          orderId,
          newStatus,
        });
        throw new Error(`Cannot transition to status ${newStatus}`);
    }

    const resolvedStatus = context.getCurrentStatus();
    await OrderRepository.updateOrderStatusByName(orderId, resolvedStatus, db);

    const newStatusEntity = await OrderRepository.getOrderStatusByName(
      resolvedStatus,
      db,
    );
    if (newStatusEntity) {
      await OrderTrackingService.addOrderTrackingStatus(
        orderId,
        newStatusEntity.id,
        createdBy,
        db,
      );
    }

    loggerService.info('Order status updated', {
      customerId,
      orderId,
      from: currentStatusEntity.name,
      to: resolvedStatus,
    });
  }

  static async getOrdersByStatus(
    customerId: number,
    status: OrderStatusEnum,
    db: Prisma.TransactionClient = prisma,
  ): Promise<CustomerOrdersByStatusResponse[]> {
    loggerService.info('Get orders by status', { customerId, status });

    const orders = await OrderRepository.getOrdersByCustomerAndOrderStatus(
      customerId,
      status,
    );
    loggerService.info('Orders retrieved by status', {
      customerId,
      status,
      count: orders.length,
    });

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
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Inserting order summary trigger', {
      customerId,
      orderId,
    });

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

    loggerService.info('Order summary inserted', {
      customerId,
      orderId,
      totalQuantity,
    });
  }
}
