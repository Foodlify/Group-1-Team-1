import express from 'express';
import { cartRouter } from '../modules/cartManagement/cart.routes';
import { orderRouter } from '../modules/orderManagment/order.routes';
import { orderTrackingRouter } from '../modules/orderManagment/orderTracking.routes';
import { orderSummaryRouter } from '../modules/orderManagment/orderSummary.routes';
import { webhookRouter } from '../modules/paymentManagement/routes/webhook.route';

const router = express.Router();

router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/orders', orderTrackingRouter);
router.use('/order-summary', orderSummaryRouter);
router.use('/webhook', webhookRouter);

export default router;