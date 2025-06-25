import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Check if Stripe is initialized
  if (!stripe) {
    return NextResponse.json(
      { error: 'Payment processing unavailable' }, 
      { status: 503 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email;
        
        console.log('🎉 Payment completed for:', customerEmail);
        
        if (customerEmail && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Determine plan based on amount paid
          let plan: 'basic' | 'pro' | 'enterprise' = 'basic';
          let analysesLimit = 25;

          if (session.amount_total) {
            const amount = session.amount_total / 100; // Convert from cents
            if (amount >= 799) {
              plan = 'enterprise';
              analysesLimit = 5000;
            } else if (amount >= 299) {
              plan = 'pro';
              analysesLimit = 250;
            } else if (amount >= 49) {
              plan = 'basic';
              analysesLimit = 25;
            }
          }

          console.log(`Upgrading ${customerEmail} to ${plan} plan with ${analysesLimit} analyses`);

          // Update customer in the customers table
          const { data, error } = await supabaseAdmin
            .from('customers')
            .upsert({
              email: customerEmail,
              plan_type: plan,
              analyses_limit: analysesLimit,
              analyses_used: 0,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'email'
            })
            .select();

          if (error) {
            console.error('❌ Error updating customer:', error);
          } else {
            console.log('✅ Customer upgraded successfully:', data);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find customer by stripe subscription ID
        const { data: customer } = await supabaseAdmin
          .from('customers')
          .select('email')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (customer) {
          await supabaseAdmin
            .from('customers')
            .update({
              subscription_status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log(`✅ Updated subscription status for ${customer.email}: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Downgrade customer to free plan
        const { data: customer } = await supabaseAdmin
          .from('customers')
          .select('email')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (customer) {
          await supabaseAdmin
            .from('customers')
            .update({
              plan_type: 'free',
              analyses_limit: 3,
              subscription_status: 'canceled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log(`✅ Downgraded ${customer.email} to free plan`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 