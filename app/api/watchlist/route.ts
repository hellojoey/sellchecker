// /api/watchlist — Manage watchlist items for Pro users
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server';

// GET — retrieve all watchlist items for the current user
export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is Pro
    const serviceClient = createServiceClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
    }

    const { data, error } = await serviceClient
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Watchlist] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to load watchlist' }, { status: 500 });
    }

    return NextResponse.json({ watchlist: data || [] });
  } catch (error) {
    console.error('[Watchlist] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST — add a query to the watchlist
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is Pro
    const serviceClient = createServiceClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
    }

    const { query, target_price, alert_type, current_str, current_avg_price } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check for duplicates
    const { data: existing } = await serviceClient
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('query', query)
      .eq('is_active', true)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already watching this item' }, { status: 409 });
    }

    // Check watchlist limit (max 25 items)
    const { count } = await serviceClient
      .from('watchlist')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (count && count >= 25) {
      return NextResponse.json({ error: 'Watchlist full (max 25 items)' }, { status: 400 });
    }

    const validAlertTypes = ['price_drop', 'str_change', 'both'];
    const { data, error } = await serviceClient
      .from('watchlist')
      .insert({
        user_id: user.id,
        query: query.trim(),
        target_price: target_price ? parseFloat(target_price) : null,
        alert_type: validAlertTypes.includes(alert_type) ? alert_type : 'both',
        last_str: current_str || null,
        last_avg_price: current_avg_price || null,
        last_checked: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[Watchlist] Insert error:', error);
      return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
    }

    console.log(`[Watchlist] Added: query="${query}" user=${user.id}`);
    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('[Watchlist] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE — remove an item from the watchlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Soft delete — set is_active to false
    const { error } = await serviceClient
      .from('watchlist')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[Watchlist] Delete error:', error);
      return NextResponse.json({ error: 'Failed to remove' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Watchlist] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
