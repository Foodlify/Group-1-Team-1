import express from 'express';
import { cartRouter } from '../modules/cartManagement/cart.routes';
import { orderRouter } from '../modules/orderManagment/order.routes';

const router = express.Router();

router.use('/cart',cartRouter);
router.use('/orders',orderRouter);

export default router