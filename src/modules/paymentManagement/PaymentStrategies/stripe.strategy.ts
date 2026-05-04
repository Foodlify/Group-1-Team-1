import { PaymentStrategyInterface } from './paymentStrategyInterface';
import { loadStripe } from '@stripe/stripe-js';

import { stripe } from '../../../config/stripe';
import { TransactionService } from '../Services/transaction.service';
import { OrderService } from '../../orderManagment/Services/order.service';
import { PaymentTypeEnum, TransactionStatusEnum } from '@prisma/client';
import { meta } from 'zod/v4/core';

export class StripeStrategy implements PaymentStrategyInterface {
  async createPayment(order: any): Promise<any> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalPrice * 100, 
      currency: 'egp',

      metadata: {
        orderId: order.id,
        customerId: order.customerId,
      },

      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  }

  async handleWebhook(event: any) {
    event.type = 'payment_intent.succeeded'; // this should be come from frontend, but put here for testing
    if (event.type == 'payment_intent.succeeded') {
      const session = event.data.object;
      const orderId = Number(session.metadata.orderId);
      const customerId = Number(session.metadata.customerId);
      const sessionId = session.id;

      await TransactionService.updateTransaction(
        orderId,
        sessionId,
        TransactionStatusEnum.SUCCEEDED,
      );
      // admin check if transaction succeeded----> send notification and update order confirmed
      // order paid
      await OrderService.updateOrderStatus(customerId, orderId, 'confirm');
    } else if (event.type === 'payment_intent.payment_failed') {
      console.log('failed');
      const session = event.data.object;
      const orderId = Number(session.metadata!.orderId);
      const sessionId = session.id;
      console.log(orderId);
      await TransactionService.updateTransaction(
        orderId,
        sessionId,
        TransactionStatusEnum.FAILED,
      );
    }
  }
}
