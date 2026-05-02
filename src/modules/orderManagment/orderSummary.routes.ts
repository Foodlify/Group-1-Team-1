import express from 'express';
import { OrderSummaryController } from './controllers/orderSummary.controller';
import { authValidator } from '../../middlewares/auth_handling/auth-handling';

const router = express.Router();
const orderSummaryController = new OrderSummaryController();

// GET /api/v1/order-summary — get all order summaries by customer
router.get(
  '/',
  authValidator,
  orderSummaryController.getSummariesByCustomer,
);

export { router as orderSummaryRouter };
