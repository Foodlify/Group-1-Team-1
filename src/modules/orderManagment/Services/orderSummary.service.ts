import { OrderSummaryRepository } from '../Repositories/orderSummary.repository';
import { OrderSummaryResponse } from '../order.model';

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

  static async getByCustomerId(customerId: number): Promise<OrderSummaryResponse[]> {
    const summaries = await OrderSummaryRepository.getByCustomerId(customerId);

    return summaries.map((s) => ({
      id: s.id,
      orderId: s.orderId,
      restaurantName: s.restaurantName,
      totalAmount: s.totalAmount,
      totalQuantity: s.totalQuantity,
      orderDate: new Date(s.orderDate).toISOString().split('T')[0],
    }));
  }
}
