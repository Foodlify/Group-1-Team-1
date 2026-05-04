import prisma from '../../../../lib/prisma';
import { getSingleOrderView } from '@prisma/client/sql';
import { OrderStatusEnum } from '@prisma/client';
import { Prisma } from '@prisma/client/extension';

export class OrderRepository {
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
    // 3. Create Order + OrderDetails
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

  // Generate single order with its order details Materialized view
  static async createSingleOrderMV() {
    const result = await prisma.$queryRawTyped(getSingleOrderView());
  }
  // Refresh single_order_details  Materialized view
  static async refreshSingleOrderMV() {
    await prisma.$executeRaw`REFRESH MATERIALIZED VIEW single_order_details_MV`;
  }
  // Check if order in order  table
  static async getSingleOrderById(customerId: number, orderId: number) {
    return await prisma.order.findUnique({
      where: { id: orderId, customerId },
    });
  }
  static async getSingleOrderAndDetailsById(orderId: number) {
    const order = await prisma.order.findUnique({
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
  // Check if order in single_order_details Materialized view
  static async getSingleOrderByIdMV(customerId: number, orderId: number) {
    return await prisma.$queryRaw`
  SELECT order_id
  FROM single_order_details_MV
  WHERE order_id = ${orderId} AND customer_id= ${customerId}
`;
  }
  // get order and its order details from view
  static async getSingleOrderAndDetailsById_MV(orderId: number) {
    return await prisma.$queryRaw`
        SELECT 
          o.order_id,
          o.customer_id,
          o.restaurant_name,
          o.payment_method,
          o.city,
          o.street,
          o.order_status,
          o.total_price,
          o.paid,
          o.timestamp,
        
          json_agg(
            json_build_object(
              'name', od.menu_item_name,
              'quantity', od.quantity,
              'price', od.price
            )
          ) AS order_details
        
        FROM single_order_details_MV o
        
        LEFT JOIN "OrderDetail" od 
          ON od.order_id = o.order_id
        
        WHERE o.order_id = ${orderId}
        
        GROUP BY 
          o.order_id, o.customer_id, o.restaurant_name, 
          o.payment_method,o.state, o.city, o.street, 
          o.order_status, o.total_price, o.paid, o.timestamp;
`;
  }

  // to get order based on query of its status
  // Service, controller
  static async getOrdersByCustomerAndOrderStatus(
    customerId: number,
    orderStatus: OrderStatusEnum,
  ) {
    return await prisma.order.findMany({
      where: {
        customerId,
        orderStatus: {
          name: orderStatus,
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
