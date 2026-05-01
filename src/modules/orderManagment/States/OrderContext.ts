import { OrderStatusState } from './OrderStatusState';
import { OrderStatusEnum } from '@prisma/client';
import {
  PendingState,
  ConfirmedState,
  ProcessedState,
  ReadyToPickupState,
  OutForDeliveryState,
  DeliveredState,
  CancelledState,
  RefundedState,
} from './ConcreteStates';

export class OrderContext {
  private state: OrderStatusState;

  constructor(statusName: OrderStatusEnum) {
    this.state = this.getStateInstance(statusName);
  }

  private getStateInstance(statusName: OrderStatusEnum): OrderStatusState {
    switch (statusName) {
      case OrderStatusEnum.PENDING:
        return new PendingState();
      case OrderStatusEnum.CONFIRMED:
        return new ConfirmedState();
      case OrderStatusEnum.PROCESSED:
        return new ProcessedState();
      case OrderStatusEnum.READY_TO_PICKUP:
        return new ReadyToPickupState();
      case OrderStatusEnum.OUT_FOR_DELIVERY:
        return new OutForDeliveryState();
      case OrderStatusEnum.DELIVERED:
        return new DeliveredState();
      case OrderStatusEnum.CANCELLED:
        return new CancelledState();
      case OrderStatusEnum.REFUNDED:
        return new RefundedState();
      default:
        throw new Error(`Unknown state ${statusName}`);
    }
  }

  setState(state: OrderStatusState): void {
    this.state = state;
  }

  getCurrentStatus(): OrderStatusEnum {
    return this.state.getStatusName();
  }

  confirm(): void {
    this.state.confirm(this);
  }
  process(): void {
    this.state.process(this);
  }
  pickup(): void {
    this.state.pickup(this);
  }
  outForDelivery(): void {
    this.state.outForDelivery(this);
  }
  deliver(): void {
    this.state.deliver(this);
  }
  cancel(): void {
    this.state.cancel(this);
  }
  refund(): void {
    this.state.refund(this);
  }
}
