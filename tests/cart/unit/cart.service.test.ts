import { CartService } from '../../../src/modules/cartManagement/cart.service';
import { CartRepository } from '../../../src/modules/cartManagement/cart.repository';
import { ServiceError } from '../../../src/middlewares/error_handling/error-handling';

jest.mock('../../../src/modules/cartManagement/cart.repository');

describe('updateQuantity', () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService();

    // mock instance method
    service.getCartAndItem = jest.fn();
  });
  it('should update quantity successfully', async () => {
    const input = {
      customerId: 1,
      cartId: 1,
      itemId: 1,
      quantity: 2,
    };

    (service.getCartAndItem as jest.Mock).mockResolvedValue({
      cart: {},
      item: {},
    });

    (CartRepository.findMenuItemById as jest.Mock).mockResolvedValue({
      id: 1,
      quantity: 10,
    });

    (CartRepository.upsertCartItem as jest.Mock).mockResolvedValue({
      id: 1,
      cartId: 1,
      quantity: 2,
    });

    const result = await service.updateQuantity(input);

    expect(result).toEqual({
      customerId: 1,
      cartId: 1,
      itemId: 1,
      quantity: 2,
    });
  });
  it('should throw error if menu item not found', async () => {
    const input = { customerId: 1, cartId: 1, itemId: 1, quantity: 2 };

    (service.getCartAndItem as jest.Mock).mockResolvedValue({
      cart: {},
      item: {},
    });

    (CartRepository.findMenuItemById as jest.Mock).mockResolvedValue(null);

    await expect(service.updateQuantity(input)).rejects.toThrow(ServiceError);
  });
  it('should throw error if quantity exceeds stock', async () => {
    const input = { customerId: 1, cartId: 1, itemId: 1, quantity: 20 };

    (service.getCartAndItem as jest.Mock).mockResolvedValue({
      cart: {},
      item: {},
    });

    (CartRepository.findMenuItemById as jest.Mock).mockResolvedValue({
      id: 1,
      quantity: 5,
    });

    await expect(service.updateQuantity(input)).rejects.toThrow(
      'exceeds available stock',
    );

  expect(CartRepository.upsertCartItem).toHaveBeenCalledWith(1, 1, 2);
  });
});
