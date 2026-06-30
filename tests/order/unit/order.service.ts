// ─── Mock payment modules before any imports resolve ────────────────────────
jest.mock('../../../src/modules/paymentManagement/PaymentStrategies/payment.strategy', () => ({
  PaymentStrategy: jest.fn().mockImplementation(() => ({
    createPayment: jest.fn(),
  })),
}));

jest.mock('../../../src/modules/paymentManagement/Services/payment.service', () => ({
  PaymentService: { getPaymentTypeById: jest.fn() },
}));

jest.mock('../../../src/modules/paymentManagement/Services/transaction.service', () => ({
  TransactionService: { createTransaction: jest.fn() },
}));

jest.mock('../../../src/modules/customerManagement/Services/address.service', () => ({
  AddressService: { getAddressByCustomerId: jest.fn() },
}));

jest.mock('../../../src/modules/cartManagement/cart.service', () => ({
  CartService: { validCartAntItems: jest.fn() },
}));

import { OrderService } from '../../../src/modules/orderManagment/Services/order.service';
import { OrderRepository } from '../../../src/modules/orderManagment/Repositories/order.repository';
import { NOT_FOUND, BAD_REQUEST } from '../../../src/shared_infrastructure/error/error.execption';
import { OrderStatusEnum, PaymentTypeEnum } from '@prisma/client';

// ─── Mock repository and infrastructure ──────────────────────────────────────
jest.mock('../../../src/modules/orderManagment/Repositories/order.repository');
jest.mock('../../../src/modules/orderManagment/Services/orderSummary.service');
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn((cb: any) => cb({})),
  },
}));

// ─── Shared mock data ────────────────────────────────────────────────────────

const mockOrderRow = {
  id: 1,
  totalPrice: 150,
  timestamp: new Date('2026-05-01'),
  restaurant: { name: 'Pizza Palace' },
  paymentType: { name: 'CASH' },
  address: { state: 'Cairo', city: 'Nasr City', street: 'Abbas El Akkad' },
  orderStatus: { name: OrderStatusEnum.CONFIRMED },
  orderDetails: [
    { menuItemName: 'Classic Burger', quantity: 2, price: 35 },
    { menuItemName: 'Fries', quantity: 1, price: 20 },
  ],
};

// ─── getSingleOrder ───────────────────────────────────────────────────────────

describe('OrderService.getSingleOrder', () => {
  afterEach(() => jest.clearAllMocks());

  it('should return a mapped SingleOrderResponse when order exists', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue({ id: 1, orderStatusId: 2 });
    (OrderRepository.getSingleOrderAndDetailsById as jest.Mock).mockResolvedValue(mockOrderRow);

    const result = await OrderService.getSingleOrder(1, 1);

    expect(result.orderId).toBe(1);
    expect(result.totalPrice).toBe(150);
    expect(result.restaurantName).toBe('Pizza Palace');
    expect(result.paymentMethod).toBe('CASH');
    expect(result.state).toBe('Cairo');
    expect(result.city).toBe('Nasr City');
    expect(result.street).toBe('Abbas El Akkad');
    expect(result.status).toBe(OrderStatusEnum.CONFIRMED);
    expect(result.orderDetails).toHaveLength(2);
  });

  it('should throw NOT_FOUND when order does not belong to customer', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue(null);

    await expect(OrderService.getSingleOrder(1, 99)).rejects.toBeInstanceOf(NOT_FOUND);
  });

  it('should throw NOT_FOUND when order details are not found', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue({ id: 1, orderStatusId: 2 });
    (OrderRepository.getSingleOrderAndDetailsById as jest.Mock).mockResolvedValue(null);

    await expect(OrderService.getSingleOrder(1, 1)).rejects.toBeInstanceOf(NOT_FOUND);
  });
});

// ─── updateOrderStatus ────────────────────────────────────────────────────────

describe('OrderService.updateOrderStatus', () => {
  afterEach(() => jest.clearAllMocks());

  it('should transition PENDING → CONFIRMED successfully', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue({ id: 1, orderStatusId: 1 });
    (OrderRepository.getOrderStatusById as jest.Mock).mockResolvedValue({ id: 1, name: OrderStatusEnum.PENDING });
    (OrderRepository.updateOrderStatusByName as jest.Mock).mockResolvedValue({});

    await expect(
      OrderService.updateOrderStatus(1, 1, OrderStatusEnum.CONFIRMED),
    ).resolves.toBeUndefined();

    expect(OrderRepository.updateOrderStatusByName).toHaveBeenCalledWith(1, OrderStatusEnum.CONFIRMED);
  });

  it('should transition CONFIRMED → CANCELLED successfully', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue({ id: 1, orderStatusId: 2 });
    (OrderRepository.getOrderStatusById as jest.Mock).mockResolvedValue({ id: 2, name: OrderStatusEnum.CONFIRMED });
    (OrderRepository.updateOrderStatusByName as jest.Mock).mockResolvedValue({});

    await expect(
      OrderService.updateOrderStatus(1, 1, OrderStatusEnum.CANCELLED),
    ).resolves.toBeUndefined();

    expect(OrderRepository.updateOrderStatusByName).toHaveBeenCalledWith(1, OrderStatusEnum.CANCELLED);
  });

  it('should throw NOT_FOUND when order does not exist', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue(null);

    await expect(
      OrderService.updateOrderStatus(1, 99, OrderStatusEnum.CONFIRMED),
    ).rejects.toBeInstanceOf(NOT_FOUND);
  });

  it('should throw BAD_REQUEST when order status entity is not found', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue({ id: 1, orderStatusId: 99 });
    (OrderRepository.getOrderStatusById as jest.Mock).mockResolvedValue(null);

    await expect(
      OrderService.updateOrderStatus(1, 1, OrderStatusEnum.CONFIRMED),
    ).rejects.toBeInstanceOf(BAD_REQUEST);
  });

  it('should throw an error for invalid state transition (PENDING → DELIVERED)', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue({ id: 1, orderStatusId: 1 });
    (OrderRepository.getOrderStatusById as jest.Mock).mockResolvedValue({ id: 1, name: OrderStatusEnum.PENDING });

    await expect(
      OrderService.updateOrderStatus(1, 1, OrderStatusEnum.DELIVERED),
    ).rejects.toThrow(/Cannot/);
  });

  it('should throw an error for invalid state transition (DELIVERED → CONFIRMED)', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue({ id: 1, orderStatusId: 6 });
    (OrderRepository.getOrderStatusById as jest.Mock).mockResolvedValue({ id: 6, name: OrderStatusEnum.DELIVERED });

    await expect(
      OrderService.updateOrderStatus(1, 1, OrderStatusEnum.CONFIRMED),
    ).rejects.toThrow(/Cannot/);
  });

  it('should throw an error for unknown newStatus', async () => {
    (OrderRepository.getSingleOrderById as jest.Mock).mockResolvedValue({ id: 1, orderStatusId: 1 });
    (OrderRepository.getOrderStatusById as jest.Mock).mockResolvedValue({ id: 1, name: OrderStatusEnum.PENDING });

    await expect(
      OrderService.updateOrderStatus(1, 1, 'INVALID' as OrderStatusEnum),
    ).rejects.toThrow();
  });
});

// ─── getOrdersByStatus ────────────────────────────────────────────────────────

describe('OrderService.getOrdersByStatus', () => {
  afterEach(() => jest.clearAllMocks());

  const mockOrders = [
    {
      id: 1,
      totalPrice: 150,
      timestamp: new Date('2026-05-01'),
      restaurant: { name: 'Pizza Palace' },
      paymentType: { name: 'CASH' },
      address: { state: 'Cairo', city: 'Nasr City', street: 'Abbas El Akkad' },
      orderStatus: { name: OrderStatusEnum.PENDING },
      orderDetails: [{ menuItemName: 'Burger', quantity: 2, price: 35 }],
    },
    {
      id: 2,
      totalPrice: 80,
      timestamp: new Date('2026-05-02'),
      restaurant: { name: 'Burger House' },
      paymentType: { name: 'CARD' },
      address: { state: null, city: 'Alexandria', street: 'Corniche' },
      orderStatus: { name: OrderStatusEnum.PENDING },
      orderDetails: [{ menuItemName: 'Fries', quantity: 1, price: 20 }],
    },
  ];

  it('should return mapped list of orders for given status', async () => {
    (OrderRepository.getOrdersByCustomerAndOrderStatus as jest.Mock).mockResolvedValue(mockOrders);

    const result = await OrderService.getOrdersByStatus(1, OrderStatusEnum.PENDING);

    expect(result).toHaveLength(2);
    expect(result[0].orderId).toBe(1);
    expect(result[0].restaurantName).toBe('Pizza Palace');
    expect(result[0].status).toBe(OrderStatusEnum.PENDING);
    expect(result[0].orderDetails[0].name).toBe('Burger');
    expect(result[1].orderId).toBe(2);
  });

  it('should return an empty array when no orders match', async () => {
    (OrderRepository.getOrdersByCustomerAndOrderStatus as jest.Mock).mockResolvedValue([]);

    const result = await OrderService.getOrdersByStatus(1, OrderStatusEnum.REFUNDED);

    expect(result).toEqual([]);
  });

  it('should call repository with correct customerId and status', async () => {
    (OrderRepository.getOrdersByCustomerAndOrderStatus as jest.Mock).mockResolvedValue([]);

    await OrderService.getOrdersByStatus(42, OrderStatusEnum.DELIVERED);

    expect(OrderRepository.getOrdersByCustomerAndOrderStatus).toHaveBeenCalledWith(
      42,
      OrderStatusEnum.DELIVERED,
    );
  });

  it('should correctly map orderDetails names from menuItemName', async () => {
    (OrderRepository.getOrdersByCustomerAndOrderStatus as jest.Mock).mockResolvedValue([mockOrders[0]]);

    const result = await OrderService.getOrdersByStatus(1, OrderStatusEnum.PENDING);

    expect(result[0].orderDetails[0].name).toBe('Burger');
    expect(result[0].orderDetails[0].quantity).toBe(2);
    expect(result[0].orderDetails[0].price).toBe(35);
  });
});

// ─── placeOrder ───────────────────────────────────────────────────────────────

describe('OrderService.placeOrder', () => {
  // Import mocked modules so we can control them per test
  const { CartService } = jest.requireMock('../../../src/modules/cartManagement/cart.service');
  const { AddressService } = jest.requireMock('../../../src/modules/customerManagement/Services/address.service');
  const { PaymentService } = jest.requireMock('../../../src/modules/paymentManagement/Services/payment.service');
  const { TransactionService } = jest.requireMock('../../../src/modules/paymentManagement/Services/transaction.service');
  const { PaymentStrategy } = jest.requireMock('../../../src/modules/paymentManagement/PaymentStrategies/payment.strategy');
  const prisma = jest.requireMock('../../../lib/prisma').default;

  const validInput = {
    customerId: 1,
    addressId: 1,
    paymentTypeId: 1,
    preferredDate: new Date('2026-06-01'),
  };

  const mockCart = {
    id: 10,
    customerId: 1,
    restaurantId: 2,
    cartItems: [{ menuItemId: 1, quantity: 2, price: 35, name: 'Burger' }],
  };

  const mockOrder = {
    id: 5,
    customerId: 1,
    totalPrice: 150,
    orderDetails: [{ menuItemName: 'Burger', quantity: 2, price: 35 }],
  };

  const mockTransaction = { id: 'pi_test_123', client_secret: 'secret_abc' };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: $transaction executes callback immediately
    prisma.$transaction.mockImplementation((cb: any) => cb({}));
  });

  // ─── Success: CASH payment → order starts as CONFIRMED ────────────────────

  it('should place order successfully with CASH payment (status → CONFIRMED)', async () => {
    CartService.validCartAntItems.mockResolvedValue({ cart: mockCart, totalPrice: 150 });
    AddressService.getAddressByCustomerId.mockResolvedValue({ id: 1, street: 'Test St' });
    PaymentService.getPaymentTypeById.mockResolvedValue({ id: 1, name: PaymentTypeEnum.CASH });

    (OrderRepository.getOrderStatusByName as jest.Mock).mockResolvedValue({ id: 2, name: OrderStatusEnum.CONFIRMED });
    (OrderRepository.createOrderAndDetails as jest.Mock).mockResolvedValue(mockOrder);

    const mockPaymentInstance = { createPayment: jest.fn().mockResolvedValue(mockTransaction) };
    PaymentStrategy.mockImplementation(() => mockPaymentInstance);

    TransactionService.createTransaction.mockResolvedValue({});

    const result = await OrderService.placeOrder(validInput);

    expect(result).toEqual(mockTransaction);
    expect(CartService.validCartAntItems).toHaveBeenCalledWith(1);
    expect(AddressService.getAddressByCustomerId).toHaveBeenCalledWith(1, 1);
    expect(PaymentService.getPaymentTypeById).toHaveBeenCalledWith(1);
    expect(OrderRepository.getOrderStatusByName).toHaveBeenCalledWith({}, OrderStatusEnum.CONFIRMED);
    expect(OrderRepository.createOrderAndDetails).toHaveBeenCalled();
    expect(TransactionService.createTransaction).toHaveBeenCalledWith(
      {}, mockOrder.id, 1, mockTransaction.id, mockOrder.totalPrice,
    );
  });

  // ─── Success: CARD payment → order starts as PENDING ─────────────────────

  it('should place order successfully with CARD payment (status → PENDING)', async () => {
    CartService.validCartAntItems.mockResolvedValue({ cart: mockCart, totalPrice: 150 });
    AddressService.getAddressByCustomerId.mockResolvedValue({ id: 1 });
    PaymentService.getPaymentTypeById.mockResolvedValue({ id: 2, name: PaymentTypeEnum.CARD });

    (OrderRepository.getOrderStatusByName as jest.Mock).mockResolvedValue({ id: 1, name: OrderStatusEnum.PENDING });
    (OrderRepository.createOrderAndDetails as jest.Mock).mockResolvedValue(mockOrder);

    const mockPaymentInstance = { createPayment: jest.fn().mockResolvedValue(mockTransaction) };
    PaymentStrategy.mockImplementation(() => mockPaymentInstance);
    TransactionService.createTransaction.mockResolvedValue({});

    const result = await OrderService.placeOrder({ ...validInput, paymentTypeId: 2 });

    expect(result).toEqual(mockTransaction);
    expect(OrderRepository.getOrderStatusByName).toHaveBeenCalledWith({}, OrderStatusEnum.PENDING);
  });

  // ─── Error: cart is empty / invalid ─────────────────────────────────────

  it('should throw NOT_FOUND when cart is not valid (validCartAntItems throws)', async () => {
    CartService.validCartAntItems.mockRejectedValue(new NOT_FOUND('Cart'));

    await expect(OrderService.placeOrder(validInput)).rejects.toBeInstanceOf(NOT_FOUND);
    expect(AddressService.getAddressByCustomerId).not.toHaveBeenCalled();
  });

  // ─── Error: address not found ─────────────────────────────────────────────

  it('should throw NOT_FOUND when address does not belong to customer', async () => {
    CartService.validCartAntItems.mockResolvedValue({ cart: mockCart, totalPrice: 150 });
    AddressService.getAddressByCustomerId.mockRejectedValue(new NOT_FOUND('Address'));

    await expect(OrderService.placeOrder(validInput)).rejects.toBeInstanceOf(NOT_FOUND);
    expect(PaymentService.getPaymentTypeById).not.toHaveBeenCalled();
  });

  // ─── Error: payment type not found ───────────────────────────────────────

  it('should throw NOT_FOUND when payment type does not exist', async () => {
    CartService.validCartAntItems.mockResolvedValue({ cart: mockCart, totalPrice: 150 });
    AddressService.getAddressByCustomerId.mockResolvedValue({ id: 1 });
    PaymentService.getPaymentTypeById.mockResolvedValue(null);

    await expect(OrderService.placeOrder(validInput)).rejects.toBeInstanceOf(NOT_FOUND);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  // ─── Error: order creation fails inside transaction ───────────────────────

  it('should throw BAD_REQUEST when order creation returns null', async () => {
    CartService.validCartAntItems.mockResolvedValue({ cart: mockCart, totalPrice: 150 });
    AddressService.getAddressByCustomerId.mockResolvedValue({ id: 1 });
    PaymentService.getPaymentTypeById.mockResolvedValue({ id: 1, name: PaymentTypeEnum.CASH });

    (OrderRepository.getOrderStatusByName as jest.Mock).mockResolvedValue({ id: 2, name: OrderStatusEnum.CONFIRMED });
    (OrderRepository.createOrderAndDetails as jest.Mock).mockResolvedValue(null);

    await expect(OrderService.placeOrder(validInput)).rejects.toBeInstanceOf(BAD_REQUEST);
    expect(TransactionService.createTransaction).not.toHaveBeenCalled();
  });

  // ─── Error: payment transaction creation fails ────────────────────────────

  it('should throw BAD_REQUEST when payment strategy returns no transaction', async () => {
    CartService.validCartAntItems.mockResolvedValue({ cart: mockCart, totalPrice: 150 });
    AddressService.getAddressByCustomerId.mockResolvedValue({ id: 1 });
    PaymentService.getPaymentTypeById.mockResolvedValue({ id: 1, name: PaymentTypeEnum.CASH });

    (OrderRepository.getOrderStatusByName as jest.Mock).mockResolvedValue({ id: 2, name: OrderStatusEnum.CONFIRMED });
    (OrderRepository.createOrderAndDetails as jest.Mock).mockResolvedValue(mockOrder);

    const mockPaymentInstance = { createPayment: jest.fn().mockResolvedValue(null) };
    PaymentStrategy.mockImplementation(() => mockPaymentInstance);

    await expect(OrderService.placeOrder(validInput)).rejects.toBeInstanceOf(BAD_REQUEST);
    expect(TransactionService.createTransaction).not.toHaveBeenCalled();
  });

  // ─── Error: order status not found (db inconsistency) ────────────────────

  it('should throw NOT_FOUND when order status is not found in DB', async () => {
    CartService.validCartAntItems.mockResolvedValue({ cart: mockCart, totalPrice: 150 });
    AddressService.getAddressByCustomerId.mockResolvedValue({ id: 1 });
    PaymentService.getPaymentTypeById.mockResolvedValue({ id: 1, name: PaymentTypeEnum.CASH });

    (OrderRepository.getOrderStatusByName as jest.Mock).mockResolvedValue(null);

    await expect(OrderService.placeOrder(validInput)).rejects.toBeInstanceOf(NOT_FOUND);
    expect(OrderRepository.createOrderAndDetails).not.toHaveBeenCalled();
  });
});
