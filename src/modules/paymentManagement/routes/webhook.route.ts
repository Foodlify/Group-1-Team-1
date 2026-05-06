// routes/webhook.routes.ts
import { Router } from 'express';
import express from 'express';
import { WebhookController } from '../Controllers/webhook.controller';

const router = Router();

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  WebhookController.handleStripe,
);

export { router as webhookRouter };
