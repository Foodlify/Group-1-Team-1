import prisma from '../../../../lib/prisma';
import { getSingleOrderView } from '@prisma/client/sql';
import { CreateOrderInput } from '../order.model';
import { CartRepository } from '../../cartManagement/cart.repository';
import {
  CartNotFound,
  MenuItemNotFound,
  QuantityExceed,
} from '../../cartManagement/cart.execption';
import { errorMessage } from '../../../shared_infrastructure/error/errorMessages';
import { OrderStatusEnum } from '@prisma/client';
import { NotFound } from '../../../shared_infrastructure/error/error.execption';
import { PriceNotMatch } from '../order.exception';
import { ENTITIES } from '../../../../prisma/entities';

export class OrderRepository {
  /** Add order with details using transaction */
  static async createOrderAndDetails(data: CreateOrderInput) {
    const { customerId, addressId, paymentTypeId, preferredDate } = data;
    return await prisma.$transaction(async (tx) => {
      // check if cart exist
      const cart = await CartRepository.findCartByCustomerId(customerId);
      if (!cart) {
        throw new NotFound(ENTITIES.CART);
      }
      // Check cartItems existence, quantity, price
      for (const ci of cart.cartItems) {
        const { menuItemId, quantity, price } = ci;
        const menuItem = await tx.menuItem.findUnique({
          where: { id: menuItemId },
        });

        if (!menuItem) {
          throw new NotFound(ENTITIES.MENU_ITEM);
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
      const address = await tx.address.findUnique({
        where: { id: addressId, customerId: customerId },
      });
      if (!address) {
        throw new NotFound(ENTITIES.ADDRESS);
      }
      // get restaurant name
      const restaurant = await tx.restaurant.findUnique({
        where: { id: cart.restaurantId },
      });
      if (!restaurant) {
        throw new NotFound(ENTITIES.RESTAURANT);
      }
      // get paymentType name
      const paymentType = await tx.paymentIntegrationType.findUnique({
        where: { id: paymentTypeId },
        select: { name: true },
      });
      if (!paymentType) {
        throw new NotFound(ENTITIES.PAYMENT_INTEGRATION_TYPE);
      }
      // get orderStatus name
      const orderStatus = await tx.orderStatus.findFirst({
        where: { name: 'PENDING' },
        select: { id: true, name: true },
      });
      if (!orderStatus) {
        throw new NotFound(ENTITIES.ORDER_STATUS);
      }

      // 2. Calculate total price
      const totalPrice = cart.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // 3. Create Order + OrderDetails
      const order = await tx.order.create({
        data: {
          customerId: data.customerId,
          restaurantId: cart.restaurantId,
          addressId: data.addressId,
          paymentTypeId: data.paymentTypeId,
          orderStatusId: orderStatus!.id,
          preferredDate,
          totalPrice,
          paid: false,
          orderDetails: {
            create: cart.cartItems.map((item) => ({
              menuItemId: item.menuItemId,
              menuItemName: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },

        include: {
          orderDetails: true,
        },
      });

      return order;
    });
  }

  // Generate single order with its order details view

  static async createSingleOrderMV() {
    const result = await prisma.$queryRawTyped(getSingleOrderView());
  }
  // drop single_order_details view
  static async refreshSingleOrderMV() {
    await prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY single_order_details_view`;
  }
  // Check if order in order  table
  static async getSingleOrderById(customerId: number, orderId: number) {
    return await prisma.order.findUnique({
      where: { id: orderId, customerId },
    });
  }
  // Check if order in order  Materialized view
  static async getSingleOrderByIdMV(customerId: number, orderId: number) {
    return await prisma.$queryRaw`
  SELECT id
  FROM single_order_details_MV
  WHERE id = ${orderId} AND customer_id= ${customerId}
`;
  }
  // get order and its order details from view
  static async getSingleOrderAndDetailsById(orderId: number) {
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
          ON od.order_id = o.id
        
        WHERE o.id = ${orderId}
        
        GROUP BY 
          o.order_id, o.customer_id, o.restaurant_name, 
          o.payment_method,o.state, o.city, o.street, 
          o.order_status, o.total_price, o.paid, o.timestamp;
`;
  }

  // to get order based on query of its status
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

  /** Edit order status */
  static async updateOrderStatus(orderId: number, orderStatusId: number) {
    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatusId },
    });
  }
}
