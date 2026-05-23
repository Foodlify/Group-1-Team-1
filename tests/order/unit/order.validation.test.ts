import {
  PlaceOrderSchema,
  GetOrderSchema,
  UpdateOrderStatusSchema,
  GetOrdersByStatusSchema,
} from '../../../src/modules/orderManagment/order.validation';

// ─── PlaceOrderSchema ────────────────────────────────────────────────────────

describe('PlaceOrderSchema', () => {
  it('should pass with valid body', () => {
    const result = PlaceOrderSchema.safeParse({
      addressId: 1,
      paymentTypeId: 2,
      preferredDate: '2026-06-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.addressId).toBe(1);
      expect(result.data.paymentTypeId).toBe(2);
      expect(result.data.preferredDate).toBeInstanceOf(Date);
    }
  });

  it('should fail when addressId is missing', () => {
    const result = PlaceOrderSchema.safeParse({
      paymentTypeId: 2,
      preferredDate: '2026-06-01',
    });
    expect(result.success).toBe(false);
  });

  it('should fail when paymentTypeId is missing', () => {
    const result = PlaceOrderSchema.safeParse({
      addressId: 1,
      preferredDate: '2026-06-01',
    });
    expect(result.success).toBe(false);
  });

  it('should fail when preferredDate is missing', () => {
    const result = PlaceOrderSchema.safeParse({
      addressId: 1,
      paymentTypeId: 2,
    });
    expect(result.success).toBe(false);
  });

  it('should fail when preferredDate has wrong format (not YYYY-MM-DD)', () => {
    const result = PlaceOrderSchema.safeParse({
      addressId: 1,
      paymentTypeId: 2,
      preferredDate: '01-06-2026',
    });
    expect(result.success).toBe(false);
  });

  it('should fail when addressId is less than 1', () => {
    const result = PlaceOrderSchema.safeParse({
      addressId: 0,
      paymentTypeId: 2,
      preferredDate: '2026-06-01',
    });
    expect(result.success).toBe(false);
  });

  it('should fail when paymentTypeId is less than 1', () => {
    const result = PlaceOrderSchema.safeParse({
      addressId: 1,
      paymentTypeId: 0,
      preferredDate: '2026-06-01',
    });
    expect(result.success).toBe(false);
  });

  it('should fail with an empty object', () => {
    const result = PlaceOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── GetOrderSchema ──────────────────────────────────────────────────────────

describe('GetOrderSchema', () => {
  it('should pass with a valid orderId', () => {
    const result = GetOrderSchema.safeParse({ orderId: 5 });
    expect(result.success).toBe(true);
  });

  it('should fail when orderId is 0', () => {
    const result = GetOrderSchema.safeParse({ orderId: 0 });
    expect(result.success).toBe(false);
  });

  it('should fail when orderId is negative', () => {
    const result = GetOrderSchema.safeParse({ orderId: -1 });
    expect(result.success).toBe(false);
  });

  it('should fail when orderId is missing', () => {
    const result = GetOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should fail when orderId is a string', () => {
    const result = GetOrderSchema.safeParse({ orderId: 'abc' });
    expect(result.success).toBe(false);
  });
});

// ─── UpdateOrderStatusSchema ─────────────────────────────────────────────────

describe('UpdateOrderStatusSchema', () => {
  const validStatuses = [
    'CONFIRMED',
    'PROCESSED',
    'READY_TO_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ];

  validStatuses.forEach((status) => {
    it(`should pass for status "${status}"`, () => {
      const result = UpdateOrderStatusSchema.safeParse({
        orderId: 1,
        status,
      });
      expect(result.success).toBe(true);
    });
  });

  it('should fail when status is PENDING (not a valid transition target)', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: 1,
      status: 'PENDING',
    });
    expect(result.success).toBe(false);
  });

  it('should fail when status is an invalid string', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: 1,
      status: 'confirm',
    });
    expect(result.success).toBe(false);
  });

  it('should fail when status is missing', () => {
    const result = UpdateOrderStatusSchema.safeParse({ orderId: 1 });
    expect(result.success).toBe(false);
  });

  it('should fail when orderId is missing', () => {
    const result = UpdateOrderStatusSchema.safeParse({ status: 'CONFIRMED' });
    expect(result.success).toBe(false);
  });

  it('should fail when orderId is 0', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: 0,
      status: 'CONFIRMED',
    });
    expect(result.success).toBe(false);
  });

  it('should fail with empty object', () => {
    const result = UpdateOrderStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── GetOrdersByStatusSchema ──────────────────────────────────────────────────

describe('GetOrdersByStatusSchema', () => {
  const allStatuses = [
    'PENDING',
    'CONFIRMED',
    'PROCESSED',
    'READY_TO_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ];

  allStatuses.forEach((status) => {
    it(`should pass for status "${status}"`, () => {
      const result = GetOrdersByStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    });
  });

  it('should fail when status is an invalid value', () => {
    const result = GetOrdersByStatusSchema.safeParse({ status: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('should fail when status is lowercase', () => {
    const result = GetOrdersByStatusSchema.safeParse({ status: 'pending' });
    expect(result.success).toBe(false);
  });

  it('should fail when status is missing', () => {
    const result = GetOrdersByStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
