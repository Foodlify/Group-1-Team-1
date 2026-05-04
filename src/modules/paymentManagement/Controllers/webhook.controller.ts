// webhook.controller.ts
import { Request, Response } from 'express';
import { stripe } from '../../../config/stripe';
import { PaymentStrategy } from '../PaymentStrategies/payment.strategy';
import { PaymentTypeEnum } from '@prisma/client';

export class WebhookController {
  static async handleStripe(req: Request, res: Response) {
    const sig = req.headers['stripe-signature']!;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      return res.status(400).send('Invalid signature');
    }
    const strategy = new PaymentStrategy(PaymentTypeEnum.STRIPE);
    await strategy.handleWebhook(event);
    res.json({ received: true });
  }
}
