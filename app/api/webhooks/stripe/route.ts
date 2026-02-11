// POST /api/webhooks/stripe — Handle Stripe subscription lifecycle events
// IMPORTANT: This route must NOT use bodyParser (Next.js App Router handles this)
import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      // ─── Checkout completed (first-time subscription) ───
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId && customerId) {
          await supabase
            .from("profiles")
            .update({
              plan: "pro",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          console.log(`[Stripe] User ${userId} upgraded to Pro via checkout`);
        }
        break;
      }

      // ─── Subscription updated (renewal, trial end, plan change) ───
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const status = subscription.status;
        const customerId = subscription.customer;

        // Map Stripe status to our plan
        // active | trialing = pro, anything else = free
        const plan = status === "active" || status === "trialing" ? "pro" : "free";

        await supabase
          .from("profiles")
          .update({
            plan,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log(`[Stripe] Subscription ${subscription.id} status: ${status} → plan: ${plan}`);
        break;
      }

      // ─── Subscription canceled or expired ───
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        await supabase
          .from("profiles")
          .update({
            plan: "free",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        console.log(`[Stripe] Subscription ${subscription.id} deleted → reverted to free`);
        break;
      }

      // ─── Payment failed (e.g. card declined on renewal) ───
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;

        // If this is the final attempt, downgrade. Otherwise Stripe retries.
        if (invoice.next_payment_attempt === null) {
          await supabase
            .from("profiles")
            .update({
              plan: "free",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);

          console.log(`[Stripe] Final payment failed for customer ${customerId} → downgraded`);
        }
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
