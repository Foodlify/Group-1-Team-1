import { OrderRequest } from './orderRequest';
import { OrderResponse } from './orderResponse';

export abstract class OrderHandler {
  next?: OrderHandler;

  setNext(handler: OrderHandler): OrderHandler {
    this.next = handler;
    return handler;
  }
  static processOrder(
    first: OrderHandler,
    ...chain: OrderHandler[]
  ): OrderHandler {
    let head = first;
    for (const nextHandler of chain) {
      head.setNext(nextHandler);
      head = nextHandler;
    }
    return first;
  }
  abstract handle(request: OrderRequest, response: OrderResponse): Promise<OrderResponse>;

  protected async nextHandle(
    request: OrderRequest,
    response: OrderResponse,
  ): Promise<OrderResponse> {
    if (!this.next) {
      return response;
    }
    return this.next.handle(request, response);
  }
}
