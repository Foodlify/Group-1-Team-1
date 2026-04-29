import prisma from '../../../../lib/prisma';
import { CreateOrderInput } from '../order.model';
import { CartRepository } from '../../cartManagement/cart.repository';
import {
  CartNotFound,
  MenuItemNotFound,
  QuantityExceed,
} from '../../cartManagement/cart.execption';
import { errorMessage } from '../../../shared_infrastructure/error/errorMessages';
import { MenuRepository } from '../../restaurantManagemet/menu.repository';
import { OrderStatusEnum } from '@prisma/client';

export class OrderRepository {
  /** Add order with details using transaction */
  static async createOrderAndDetails(data: CreateOrderInput) {
    const { customerId, addressId, paymentTypeId, preferredDate } = data;
    return await prisma.$transaction(async (tx) => {
      // check if cart exist
      const cart = await CartRepository.findCartByCustomerId(customerId);
      if (!cart) {
        throw new CartNotFound(errorMessage.CART_NOT_FOUND.message);
      }
      // Check cartItems existence, quantity, price
      for (const ci of cart.cartItems) {
        const { menuItemId, quantity, price } = ci;
        const menuItem = await tx.menuItem.findUnique({
          where: { id: menuItemId },
        });

        if (!menuItem) {
          throw new MenuItemNotFound(errorMessage.MENU_ITEM_NOT_FOUND.message);
        }
        if (quantity > menuItem?.stock) {
          throw new QuantityExceed(errorMessage.QUANTITY_EXCEED.message);
        }
        if (price != menuItem?.price) {
          throw new Error(
            `price of ${menuItem.itemName} has changed, please confirm if proceed or remove item`,
          );
        }
      }
      // check if address belong to Customer
      const address = await tx.address.findUnique({
        where: { id: addressId, customerId: customerId },
        select: { city: true, street: true },
      });
      if (!address) {
        throw new Error('that address not match');
      }
      // get restaurant name
      const restaurant = await tx.restaurant.findUnique({
        where: { id: cart.restaurantId },
        select: { name: true },
      });
      if (!restaurant) {
        throw new Error('the restaurant not found');
      }
      // get paymentType name
      const paymentType = await tx.paymentType.findUnique({
        where: { id: paymentTypeId },
        select: { name: true },
      });

      // get orderStatus name
      const orderStatus = await tx.orderStatus.findFirst({
        where: { name: 'PENDING' },
        select: { id: true, name: true },
      });

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
          restaurantName: restaurant.name, // snapshot

          addressId: data.addressId,
          deliveryAddress: `${address.city}, ${address.street}`, // snapshot

          paymentTypeId: data.paymentTypeId,
          paymentMethod: paymentType!.name, // snapshot

          orderStatusId: orderStatus!.id,
          status: orderStatus!.name, // snapshot

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

  // Get single order with its order details
  static async getSingleOrderById(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },

      select: {
        id: true,
        restaurantName: true,
        deliveryAddress: true,
        paymentMethod: true,
        Status: true,
        totalPrice: true,
        timestamp: true,

        orderDetails: {
          select: {
            id: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
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
