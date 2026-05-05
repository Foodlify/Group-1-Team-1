import { OrderStatusState } from './OrderStatusState';
import { OrderContext } from './OrderContext';
import { OrderStatusEnum } from '@prisma/client';

export class PendingState extends OrderStatusState {
  getStatusName(): OrderStatusEnum {
    return OrderStatusEnum.PENDING;
  }

  confirm(context: OrderContext): void {
    context.setState(new ConfirmedState());
  }

  cancel(context: OrderContext): void {
    context.setState(new CancelledState());
  }
}

export class ConfirmedState extends OrderStatusState {
  getStatusName(): OrderStatusEnum {
    return OrderStatusEnum.CONFIRMED;
  }

  process(context: OrderContext): void {
    context.setState(new ProcessedState());
  }

  cancel(context: OrderContext): void {
    context.setState(new CancelledState());
  }
}

export class ProcessedState extends OrderStatusState {
  getStatusName(): OrderStatusEnum {
    return OrderStatusEnum.PROCESSED;
  }

  pickup(context: OrderContext): void {
    context.setState(new ReadyToPickupState());
  }

  cancel(context: OrderContext): void {
    context.setState(new CancelledState());
  }
}

export class ReadyToPickupState extends OrderStatusState {
  getStatusName(): OrderStatusEnum {
    return OrderStatusEnum.READY_TO_PICKUP;
  }

  outForDelivery(context: OrderContext): void {
    context.setState(new OutForDeliveryState());
  }

  cancel(context: OrderContext): void {
    context.setState(new CancelledState());
  }
}

export class OutForDeliveryState extends OrderStatusState {
  getStatusName(): OrderStatusEnum {
    return OrderStatusEnum.OUT_FOR_DELIVERY;
  }

  deliver(context: OrderContext): void {
    context.setState(new DeliveredState());
  }
  cancel(context: OrderContext): void {
    context.setState(new CancelledState());
  }
}

export class DeliveredState extends OrderStatusState {
  getStatusName(): OrderStatusEnum {
    return OrderStatusEnum.DELIVERED;
  }
  // Terminal state, no further transitions allowed.
}

export class CancelledState extends OrderStatusState {
  getStatusName(): OrderStatusEnum {
    return OrderStatusEnum.CANCELLED;
  }

  refund(context: OrderContext): void {
    context.setState(new RefundedState());
  }
}

export class RefundedState extends OrderStatusState {
  getStatusName(): OrderStatusEnum {
    return OrderStatusEnum.REFUNDED;
  }
  // Terminal state
}
