import prisma from '../../../../lib/prisma';
import { OrderStatusEnum, Prisma } from '@prisma/client';
// @ts-ignore
//import { getSingleOrderView } from '../../../../prisma/sql/getSingleOrderView.sql';
import { getSingleOrderView } from '@prisma/client'; 

export class OrderRepository {
  /** Add order with details using transaction */
  static async createOrderAndDetails(
    data: {
      customerId: number;
      addressId: number;
      paymentTypeId: number;
      preferredDate: Date;
      orderStatusId: number;
      totalPrice: number;
      cart: any;
    },
    db: Prisma.TransactionClient = prisma,
  ) {
    const order = await db.order.create({
      data: {
        customerId: data.customerId,
        restaurantId: data.cart.restaurantId,
        addressId: data.addressId,
        paymentTypeId: data.paymentTypeId,
        orderStatusId: data.orderStatusId,
        preferredDate: data.preferredDate,
        totalPrice: data.totalPrice,
        paid: false,
        orderDetails: {
          create: data.cart.cartItems.map(
            (item: {
              menuItemId: any;
              name: any;
              quantity: any;
              price: any;
            }) => ({
              menuItemId: item.menuItemId,
              menuItemName: item.name,
              quantity: item.quantity,
              price: item.price,
            }),
          ),
        },
      },

      include: {
        orderDetails: true,
      },
    });

    return order;
  }

  // Check if order in order  table
  static async getSingleOrderById(
    customerId: number,
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return await db.order.findUnique({
      where: { id: orderId, customerId },
    });
  }
  static async getSingleOrderAndDetailsById(
    orderId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const order = await db.order.findUnique({
      relationLoadStrategy: 'join',
      where: { id: orderId },
      select: {
        id: true,
        customerId: true,
        totalPrice: true,
        paid: true,
        timestamp: true,

        restaurant: {
          select: { name: true },
        },

        paymentType: {
          select: { name: true },
        },

        address: {
          select: {
            state: true,
            city: true,
            street: true,
          },
        },

        orderStatus: {
          select: { name: true },
        },

        orderDetails: {
          select: {
            menuItemName: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
    return order;
  }

  // to get order based on query of its status: filtering
  // Service, controller
  static async getOrdersByCustomerAndOrderStatus(
    customerId: number,
    orderStatus: OrderStatusEnum,
    db: Prisma.TransactionClient = prisma,
  ) {
    return await db.order.findMany({
      relationLoadStrategy: 'join',
      where: {
        customerId,
        orderStatus: {
          name: orderStatus,
        },
      },
      select: {
        id: true,
        totalPrice: true,
        paid: true,
        timestamp: true,

        restaurant: {
          select: { name: true },
        },

        paymentType: {
          select: { name: true },
        },

        address: {
          select: {
            state: true,
            city: true,
            street: true,
          },
        },

        orderStatus: {
          select: { name: true },
        },

        orderDetails: {
          select: {
            menuItemName: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
  }

  /** Get order status by ID */
  static async getOrderStatusById(
    statusId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.orderStatus.findUnique({
      where: { id: statusId },
    });
  }
  // Get order status name
  static async getOrderStatusByName(
    statusName: OrderStatusEnum,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.orderStatus.findFirst({
      where: { name: statusName },
      select: { id: true, name: true },
    });
  }
  /** Edit order status */
  static async updateOrderStatusByName(
    orderId: number,
    statusName: OrderStatusEnum,
    db: Prisma.TransactionClient = prisma,
  ) {
    const status = await db.orderStatus.findFirst({
      where: { name: statusName },
    });
    if (!status) {
      throw new Error(`Order status ${statusName} not found in database.`);
    }
    return db.order.update({
      where: { id: orderId },
      data: { orderStatusId: status.id },
    });
  }
}
