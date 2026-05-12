import {
  AddressValidationHandler,
  CartItemsValidationHandler,
  CreateOrderAndDetailsHandler,
  CreateOrderTrackingHandler,
  CreateTransactionsHandler,
  LockCartHandler,
  PaymentTypeValidationHandler,
  UpdateStockHandler,
  ArchiveCartHandler,
  ClearCartHandler,
} from './concreteHandler';
import { OrderHandler } from './orderHandler';

export class CreateOrder {
  static processOrder(): OrderHandler {
    const chain = [
      new AddressValidationHandler(),
      new PaymentTypeValidationHandler(),

      new CartItemsValidationHandler(),
      new UpdateStockHandler(),

      new CreateOrderAndDetailsHandler(),
      new CreateOrderTrackingHandler(),
      new CreateTransactionsHandler(),

      new ArchiveCartHandler(),
      new ClearCartHandler(),
    ];
    return OrderHandler.processOrder(new LockCartHandler(), ...chain);
  }
}
