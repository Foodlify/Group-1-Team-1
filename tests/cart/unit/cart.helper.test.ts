/**
 * cart.helper.test.ts
 *
 * Tests for CartService helper methods:
 * getTotalPriceAndQuantity — covers the reduce logic with various cart states.
 *
 * Note: The CartHelper class referenced in the old test no longer exists.
 * These tests target the equivalent logic in CartService.getTotalPriceAndQuantity.
 */

import { CartService } from '../../../src/modules/cartManagement/cart.service';
import { CartRepository } from '../../../src/modules/cartManagement/cart.repository';
import { CartNotFound } from '../../../src/modules/cartManagement/cart.execption';

jest.mock('../../../src/modules/cartManagement/cart.repository');
jest.mock('../../../src/modules/restaurantManagemet/menu.service');
jest.mock('../../../../lib/prisma', () => ({
  __esModule: true,
  default: {},
}), { virtual: true });

describe('CartService — total price / quantity helpers', () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService();
    jest.clearAllMocks();
  });

  it('should calculate total price correctly (2 * 20 = 40)', async () => {
    (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue({
      id: 1,
      customerId: 1,
      restaurantId: 1,
      cartItems: [{ quantity: 2, price: 20 }],
    });

    const { totalPrice } = await service.getTotalPriceAndQuantity(1);
    expect(totalPrice).toBe(40);
  });

  it('should calculate total quantity correctly', async () => {
    (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue({
      id: 1,
      customerId: 1,
      restaurantId: 1,
      cartItems: [{ quantity: 2, price: 20 }],
    });

    const { totalQuantity } = await service.getTotalPriceAndQuantity(1);
    expect(totalQuantity).toBe(2);
  });

  it('should return 0 for empty cart items', async () => {
    (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue({
      id: 1,
      customerId: 1,
      restaurantId: 1,
      cartItems: [],
    });

    const { totalPrice, totalQuantity } = await service.getTotalPriceAndQuantity(1);
    expect(totalPrice).toBe(0);
    expect(totalQuantity).toBe(0);
  });

  it('should handle missing price safely (treat undefined price as 0)', async () => {
    (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue({
      id: 1,
      customerId: 1,
      restaurantId: 1,
      cartItems: [{ quantity: 2, price: undefined }],
    });

    const { totalPrice } = await service.getTotalPriceAndQuantity(1);
    expect(totalPrice).toBe(0);
  });

  it('should sum across multiple cart items', async () => {
    (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue({
      id: 1,
      customerId: 1,
      restaurantId: 1,
      cartItems: [
        { quantity: 2, price: 35 },
        { quantity: 3, price: 10 },
      ],
    });

    const { totalPrice, totalQuantity } = await service.getTotalPriceAndQuantity(1);
    expect(totalPrice).toBe(100); // 2*35 + 3*10
    expect(totalQuantity).toBe(5);
  });

  it('should throw CartNotFound when cart does not exist', async () => {
    (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(null);
    await expect(service.getTotalPriceAndQuantity(1)).rejects.toBeInstanceOf(CartNotFound);
  });
});
