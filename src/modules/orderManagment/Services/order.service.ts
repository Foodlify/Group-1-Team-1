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
import { CreateOrder } from '../chainPattern/createOrder';
import prisma from '../../../../lib/prisma';
import { MenuService } from '../../restaurantManagemet/menu.service';
import { CartRepository } from '../../cartManagement/cart.repository';
import { CartRedisRepository } from '../../cartManagement/cart.redis.repository';
import { MenuItemNotFound, QuantityExceed, RestaurantNotMatch } from '../../cartManagement/cart.execption';
import { CheckoutResponse } from '../order.model';
import { errorMessage } from '../../../shared_infrastructure/error/errorMessages';

export class OrderService {
  static async getOrderStatus(
    paymentName: PaymentTypeEnum,
    db: Prisma.TransactionClient = prisma,
  ) {
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
      throw new NOT_FOUND(ENTITIES.ORDER_STATUS);
    }
    return orderStatus.id;
  }

  static async placeOrder(input: CreateOrderInput): Promise<any> {
    const { customerId, addressId, paymentTypeId, preferredDate } = input;
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        return await CreateOrder.processOrder().handle(
          {
            customerId,
            addressId,
            paymentTypeId,
            preferredDate,
          },
          {
            tx,
            customerId: customerId,
          },
        );
      } catch (error) {
        throw error;
      }
    });
  }

  static async checkout(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ): Promise<CheckoutResponse> {
    // 1. Fetch current cart from Redis
    const redisCart = await CartRedisRepository.findCartByCustomerId(customerId);
    
    if (!redisCart || redisCart.items.length === 0) {
      throw new Error('Cart is empty or not found');
    }

    const items = redisCart.items;
    const itemIds = items.map((i) => i.menuItemId);

    // 2. Fetch all menu items in a single query (findMany) via MenuService
    const menuItems = await MenuService.getMenuItemsByIds(itemIds, db);

    if (menuItems.length !== items.length) {
      throw new MenuItemNotFound('One or more menu items were not found');
    }

    // 3. Validate same restaurant, stock, and price
    const restaurantId = menuItems[0].restaurantId;

    for (const item of items) {
      const menuItem = menuItems.find((mi: any) => mi.id === item.menuItemId)!;

      if (menuItem.restaurantId !== restaurantId) {
        throw new RestaurantNotMatch(errorMessage.RESTAURANT_NOT_MATCH.message);
      }

      if (item.quantity > menuItem.stock) {
        throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
      }

      // Check if price changed
      if (Number(menuItem.price) !== item.price) {
        throw new PriceNotMatch(`Price changed for item ${menuItem.itemName}. Please update your cart.`);
      }
    }

    return await prisma.$transaction(async (tx) => {
      // 4. Rebuild PostgreSQL Cart
      const existingCart = await CartRepository.findCartByCustomerId(customerId, tx);
      if (existingCart) {
        if (existingCart.isLocked) {
          throw new Error("This cart is locked, you can't checkout right now");
        }
        await CartRepository.clearCart(existingCart.id, tx);
      }

      // 5. Batch insert new cart and items
      const cartItemsToInsert = items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));

      await CartRepository.createCartWithManyItems(
        customerId,
        restaurantId,
        cartItemsToInsert,
        tx
      );

      // 6. Return response

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
    const order = await OrderRepository.getSingleOrderById(
      customerId,
      orderId,
      db,
    );
    if (!order) {
      throw new NOT_FOUND(ENTITIES.ORDER);
    }
    const result = await OrderRepository.getSingleOrderAndDetailsById(
      orderId,
      db,
    );
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
    const order = await OrderRepository.getSingleOrderById(
      customerId,
      orderId,
      db,
    );
    if (!order) {
      throw new NOT_FOUND(ENTITIES.ORDER);
    }

    const currentStatusEntity = await OrderRepository.getOrderStatusById(
      order.orderStatusId,
      db,
    );
    if (!currentStatusEntity) {
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
        throw new Error(`Cannot transition to status ${newStatus}`);
    }

    const resolvedStatus = context.getCurrentStatus();

    // 1. Update the order's current status
    await OrderRepository.updateOrderStatusByName(orderId, resolvedStatus, db);

    // 2. ─── AUTO-TRIGGER: insert an OrderTracking record for every status change ───
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
  }

  static async getOrdersByStatus(
    customerId: number,
    status: OrderStatusEnum,
    db: Prisma.TransactionClient = prisma,
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
    db: Prisma.TransactionClient = prisma,
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
