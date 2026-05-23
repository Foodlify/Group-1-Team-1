import express from 'express';
import { authValidator } from '../../middlewares/auth_handling/auth-handling';
import { TicketController } from './Controllers/ticket.controller';
import {
  validateCreateTicket,
  validateGetTicket,
  validateResolveTicket,
  validateUpdateTicket,
} from './Middlewares/ticket.middlewares';
import { validateRateRestaurant } from './Middlewares/rate.middleware';
import { RateController } from './Controllers/rate.controller';
import { LoyaltyPointsController } from './Controllers/points.controller';

const router = express.Router();
router.post(
  '/ticket',
  authValidator,
  validateCreateTicket,
  TicketController.createSupportTicket,
);

router.get(
  '/ticket/:id',
  authValidator,
  validateGetTicket,
  TicketController.getSupportTicket,
);

router.patch(
  '/ticket/:id',
  authValidator,
  validateUpdateTicket,
  TicketController.updateSupportTicketStatus,
);

router.patch(
  '/ticket/:id/resolve',
  authValidator,
  validateResolveTicket,
  TicketController.resolveSupportTicket,
);
router.post(
  '/rate/:orderId',
  authValidator,
  validateRateRestaurant,
  RateController.insertRestaurantRate,
);
router.get('/points', authValidator, LoyaltyPointsController.getPoints);
router.get(
  '/points/redeem',
  authValidator,
  LoyaltyPointsController.redeemPointsToMoney,
);

export { router as customerServiceRouter };
