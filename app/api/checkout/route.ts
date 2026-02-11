// POST /api/checkout — Create a Stripe Checkout Session for Pro subscription
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createCheckoutSession, getOrCreateCustomer } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Get the authenticated user
    const supabase = createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe" },
        { status: 401 }
      );
    }

    // 2. Use service client for DB writes (RLS won't block)
    const serviceClient = createServiceClient();

    // 3. Get or create Stripe customer
    const customerId = await getOrCreateCustomer(
      user.id,
      user.email!,
      serviceClient
    );

    // 4. Create Checkout Session
    const origin =
      request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
    const session = await createCheckoutSession(
      customerId,
      user.id,
      `${origin}/search?upgraded=true`,
      `${origin}/pricing?canceled=true`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
