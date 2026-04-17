import { CartService } from '../../../src/modules/cartManagement/cart.service';
import { CartRepository } from '../../../src/modules/cartManagement/cart.repository';
import { ServiceError } from '../../../src/middlewares/error_handling/error-handling';
import { AddToCartInput } from '../../../src/modules/cartManagement/cart.model';

jest.mock('../../../src/modules/cartManagement/cart.repository');

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService();
    // clear all mocks before each test
    jest.clearAllMocks();

    // mock instance method for updateQuantity
    service.getCartAndItem = jest.fn();
  });

  describe('addToCart', () => {
    const validInput: AddToCartInput = {
      customerId: 1,
      restaurantId: 2,
      items: [{ itemId: 1, quantity: 2 }],
    };

    it('should add items successfully when no existing cart exists', async () => {
      (CartRepository.findUserById as jest.Mock).mockResolvedValue({ id: 1 });
      (CartRepository.findRestaurantById as jest.Mock).mockResolvedValue({ id: 2 });
      (CartRepository.findCartByUserId as jest.Mock).mockResolvedValue(null);
      (CartRepository.createCart as jest.Mock).mockResolvedValue({ id: 10, customerId: 1 });
      (CartRepository.findMenuItemById as jest.Mock).mockResolvedValue({
        id: 1,
        itemName: 'Burger',
        quantity: 10,
        menu: { restaurantId: 2 },
      });
      (CartRepository.upsertCartItem as jest.Mock).mockResolvedValue({});
      (CartRepository.getCartWithItems as jest.Mock).mockResolvedValue({
        id: 10,
        customerId: 1,
        cartItems: [
          {
            id: 100,
            cartId: 10,
            menuItemId: 1,
            quantity: 2,
            menuItem: { itemName: 'Burger', price: 15.0 },
          },
        ],
      });

      const result = await service.addToCart(validInput);

      expect(CartRepository.createCart).toHaveBeenCalledWith(1);
      expect(CartRepository.upsertCartItem).toHaveBeenCalledWith(10, 1, 2);
      expect(result).toEqual({
        cartId: 10,
        userId: 1,
        items: [
          {
            cartItemId: 100,
            cartId: 10,
            menuItemId: 1,
            quantity: 2,
            itemName: 'Burger',
            price: 15.0,
          },
        ],
      });
    });

    it('should add items successfully to an existing cart (same restaurant)', async () => {
      (CartRepository.findUserById as jest.Mock).mockResolvedValue({ id: 1 });
      (CartRepository.findRestaurantById as jest.Mock).mockResolvedValue({ id: 2 });
      (CartRepository.findCartByUserId as jest.Mock).mockResolvedValue({
        id: 10,
        customerId: 1,
        cartItems: [
          { menuItem: { menu: { restaurantId: 2 } } }
        ]
      });
      (CartRepository.findMenuItemById as jest.Mock).mockResolvedValue({
        id: 1,
        itemName: 'Burger',
        quantity: 10,
        menu: { restaurantId: 2 },
      });
      (CartRepository.upsertCartItem as jest.Mock).mockResolvedValue({});
      (CartRepository.getCartWithItems as jest.Mock).mockResolvedValue({
        id: 10,
        customerId: 1,
        cartItems: [
          {
            id: 100,
            cartId: 10,
            menuItemId: 1,
            quantity: 2,
            menuItem: { itemName: 'Burger', price: 15.0 },
          },
        ],
      });

      const result = await service.addToCart(validInput);

      expect(CartRepository.createCart).not.toHaveBeenCalled();
      expect(CartRepository.upsertCartItem).toHaveBeenCalledWith(10, 1, 2);
      expect(result.cartId).toBe(10);
    });

    it('should throw error if user does not exist', async () => {
      (CartRepository.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(service.addToCart(validInput)).rejects.toThrow(
        /User with id 1 does not exist/
      );
    });

    it('should throw error if restaurant does not exist', async () => {
      (CartRepository.findUserById as jest.Mock).mockResolvedValue({ id: 1 });
      (CartRepository.findRestaurantById as jest.Mock).mockResolvedValue(null);

      await expect(service.addToCart(validInput)).rejects.toThrow(
        /Restaurant with id 2 does not exist/
      );
    });

    it('should throw error if adding items from a different restaurant to an existing cart', async () => {
      (CartRepository.findUserById as jest.Mock).mockResolvedValue({ id: 1 });
      (CartRepository.findRestaurantById as jest.Mock).mockResolvedValue({ id: 2 });
      (CartRepository.findCartByUserId as jest.Mock).mockResolvedValue({
        id: 10,
        customerId: 1,
        cartItems: [
          { menuItem: { menu: { restaurantId: 3 /* different restaurant */ } } }
        ]
      });

      await expect(service.addToCart(validInput)).rejects.toThrow(
        /Your cart already contains items from another restaurant/
      );
    });

    it('should throw validation errors (402) for invalid menu items (not found, wrong restaurant, exceeds stock)', async () => {
      const input: AddToCartInput = {
        customerId: 1,
        restaurantId: 2,
        items: [
          { itemId: 1, quantity: 1 }, // Not found
          { itemId: 2, quantity: 1 }, // Wrong restaurant
          { itemId: 3, quantity: 15 } // Exceeds stock
        ],
      };

      (CartRepository.findUserById as jest.Mock).mockResolvedValue({ id: 1 });
      (CartRepository.findRestaurantById as jest.Mock).mockResolvedValue({ id: 2 });
      (CartRepository.findCartByUserId as jest.Mock).mockResolvedValue(null);
      (CartRepository.createCart as jest.Mock).mockResolvedValue({ id: 10, customerId: 1 });

      (CartRepository.findMenuItemById as jest.Mock).mockImplementation((itemId: number) => {
        if (itemId === 1) return Promise.resolve(null);
        if (itemId === 2) return Promise.resolve({ id: 2, itemName: 'Pizza', quantity: 10, menu: { restaurantId: 3 } });
        if (itemId === 3) return Promise.resolve({ id: 3, itemName: 'Pasta', quantity: 10, menu: { restaurantId: 2 } });
        return Promise.resolve(null);
      });

      try {
        await service.addToCart(input);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.statusCode).toBe(402);
        expect(error.errors).toContain('Menu item with id 1 does not exist');
        expect(error.errors).toContain('Menu item "Pizza" (id: 2) does not belong to restaurant 2');
        expect(error.errors).toContain('Requested quantity (15) for "Pasta" exceeds available stock (10)');
      }

      // Ensure upsert wasn't called since all items failed
      expect(CartRepository.upsertCartItem).not.toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
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

      expect(CartRepository.upsertCartItem).not.toHaveBeenCalled();
    });
  });
});
