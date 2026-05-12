import express from 'express';
import { OrderController } from './controllers/order.controller';
import { placeOrderValidator, getOrderValidator, updateOrderStatusValidator, getOrdersByStatusValidator } from './order.middleware';
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

// GET    /api/v1/order/status?status=PENDING — get all orders by status
router.get(
  '/status',
  authValidator,
  getOrdersByStatusValidator,
  orderController.getOrdersByStatus,
);

router.patch(
  '/orders/:orderId/tracking-status',
  orderController.updateOrderTrackingStatus,
);

// Get                     - get current order tracking status 
router.get(
'/orders/:orderId/get-current-status', 
orderController.getTrackingStatus,
); 
export { router as orderRouter };
