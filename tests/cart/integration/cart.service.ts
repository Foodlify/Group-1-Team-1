// import { CartService } from '../../../src/modules/cartManagement/cart.service';
// import { CartRepository } from '../../../src/modules/cartManagement/cart.repository';
// import { MenuService } from '../../../src/modules/restaurantManagemet/menu.service';
// import {
//   CartNotFound,
//   CartItemNotFound,
//   MenuItemNotFound,
//   ItemIdempotency,
//   RestaurantNotMatch,
//   QuantityExceed,
// } from '../../../src/modules/cartManagement/cart.execption';

// jest.mock('../../../src/modules/cartManagement/cart.repository');
// jest.mock('../../../src/modules/restaurantManagemet/menu.service');
// // Prisma is used inside CartRepository transactions — mock the whole prisma client
// jest.mock('../../../../lib/prisma', () => ({
//   __esModule: true,
//   default: {},
// }), { virtual: true });

// // ─── Shared fixtures ─────────────────────────────────────────────────────────

// const mockMenuItem = {
//   id: 1,
//   itemName: 'Classic Burger',
//   price: 35,
//   stock: 10,
//   restaurantId: 2,
// };

// const mockCart = {
//   id: 10,
//   customerId: 1,
//   restaurantId: 2,
//   cartItems: [
//     { id: 100, cartId: 10, menuItemId: 1, quantity: 2, price: 35, name: 'Classic Burger' },
//   ],
// };

// // ─── addToCart ────────────────────────────────────────────────────────────────

// describe('CartService.addToCart', () => {
//   let service: CartService;

//   beforeEach(() => {
//     service = new CartService();
//     jest.clearAllMocks();
//   });

//   it('should create cart and add item when customer has no cart', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(null);
//     (MenuService.getMenuItem as jest.Mock).mockResolvedValue(mockMenuItem);
//     (CartRepository.createCartAndCartItems as jest.Mock).mockResolvedValue(mockCart);

//     const result = await service.addToCart({ customerId: 1, itemId: 1, itemQuantity: 2 });

//     expect(CartRepository.createCartAndCartItems).toHaveBeenCalledWith(1, 2, mockMenuItem);
//     expect(result.customerId).toBe(1);
//     expect(result.itemId).toBe(1);
//     expect(result.itemName).toBe('Classic Burger');
//   });

//   it('should add item to existing cart from the same restaurant', async () => {
//     const cartWithItems = {
//       ...mockCart,
//       cartItems: [{ id: 101, menuItemId: 5, quantity: 1, price: 20, name: 'Fries' }],
//     };
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(cartWithItems);
//     (MenuService.getMenuItem as jest.Mock).mockResolvedValue(mockMenuItem);
//     (CartRepository.findCartItemByIdAndCartId as jest.Mock).mockResolvedValue(null);
//     (CartRepository.createCartItem as jest.Mock).mockResolvedValue({});

//     const result = await service.addToCart({ customerId: 1, itemId: 1, itemQuantity: 2 });

//     expect(CartRepository.createCartItem).toHaveBeenCalledWith(10, 2, mockMenuItem);
//     expect(result.itemId).toBe(1);
//   });

//   it('should throw MenuItemNotFound when menu item does not exist', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(null);
//     (MenuService.getMenuItem as jest.Mock).mockResolvedValue(null);

//     await expect(
//       service.addToCart({ customerId: 1, itemId: 99, itemQuantity: 1 }),
//     ).rejects.toBeInstanceOf(MenuItemNotFound);
//   });

//   it('should throw QuantityExceed when requested quantity exceeds stock', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(null);
//     (MenuService.getMenuItem as jest.Mock).mockResolvedValue({ ...mockMenuItem, stock: 1 });

//     await expect(
//       service.addToCart({ customerId: 1, itemId: 1, itemQuantity: 5 }),
//     ).rejects.toBeInstanceOf(QuantityExceed);
//   });

//   it('should throw ItemIdempotency when item already exists in cart', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(mockCart);
//     (MenuService.getMenuItem as jest.Mock).mockResolvedValue(mockMenuItem);
//     (CartRepository.findCartItemByIdAndCartId as jest.Mock).mockResolvedValue({ id: 100 });

//     await expect(
//       service.addToCart({ customerId: 1, itemId: 1, itemQuantity: 2 }),
//     ).rejects.toBeInstanceOf(ItemIdempotency);
//   });

//   it('should throw RestaurantNotMatch when adding item from different restaurant', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(mockCart);
//     (MenuService.getMenuItem as jest.Mock).mockResolvedValue({ ...mockMenuItem, restaurantId: 99 });
//     (CartRepository.findCartItemByIdAndCartId as jest.Mock).mockResolvedValue(null);

//     await expect(
//       service.addToCart({ customerId: 1, itemId: 2, itemQuantity: 1 }),
//     ).rejects.toBeInstanceOf(RestaurantNotMatch);
//   });
// });

// // ─── viewCart ─────────────────────────────────────────────────────────────────

// describe('CartService.viewCart', () => {
//   let service: CartService;

//   beforeEach(() => {
//     service = new CartService();
//     jest.clearAllMocks();
//   });

//   it('should return cart data with mapped items', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(mockCart);

//     const result = await service.viewCart(1) as any;

//     expect(result.cartId).toBe(10);
//     expect(result.cartItems).toHaveLength(1);
//     expect(result.cartItems[0].itemId).toBe(100);
//     expect(result.cartItems[0].itemName).toBe('Classic Burger');
//     expect(result.cartItems[0].itemPrice).toBe(35);
//   });

//   it('should return a message string when customer has no cart', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(null);

//     const result = await service.viewCart(1);

//     expect(typeof result).toBe('string');
//     expect(result).toBe('Customer has no cart');
//   });
// });

// // ─── clearCart ────────────────────────────────────────────────────────────────

// describe('CartService.clearCart', () => {
//   let service: CartService;

//   beforeEach(() => {
//     service = new CartService();
//     jest.clearAllMocks();
//   });

//   it('should clear cart successfully when cart exists', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(mockCart);
//     (CartRepository.clearCart as jest.Mock).mockResolvedValue({});

//     await expect(service.clearCart(1)).resolves.toBeUndefined();

//     expect(CartRepository.clearCart).toHaveBeenCalledWith(mockCart.id);
//   });

//   it('should throw CartNotFound when customer has no cart', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(null);

//     await expect(service.clearCart(1)).rejects.toBeInstanceOf(CartNotFound);
//     expect(CartRepository.clearCart).not.toHaveBeenCalled();
//   });
// });

// // ─── getTotalPriceAndQuantity ─────────────────────────────────────────────────

// describe('CartService.getTotalPriceAndQuantity', () => {
//   let service: CartService;

//   beforeEach(() => {
//     service = new CartService();
//     jest.clearAllMocks();
//   });

//   it('should calculate total price and quantity correctly', async () => {
//     const cartWithItems = {
//       ...mockCart,
//       cartItems: [
//         { quantity: 2, price: 35 },
//         { quantity: 1, price: 20 },
//       ],
//     };
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(cartWithItems);

//     const result = await service.getTotalPriceAndQuantity(1);

//     expect(result.totalQuantity).toBe(3);
//     expect(result.totalPrice).toBe(90); // 2*35 + 1*20
//   });

//   it('should throw CartNotFound when cart does not exist', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue(null);

//     await expect(service.getTotalPriceAndQuantity(1)).rejects.toBeInstanceOf(CartNotFound);
//   });

//   it('should return zero totals for an empty cart items list', async () => {
//     (CartRepository.findCartAndCartItems as jest.Mock).mockResolvedValue({
//       ...mockCart,
//       cartItems: [],
//     });

//     const result = await service.getTotalPriceAndQuantity(1);

//     expect(result.totalPrice).toBe(0);
//     expect(result.totalQuantity).toBe(0);
//   });
// });
