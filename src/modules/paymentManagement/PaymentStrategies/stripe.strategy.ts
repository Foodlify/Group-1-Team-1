import { PaymentStrategyInterface } from './paymentStrategyInterface';
import { stripe } from '../../../config/stripe';
import { TransactionService } from '../Services/transaction.service';
import { OrderService } from '../../orderManagment/Services/order.service';
import { OrderStatusEnum, TransactionStatusEnum } from '@prisma/client';
import { CartService } from '../../cartManagement/cart.service';
import { OrderTrackingService } from '../../orderManagment/Services/orderTracking.service';
import loggerService from '../../../shared_infrastructure/logger/logger';

export class StripeStrategy implements PaymentStrategyInterface {
  async createPayment(order: any): Promise<any> {
    loggerService.info('Creating Stripe payment intent', { orderId: order.id, totalPrice: order.totalPrice });

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: order.totalPrice * 100,
        currency: 'egp',

        metadata: {
          orderId: order.id,
          customerId: order.customerId,
        },

        automatic_payment_methods: {
          enabled: true,
        },
      },
      { idempotencyKey: `order ${order.id}` },
    );

    loggerService.info('Stripe payment intent created', { orderId: order.id, paymentIntentId: paymentIntent.id });
    return paymentIntent;
  }

  async handleWebhook(event: any) {
    loggerService.info('Handling Stripe webhook', { eventType: event.type });

    if (event.type == 'payment_intent.succeeded') {
      const session = event.data.object;
      const orderId = Number(session.metadata.orderId);
      const customerId = Number(session.metadata.customerId);
      const sessionId = session.id;

      loggerService.info('Stripe payment succeeded', { orderId, customerId, sessionId });

      await TransactionService.updateTransaction(
        orderId,
        sessionId,
        TransactionStatusEnum.SUCCEEDED,
      );
      await OrderService.updateOrderStatus(
        customerId,
        orderId,
        OrderStatusEnum.CONFIRMED,
      );

      loggerService.info('Order confirmed after Stripe payment', { orderId, customerId });
    } else if (event.type === 'payment_intent.payment_failed') {
      const session = event.data.object;
      const orderId = Number(session.metadata!.orderId);
      const sessionId = session.id;

      loggerService.warn('Stripe payment failed', { orderId, sessionId });

      await TransactionService.updateTransaction(
        orderId,
        sessionId,
        TransactionStatusEnum.FAILED,
      );
    } else {
      loggerService.debug('Unhandled Stripe webhook event', { eventType: event.type });
    }
  }
}
