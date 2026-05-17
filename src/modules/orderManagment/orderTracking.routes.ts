import express from 'express';
import { OrderTrackingController } from './controllers/orderTracking.controller';
import { authValidator } from '../../middlewares/auth_handling/auth-handling';

const router = express.Router();
const orderTrackingController = new OrderTrackingController();

// // PATCH /api/v1/orders/:customerId/:orderId/tracking-status
// router.patch(
//   '/:customerId/:orderId/tracking-status',
//   authValidator,
//   orderTrackingController.updateOrderTrackingStatus,
// );

// // GET /api/v1/orders/:orderId/get-current-status
// router.get(
//   '/:orderId/get-current-status',
//   authValidator,
//   orderTrackingController.getCurrentStatus,
// );

// GET /api/v1/orders/:orderId/tracking-history
router.get(
  '/:orderId/tracking-history',
  authValidator,
  orderTrackingController.getOrderTrackingHistory,
);

export { router as orderTrackingRouter };
