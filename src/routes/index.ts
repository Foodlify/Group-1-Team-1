import express from 'express';
import { cartRouter } from '../modules/cartManagement/cart.routes';
import { orderRouter } from '../modules/orderManagment/order.routes';
import { orderTrackingRouter } from '../modules/orderManagment/orderTracking.routes';
import { orderSummaryRouter } from '../modules/orderManagment/orderSummary.routes';
import { webhookRouter } from '../modules/paymentManagement/routes/webhook.route';
import customerRouter from '../modules/customerManagement/customer.routes';
import { customerServiceRouter } from '../modules/customerServiceManagement/customerService.route';
import dashboardRouter from '../modules/userManagement/user.routes';

const router = express.Router();

// ─── Website (customer) routes ────────────────────────────────────────────────
router.use('/cart',             cartRouter);
router.use('/orders',           orderRouter);
router.use('/orders',           orderTrackingRouter);
router.use('/order-summary',    orderSummaryRouter);
router.use('/webhook',          webhookRouter);
router.use('/customers',        customerRouter);
router.use('/customer-service', customerServiceRouter);

// ─── Dashboard (admin) routes ─────────────────────────────────────────────────
router.use('/dashboard',        dashboardRouter);

export default router;
