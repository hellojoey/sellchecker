// /api/saved — Save and retrieve saved searches for Pro users
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server';

// GET — retrieve all saved searches for the current user
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
      .from('saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ savedSearches: data || [] });
  } catch (error: any) {
    console.error('Saved searches GET error:', error);
    return NextResponse.json({ error: 'Failed to load saved searches' }, { status: 500 });
  }
}

// POST — save a new search
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

    const body = await request.json();
    const { query, costOfGoods, notes, searchData } = body;

    if (!query || !searchData) {
      return NextResponse.json({ error: 'Query and search data are required' }, { status: 400 });
    }

    const { data, error } = await serviceClient
      .from('saved_searches')
      .insert({
        user_id: user.id,
        query: query,
        cost_of_goods: costOfGoods || null,
        notes: notes || null,
        sell_through_rate: searchData.sellThroughRate,
        avg_sold_price: searchData.avgSoldPrice,
        median_sold_price: searchData.medianSoldPrice,
        price_low: searchData.priceLow,
        price_high: searchData.priceHigh,
        verdict: searchData.verdict,
        sold_count: searchData.soldCount90d,
        active_count: searchData.activeCount,
        snapshot_data: searchData,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ saved: data });
  } catch (error: any) {
    console.error('Saved searches POST error:', error);
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 });
  }
}

// DELETE — remove a saved search
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Search ID is required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Verify ownership and delete
    const { error } = await serviceClient
      .from('saved_searches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    console.error('Saved searches DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 });
  }
}

// PATCH — update COG or notes on a saved search
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { id, costOfGoods, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Search ID is required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    const updates: Record<string, any> = {};
    if (costOfGoods !== undefined) updates.cost_of_goods = costOfGoods;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await serviceClient
      .from('saved_searches')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ updated: data });
  } catch (error: any) {
    console.error('Saved searches PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update saved search' }, { status: 500 });
  }
}
