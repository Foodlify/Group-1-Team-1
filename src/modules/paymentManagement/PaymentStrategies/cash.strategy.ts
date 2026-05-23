// src/payment/strategies/cash.strategy.ts
import { OrderService } from '../../orderManagment/Services/order.service';
import { TransactionService } from '../Services/transaction.service';
import { PaymentStrategyInterface } from './paymentStrategyInterface';

export class CashStrategy implements PaymentStrategyInterface {
  async createPayment(order: any) {
    return {
      orderid: order.id,
      provider: 'CASH',
      sessionId: null,
      url: null,
      message: 'Pay on delivery',
    };
  }

}
