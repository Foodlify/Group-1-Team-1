// src/payment/strategies/cash.strategy.ts
import { PaymentStrategyInterface } from './paymentStrategyInterface';
import loggerService from '../../../shared_infrastructure/logger/logger';

export class CashStrategy implements PaymentStrategyInterface {
  async createPayment(order: any) {
    loggerService.info('Processing cash payment', { orderId: order.id });

    const result = {
      orderid: order.id,
      provider: 'CASH',
      sessionId: null,
      url: null,
      message: 'Pay on delivery',
    };

    loggerService.info('Cash payment processed', { orderId: order.id });
    return result;
  }
}
