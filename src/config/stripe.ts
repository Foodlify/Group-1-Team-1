// import Stripe from 'stripe';

// let _stripe: Stripe | null = null;

// export function getStripe(): Stripe {
//   if (!_stripe) {
//     const key = process.env.STRIPE_SECRET_KEY;
//     if (!key) {
//       throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
//     }
//     _stripe = new Stripe(key);
//   }
//   return _stripe;
// }

// // Keep a named export for backwards compatibility with any direct `stripe.X` usage
// export const stripe = new Proxy({} as Stripe, {
//   get(_target, prop) {
//     return (getStripe() as any)[prop];
//   },
// });

import Stripe from 'stripe';

type StripeClient = InstanceType<typeof Stripe>;

let _stripe: StripeClient | null = null;

export function getStripe(): StripeClient {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }

    _stripe = new Stripe(key);
  }

  return _stripe;
}

export const stripe = new Proxy({} as StripeClient, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});
