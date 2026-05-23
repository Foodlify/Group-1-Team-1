import { StripeStrategy } from './stripe.strategy';
import { CashStrategy } from './cash.strategy';
import { PaymentStrategyInterface } from './paymentStrategyInterface';
import { PaymentTypeEnum } from '@prisma/client';

import { ENTITIES } from '../../../../prisma/entities';
import { BAD_REQUEST } from '../../../shared_infrastructure/error/error.execption';

export class PaymentStrategy {
  strategy: PaymentStrategyInterface;
  constructor(paymentType: PaymentTypeEnum) {
    this.strategy = PaymentStrategy.paymentFactory(paymentType);
  }

  static paymentFactory(strategy: PaymentTypeEnum): PaymentStrategyInterface {
    switch (strategy) {
      case PaymentTypeEnum.STRIPE:
        return new StripeStrategy();
      case PaymentTypeEnum.CASH:
        return new CashStrategy();

      default:
        throw new Error('Unsupported payment type');
    }
  }
  async createPayment(order: any): Promise<any> {
    const transaction = await  this.strategy.createPayment(order);
    if (!transaction) {
      throw new BAD_REQUEST(ENTITIES.TRANSACTION);
    }
    return transaction;
  }
  async handleWebhook(event: any) {
    if (!this.strategy.handleWebhook) return;
    this.strategy.handleWebhook(event);
  }
}
