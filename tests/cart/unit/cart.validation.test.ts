import {
  CartSchema,
  DeleteCartSchema,
} from '../../../src/modules/cartManagement/cart.validation';

// ─── CartSchema (Add to Cart / Update Quantity) ───────────────────────────────

describe('CartSchema', () => {
  it('should pass with valid itemId and itemQuantity', () => {
    const result = CartSchema.safeParse({ itemId: 1, itemQuantity: 2 });
    expect(result.success).toBe(true);
  });

  it('should fail when itemId is missing', () => {
    const result = CartSchema.safeParse({ itemQuantity: 2 });
    expect(result.success).toBe(false);
  });

  it('should fail when itemQuantity is missing', () => {
    const result = CartSchema.safeParse({ itemId: 1 });
    expect(result.success).toBe(false);
  });

  it('should fail when itemId is 0 (less than min 1)', () => {
    const result = CartSchema.safeParse({ itemId: 0, itemQuantity: 2 });
    expect(result.success).toBe(false);
  });

  it('should fail when itemQuantity is 0 (less than min 1)', () => {
    const result = CartSchema.safeParse({ itemId: 1, itemQuantity: 0 });
    expect(result.success).toBe(false);
  });

  it('should fail when itemId is negative', () => {
    const result = CartSchema.safeParse({ itemId: -1, itemQuantity: 2 });
    expect(result.success).toBe(false);
  });

  it('should fail when itemQuantity is negative', () => {
    const result = CartSchema.safeParse({ itemId: 1, itemQuantity: -1 });
    expect(result.success).toBe(false);
  });

  it('should fail with an empty object', () => {
    const result = CartSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should fail when itemId is a string', () => {
    const result = CartSchema.safeParse({ itemId: '1', itemQuantity: 2 });
    expect(result.success).toBe(false);
  });

  it('should fail when itemQuantity is a string', () => {
    const result = CartSchema.safeParse({ itemId: 1, itemQuantity: '2' });
    expect(result.success).toBe(false);
  });

  it('should pass with large valid values', () => {
    const result = CartSchema.safeParse({ itemId: 999, itemQuantity: 100 });
    expect(result.success).toBe(true);
  });
});

// ─── DeleteCartSchema ─────────────────────────────────────────────────────────

describe('DeleteCartSchema', () => {
  it('should pass with a valid itemId', () => {
    const result = DeleteCartSchema.safeParse({ itemId: 1 });
    expect(result.success).toBe(true);
  });

  it('should fail when itemId is missing', () => {
    const result = DeleteCartSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should fail when itemId is 0 (less than min 1)', () => {
    const result = DeleteCartSchema.safeParse({ itemId: 0 });
    expect(result.success).toBe(false);
  });

  it('should fail when itemId is negative', () => {
    const result = DeleteCartSchema.safeParse({ itemId: -5 });
    expect(result.success).toBe(false);
  });

  it('should fail when itemId is a string', () => {
    const result = DeleteCartSchema.safeParse({ itemId: '1' });
    expect(result.success).toBe(false);
  });

  it('should pass with itemId of 1 (boundary minimum)', () => {
    const result = DeleteCartSchema.safeParse({ itemId: 1 });
    expect(result.success).toBe(true);
  });
});
