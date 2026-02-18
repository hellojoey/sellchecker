// /api/waitlist — Capture interest in upcoming products (ResellerZen, Deadpile)
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { product } = await request.json();

    if (!product || typeof product !== 'string') {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // Get authenticated user's email
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
    }

    // Use service client to write to waitlist (bypasses RLS)
    const service = createServiceClient();
    const { error } = await service
      .from('product_waitlist')
      .upsert(
        { email: user.email, product: product.toLowerCase() },
        { onConflict: 'email,product' }
      );

    if (error) {
      console.error('[Waitlist] Insert error:', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('[Waitlist] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
