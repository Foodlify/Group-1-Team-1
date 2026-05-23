import express from 'express';
import { OrderController } from './controllers/order.controller';
import { placeOrderValidator, getOrderValidator, updateOrderStatusValidator, getOrdersByStatusValidator } from './order.middleware';
import { authValidator } from '../../middlewares/auth_handling/auth-handling';

const router = express.Router();
const orderController = new OrderController();
// POST   /api/v1/orders/checkout — validate and sync cart before placing order
router.post(
  '/checkout',
  authValidator,
  orderController.checkout,
);

// POST   /api/v1/orders — add order
router.post(
  '/',
  authValidator,
  placeOrderValidator,
  orderController.placeOrder,
);

// GET    /api/v1/order: — get single order details
router.get(
  '/:orderId',
  authValidator,
  getOrderValidator,
  orderController.getSingleOrder,
);

// PATCH  /api/v1/order/:orderId/status — update order status
router.patch(
  '/:orderId/status',
  authValidator,
  updateOrderStatusValidator,
  orderController.updateOrderStatus,
);

// GET    /api/v1/order/status?status=PENDING — get all orders by status
router.get(
  '/status',
  authValidator,
  getOrdersByStatusValidator,
  orderController.getOrdersByStatus,
);


export { router as orderRouter };
