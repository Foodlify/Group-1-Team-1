import prisma from '../../../../lib/prisma';

export class OrderRepository {
  /** Add order with details */
  static async createOrder(orderData: any, orderDetails: any[]) {
    return prisma.order.create({
      data: {
        ...orderData,
        orderDetails: {
          create: orderDetails,
        },
      },
      include: {
        orderDetails: true,
      },
    });
  }

  /** Get order by id */
  static async getOrderById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderDetails: true,
        orderTrackings: {
          include: { status: true },
          orderBy: { statusDate: 'desc' }
        },
        orderSummary: true,
        customer: true,
        restaurant: true,
        address: true,
        paymentType: true,
        orderStatus: true,
      },
    });
  }
  // static async getOrderById(id: number) {
  //   return prisma.order.findUnique({
  //     where: { id },
  //     // دي هتخليها Query واحدة سريعة لو الداتا بيز بتدعم الـ Joins
  //     relationLoadStrategy: 'join', 
  //     select: {
  //       id: true,
  //       orderNumber: true, // اختاري العواميد اللي محتاجاها بس
  //       orderStatus: true,
  //       orderDetails: true,
  //       orderTrackings: {
  //         select: {
  //           id: true,
  //           status: { select: { name: true } }, // Nested select
  //           statusDate: true,
  //         },
  //         orderBy: { statusDate: 'desc' }
  //       },
  //       // بدلاً من include: true، هاتي الأساسيات فقط
  //       customer: {
  //         select: { id: true, name: true, phone: true }
  //       },
  //       restaurant: {
  //         select: { id: true, name: true, location: true }
  //       },
  //       address: true,
  //       paymentType: true,
  //       orderSummary: true,
  //     },
  //   });
  // }
  /** Get all orders by customer */
  static async getOrdersByCustomer(customerId: number) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        orderDetails: true,
        orderStatus: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /** Edit order status */
  static async updateOrderStatus(orderId: number, orderStatusId: number) {
    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatusId },
    });
  }

  /** Edit order */
  static async updateOrder(orderId: number, updateData: any) {
    return prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  }
}
