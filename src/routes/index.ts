import express from 'express';
import { cartRouter } from '../modules/cartManagement/cart.routes';
import { orderRouter } from '../modules/orderManagment/order.routes';
import { orderSummaryRouter } from '../modules/orderManagment/orderSummary.routes';

const router = express.Router();

router.use('/cart',cartRouter);
router.use('/orders',orderRouter);
router.use('/order-summary', orderSummaryRouter);

export default router