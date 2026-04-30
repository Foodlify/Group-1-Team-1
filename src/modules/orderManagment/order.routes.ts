import express from 'express';
import { OrderController } from './order.controller';
import { placeOrderValidator, getOrderValidator } from './order.middleware';
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

export { router as orderRouter };
