import Stripe from 'stripe';

// Only initialize Stripe if the secret key is available (not during build time)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

export const PLANS = {
  starter: {
    name: 'Basic',
    price: 9900, // $99 in cents
    proposals_limit: 10,
    users_limit: 3,
    features: ['Basic AI generation', 'PDF upload', 'Email support']
  },
  pro: {
    name: 'Pro',
    price: 19900, // $199 in cents
    proposals_limit: 100,
    users_limit: 20,
    features: ['Advanced AI', 'Team collaboration', 'Analytics', 'Priority support']
  },
  enterprise: {
    name: 'Enterprise',
    price: 200000, // $2000 in cents
    proposals_limit: -1, // unlimited
    users_limit: -1, // unlimited
    features: ['Custom AI training', 'White-label', 'API access', 'Dedicated support']
  }
};

export async function createSubscription(
  customerId: string,
  priceId: string,
  workspaceId: string
) {
  if (!stripe) {
    throw new Error('Stripe not initialized - missing STRIPE_SECRET_KEY');
  }
  
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata: {
      workspace_id: workspaceId,
    },
  });
}

export { stripe };