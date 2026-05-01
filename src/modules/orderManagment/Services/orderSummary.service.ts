import { OrderSummaryRepository } from '../Repositories/orderSummary.repository';

export class OrderSummaryService {
  static async addOrderSummary(summaryData: {
    customerId: number;
    orderId: number;
    restaurantName: string;
    totalAmount: number;
    totalQuantity: number;
    orderDate: Date;
  }) {
    return OrderSummaryRepository.addOrderSummary(summaryData);
  }

  static async getByCustomerId(customerId: number) {
    return OrderSummaryRepository.getByCustomerId(customerId);
  }
}
