import { CartHelper } from '../../../src/modules/cartManagement/cart.helper';

describe('CartHelper', () => {
  const mockCart = {
    id: 1,
    customerId: 1,
    cartItems: [
      {
        id: 100,
        cartId: 1,
        menuItemId: 1,
        quantity: 2,
        menuItem: { itemName: 'Burger', price: 20 },
      },
    ],
  };

  it('should calculate total price correctly', () => {
    const result = CartHelper.getTotalPrice(mockCart);

    expect(result).resolves.toBe(40);
  });

  it('should calculate total quantity correctly', () => {
    const result = CartHelper.getTotalQuantity(mockCart as any);

    expect(result).resolves.toBe(2);
  });

  it('should return 0 for empty cart', () => {
    const result = CartHelper.getTotalPrice({ cartItems: [] } as any);

    expect(result).resolves.toBe(0);
  });
// in case of free gift
  it('should handle missing price safely', () => {
    const cart = {
      cartItems: [{ quantity: 2, menuItem: {} }],
    };

    const result = CartHelper.getTotalPrice(cart as any);

    expect(result).resolves.toBe(0);
  });
});
