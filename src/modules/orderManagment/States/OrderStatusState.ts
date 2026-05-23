import { OrderStatusEnum } from '@prisma/client';
import { OrderContext } from './OrderContext';

export abstract class OrderStatusState {
  confirm(context: OrderContext): void {
    throw new Error(`Cannot confirm from ${this.getStatusName()}`);
  }
  process(context: OrderContext): void {
    throw new Error(`Cannot process from ${this.getStatusName()}`);
  }
  pickup(context: OrderContext): void {
    throw new Error(`Cannot mark ready for pickup from ${this.getStatusName()}`);
  }
  outForDelivery(context: OrderContext): void {
    throw new Error(`Cannot mark out for delivery from ${this.getStatusName()}`);
  }
  deliver(context: OrderContext): void {
    throw new Error(`Cannot deliver from ${this.getStatusName()}`);
  }
  cancel(context: OrderContext): void {
    throw new Error(`Cannot cancel from ${this.getStatusName()}`);
  }
  refund(context: OrderContext): void {
    throw new Error(`Cannot refund from ${this.getStatusName()}`);
  }

  abstract getStatusName(): OrderStatusEnum;
}
