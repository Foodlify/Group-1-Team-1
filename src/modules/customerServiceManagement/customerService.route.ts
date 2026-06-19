import express from 'express';
import { authCustomer as authValidator } from '../../middlewares/auth_handling/auth.middleware';
import { TicketController } from './Controllers/ticket.controller';
import { RateController } from './Controllers/rate.controller';
import { LoyaltyPointsController } from './Controllers/points.controller';
import { validate } from '../../shared_infrastructure/middleware/validate';
import {
  createTicketSchema,
  getTicketSchema,
  updateTicketSchema,
  resolveTicketSchema,
} from './Validations/ticket.validation';
import { createRateSchema } from './Validations/rate.validation';

const router = express.Router();

router.post(
  '/ticket',
  authValidator,
  validate(createTicketSchema),
  TicketController.createSupportTicket,
);

router.get(
  '/ticket/:id',
  authValidator,
  validate(getTicketSchema, (req) => ({ ticketId: req.params.id })),
  TicketController.getSupportTicket,
);

router.patch(
  '/ticket/:id',
  authValidator,
  validate(updateTicketSchema, (req) => ({ ...req.body, ticketId: req.params.id })),
  TicketController.updateSupportTicketStatus,
);

router.patch(
  '/ticket/:id/resolve',
  authValidator,
  validate(resolveTicketSchema, (req) => ({ ...req.body, ticketId: req.params.id })),
  TicketController.resolveSupportTicket,
);

router.post(
  '/rate/:orderId',
  authValidator,
  validate(createRateSchema, (req) => ({ ...req.body, orderId: req.params.orderId })),
  RateController.insertRestaurantRate,
);

router.get('/points', authValidator, LoyaltyPointsController.getPoints);
router.get('/points/redeem', authValidator, LoyaltyPointsController.redeemPointsToMoney);

export { router as customerServiceRouter };
