import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is not configured");
}

/**
 * Server-side Stripe client
 * Used for creating checkout sessions, managing subscriptions, webhooks
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

/**
 * Create a checkout session for Pro subscription
 * TODO: Implement full checkout flow with Supabase user integration
 */
export async function createCheckoutSession(
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_PRO || "",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      // TODO: Add customer email and other metadata
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Handle webhook events from Stripe
 * TODO: Implement webhook handler for subscription events
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
  secret: string
) {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw error;
  }
}
