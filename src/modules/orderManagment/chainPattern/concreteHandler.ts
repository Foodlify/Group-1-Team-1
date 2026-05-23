import { ENTITIES } from '../../../../prisma/entities';
import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../../shared_infrastructure/error/error.execption';
import { retry } from '../../../shared_infrastructure/retry/retry';
import { CartService } from '../../cartManagement/cart.service';
import { AddressService } from '../../customerManagement/Services/address.service';
import { PaymentStrategy } from '../../paymentManagement/PaymentStrategies/payment.strategy';
import { PaymentService } from '../../paymentManagement/Services/payment.service';
import { TransactionService } from '../../paymentManagement/Services/transaction.service';
import { MenuService } from '../../restaurantManagemet/Services/menu.service';
import { OrderRepository } from '../Repositories/order.repository';
import { OrderService } from '../Services/order.service';
import { OrderTrackingService } from '../Services/orderTracking.service';
import { OrderHandler } from './orderHandler';
import { OrderRequest } from './orderRequest';
import { OrderResponse } from './orderResponse';
export class LockCartHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { customerId } = request;
    const { tx } = response;
    const cart = await CartService.getCustomerCart(customerId, tx);
    if (!cart) throw new NOT_FOUND(ENTITIES.CART);
    // prevent duplicate place order of same cart
    if (cart?.isLocked) {
      throw new Error('Cart is locked. Cannot proceed.');
    }
    await CartService.LockCart(cart.id, tx);
    console.log('cart locked');
    response = { ...response, cart };
    return this.nextHandle(request, response);
  }
}
export class AddressValidationHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { customerId, addressId } = request;
    const { tx } = response;
    const address = await AddressService.getAddressByCustomerId(
      customerId,
      addressId,
      tx,
    );
    console.log('address validation');
    response = { ...response, address };
    return this.nextHandle(request, response);
  }
}
export class PaymentTypeValidationHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { paymentTypeId } = request;
    const { tx } = response;
    const paymentType = await PaymentService.getPaymentTypeById(
      paymentTypeId,
      tx,
    );

    console.log('payment type validation');
    response = { ...response, paymentType };
    return this.nextHandle(request, response);
  }
}
export class CartItemsValidationHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { tx } = response;
    const result = await CartService.validCartAntItemsForOrder(
      request.customerId,
      tx,
    );
    console.log('cart items validation');
    response = { ...response, ...result };
    return this.nextHandle(request, response);
  }
}

export class UpdateStockHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { tx, cart } = response;
    for (const ci of cart.cartItems) {
      const updated = await MenuService.decreaseMenuItemStock(ci, tx);
      if (updated.count === 0) {
        throw new BAD_REQUEST(ENTITIES.MENU_ITEM);
      }
    }
    console.log('stock updated');
    return this.nextHandle(request, response);
  }
}
export class CreateOrderAndDetailsHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { customerId, preferredDate } = request;
    const { tx } = response;
    const { address, paymentType, cart, totalPrice } = response;
    const statusId = await OrderService.getOrderStatus(paymentType!.name, tx);
    console.log(statusId, address);
    const order = await OrderRepository.createOrderAndDetails(
      {
        customerId,
        addressId: address.id,
        paymentTypeId: paymentType!.id,
        preferredDate,
        orderStatusId: statusId,
        totalPrice: totalPrice!,
        cart,
      },
      tx,
    );
    console.log(order);
    if (!order) {
      throw new BAD_REQUEST(ENTITIES.ORDER);
    }
    console.log('order created');
    response = { ...response, order };
    return this.nextHandle(request, response);
  }
}
export class CreateOrderTrackingHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { tx, order } = response;
    const createdBy = request.customerId;
    console.log('order tracking created');
    await OrderTrackingService.addOrderTrackingStatus(
      order.id,
      order.orderStatusId,
      createdBy,
      tx,
    );
    return this.nextHandle(request, response);
  }
}

export class CreateTransactionsHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { paymentType, order, tx } = response;
    const paymentStrategy = new PaymentStrategy(paymentType!.name);
    // add retry for create payment method
    const transaction = await retry(
      async () => await paymentStrategy.createPayment(order),
      3,
      2000,
      'create payment',
    );
    const transactionCreated = await TransactionService.createTransaction(
      order.id,
      paymentType!.id,
      transaction.id,
      order.totalPrice,
      tx,
    );

    if (!transactionCreated) {
      throw new BAD_REQUEST(ENTITIES.TRANSACTION);
    }
    console.log('transaction created');
    response = { ...response, transaction };
    return this.nextHandle(request, response);
  }
}
export class ArchiveCartHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { tx, cart } = response;
    await CartService.archiveCart(cart, tx);
    console.log('cart archived');
    return this.nextHandle(request, response);
  }
}

export class ClearCartHandler extends OrderHandler {
  async handle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    const { customerId } = request;
    const { tx } = response;
    await CartService.clearCart(customerId, tx);
    console.log('cart cleared');
    return this.nextHandle(request, response);
  }
}
