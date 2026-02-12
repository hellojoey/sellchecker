import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not configured");
}

/**
 * Server-side Stripe client
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * Find or create a Stripe customer for a Supabase user.
 * Stores the customer ID in the profiles table for future lookups.
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  supabase: any
): Promise<string> {
  // Check if user already has a Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  // Save to profile
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for Pro subscription.
 * Includes 7-day free trial.
 */
export async function createCheckoutSession(
  customerId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_PRO_PRICE_ID is not configured");
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    subscription_data: {
      trial_period_days: 7,
      metadata: { supabase_user_id: userId },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session so users can
 * manage their subscription (cancel, update payment, etc.)
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Verify and construct a webhook event from Stripe.
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(body, signature, secret);
}
