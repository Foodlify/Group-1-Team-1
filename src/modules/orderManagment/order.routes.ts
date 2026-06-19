import express from 'express';
import { OrderController } from './controllers/order.controller';
import { authCustomer as authValidator } from '../../middlewares/auth_handling/auth.middleware';
import { validate } from '../../shared_infrastructure/middleware/validate';
import {
  PlaceOrderSchema,
  GetOrderSchema,
  UpdateOrderStatusSchema,
  GetOrdersByStatusSchema,
} from './order.validation';

const router = express.Router();
const orderController = new OrderController();

// POST /api/v1/orders/checkout
router.post('/checkout', authValidator, orderController.checkout);

// POST /api/v1/orders
router.post(
  '/',
  authValidator,
  validate(PlaceOrderSchema),
  orderController.placeOrder,
);

// GET /api/v1/orders/:orderId
router.get(
  '/:orderId',
  authValidator,
  validate(GetOrderSchema, (req) => ({ orderId: req.params.orderId })),
  orderController.getSingleOrder,
);

// PATCH /api/v1/orders/:orderId/status
router.patch(
  '/:orderId/status',
  authValidator,
  validate(UpdateOrderStatusSchema, (req) => ({ orderId: req.params.orderId, status: req.body.status })),
  orderController.updateOrderStatus,
);

// GET /api/v1/orders/status?status=PENDING
router.get(
  '/status',
  authValidator,
  validate(GetOrdersByStatusSchema, (req) => ({ status: req.query.status })),
  orderController.getOrdersByStatus,
);

// PATCH /api/v1/orders/:orderId/cancel-order
router.patch(
  '/:orderId/cancel-order',
  authValidator,
  orderController.cancelOrder,
);

export { router as orderRouter };
