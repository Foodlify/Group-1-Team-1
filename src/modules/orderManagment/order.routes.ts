import express from 'express';
import { OrderController } from './controllers/order.controller';
import { placeOrderValidator, getOrderValidator, updateOrderStatusValidator } from './order.middleware';
import { authValidator } from '../../middlewares/auth_handling/auth-handling';

const router = express.Router();
const orderController = new OrderController();

// POST   /api/v1/order — add order
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

export { router as orderRouter };
