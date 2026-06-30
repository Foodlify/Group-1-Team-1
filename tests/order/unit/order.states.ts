import { OrderContext } from '../../../src/modules/orderManagment/States/OrderContext';
import { OrderStatusEnum } from '@prisma/client';

// ─── Valid Transitions ────────────────────────────────────────────────────────

describe('OrderContext — valid state transitions', () => {
  it('PENDING → CONFIRMED via confirm()', () => {
    const ctx = new OrderContext(OrderStatusEnum.PENDING);
    ctx.confirm();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.CONFIRMED);
  });

  it('PENDING → CANCELLED via cancel()', () => {
    const ctx = new OrderContext(OrderStatusEnum.PENDING);
    ctx.cancel();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.CANCELLED);
  });

  it('CONFIRMED → PROCESSED via process()', () => {
    const ctx = new OrderContext(OrderStatusEnum.CONFIRMED);
    ctx.process();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.PROCESSED);
  });

  it('CONFIRMED → CANCELLED via cancel()', () => {
    const ctx = new OrderContext(OrderStatusEnum.CONFIRMED);
    ctx.cancel();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.CANCELLED);
  });

  it('PROCESSED → READY_TO_PICKUP via pickup()', () => {
    const ctx = new OrderContext(OrderStatusEnum.PROCESSED);
    ctx.pickup();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.READY_TO_PICKUP);
  });

  it('PROCESSED → CANCELLED via cancel()', () => {
    const ctx = new OrderContext(OrderStatusEnum.PROCESSED);
    ctx.cancel();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.CANCELLED);
  });

  it('READY_TO_PICKUP → OUT_FOR_DELIVERY via outForDelivery()', () => {
    const ctx = new OrderContext(OrderStatusEnum.READY_TO_PICKUP);
    ctx.outForDelivery();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.OUT_FOR_DELIVERY);
  });

  it('READY_TO_PICKUP → CANCELLED via cancel()', () => {
    const ctx = new OrderContext(OrderStatusEnum.READY_TO_PICKUP);
    ctx.cancel();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.CANCELLED);
  });

  it('OUT_FOR_DELIVERY → DELIVERED via deliver()', () => {
    const ctx = new OrderContext(OrderStatusEnum.OUT_FOR_DELIVERY);
    ctx.deliver();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.DELIVERED);
  });

  it('OUT_FOR_DELIVERY → CANCELLED via cancel()', () => {
    const ctx = new OrderContext(OrderStatusEnum.OUT_FOR_DELIVERY);
    ctx.cancel();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.CANCELLED);
  });

  it('CANCELLED → REFUNDED via refund()', () => {
    const ctx = new OrderContext(OrderStatusEnum.CANCELLED);
    ctx.refund();
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.REFUNDED);
  });
});

// ─── Invalid / Blocked Transitions ───────────────────────────────────────────

describe('OrderContext — invalid state transitions throw errors', () => {
  it('PENDING cannot be processed', () => {
    const ctx = new OrderContext(OrderStatusEnum.PENDING);
    expect(() => ctx.process()).toThrow('Cannot process from PENDING');
  });

  it('PENDING cannot be delivered', () => {
    const ctx = new OrderContext(OrderStatusEnum.PENDING);
    expect(() => ctx.deliver()).toThrow('Cannot deliver from PENDING');
  });

  it('PENDING cannot be refunded', () => {
    const ctx = new OrderContext(OrderStatusEnum.PENDING);
    expect(() => ctx.refund()).toThrow('Cannot refund from PENDING');
  });

  it('CONFIRMED cannot be confirmed again', () => {
    const ctx = new OrderContext(OrderStatusEnum.CONFIRMED);
    expect(() => ctx.confirm()).toThrow('Cannot confirm from CONFIRMED');
  });

  it('CONFIRMED cannot be picked up', () => {
    const ctx = new OrderContext(OrderStatusEnum.CONFIRMED);
    expect(() => ctx.pickup()).toThrow(
      'Cannot mark ready for pickup from CONFIRMED',
    );
  });

  it('PROCESSED cannot be confirmed', () => {
    const ctx = new OrderContext(OrderStatusEnum.PROCESSED);
    expect(() => ctx.confirm()).toThrow('Cannot confirm from PROCESSED');
  });

  it('DELIVERED is a terminal state — cannot confirm', () => {
    const ctx = new OrderContext(OrderStatusEnum.DELIVERED);
    expect(() => ctx.confirm()).toThrow('Cannot confirm from DELIVERED');
  });

  it('DELIVERED is a terminal state — cannot cancel', () => {
    const ctx = new OrderContext(OrderStatusEnum.DELIVERED);
    expect(() => ctx.cancel()).toThrow('Cannot cancel from DELIVERED');
  });

  it('REFUNDED is a terminal state — cannot confirm', () => {
    const ctx = new OrderContext(OrderStatusEnum.REFUNDED);
    expect(() => ctx.confirm()).toThrow('Cannot confirm from REFUNDED');
  });

  it('REFUNDED is a terminal state — cannot refund again', () => {
    const ctx = new OrderContext(OrderStatusEnum.REFUNDED);
    expect(() => ctx.refund()).toThrow('Cannot refund from REFUNDED');
  });

  it('CANCELLED cannot be confirmed', () => {
    const ctx = new OrderContext(OrderStatusEnum.CANCELLED);
    expect(() => ctx.confirm()).toThrow('Cannot confirm from CANCELLED');
  });

  it('CANCELLED cannot be cancelled again', () => {
    const ctx = new OrderContext(OrderStatusEnum.CANCELLED);
    expect(() => ctx.cancel()).toThrow('Cannot cancel from CANCELLED');
  });
});

// ─── getCurrentStatus ─────────────────────────────────────────────────────────

describe('OrderContext — getCurrentStatus', () => {
  it('returns the initial status without any transition', () => {
    const ctx = new OrderContext(OrderStatusEnum.PENDING);
    expect(ctx.getCurrentStatus()).toBe(OrderStatusEnum.PENDING);
  });

  it('throws for unknown status', () => {
    expect(() => new OrderContext('INVALID_STATUS' as OrderStatusEnum)).toThrow(
      'Unknown state INVALID_STATUS',
    );
  });
});
