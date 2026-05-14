import prisma from '../../../../lib/prisma';
// @ts-ignore
//import { getSingleOrderView } from '../../../../prisma/sql/getSingleOrderView.sql';
import { getSingleOrderView } from '@prisma/client'; 
import { OrderStatusEnum } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class OrderRepository {
  /** Add order with details using transaction */
  static async createOrderAndDetails(
    tx: Prisma.TransactionClient,
    data: {
      customerId: number;
      addressId: number;
      paymentTypeId: number;
      preferredDate: Date;
      orderStatusId: number;
      totalPrice: number;
      cart: any;
    },
  ) {
    const order = await tx.order.create({
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
  static async getSingleOrderById(customerId: number, orderId: number) {
    return await prisma.order.findUnique({
      where: { id: orderId, customerId },
    });
  }
  static async getSingleOrderAndDetailsById(orderId: number) {
    const order = await prisma.order.findUnique({
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
  ) {
    return await prisma.order.findMany({
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
  static async getOrderStatusById(statusId: number) {
    return prisma.orderStatus.findUnique({
      where: { id: statusId },
    });
  }
  // Get order status name
  static async getOrderStatusByName(
    tx: Prisma.TransactionClient,
    statusName: OrderStatusEnum,
  ) {
    return tx.orderStatus.findFirst({
      where: { name: statusName },
      select: { id: true, name: true },
    });
  }
  /** Edit order status */
  static async updateOrderStatusByName(
    orderId: number,
    statusName: OrderStatusEnum,
  ) {
    const status = await prisma.orderStatus.findFirst({
      where: { name: statusName },
    });
    if (!status) {
      throw new Error(`Order status ${statusName} not found in database.`);
    }
    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatusId: status.id },
    });
  }
}
