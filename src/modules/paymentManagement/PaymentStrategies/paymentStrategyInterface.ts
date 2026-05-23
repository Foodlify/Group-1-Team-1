export interface PaymentStrategyInterface {
  createPayment(order: any): Promise<any>;
  handleWebhook?(event: any): Promise<any>;
}
