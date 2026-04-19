import Stripe from 'stripe';

const stripeKey = import.meta.env.STRIPE_SECRET_KEY ?? '';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

export function formatGBP(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(pence / 100);
}
