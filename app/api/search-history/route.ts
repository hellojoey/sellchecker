// /api/search-history — Paginated search history for logged-in users
// GET /api/search-history?page=1&limit=20
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server';

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  const limitParam = request.nextUrl.searchParams.get('limit');
  const pageSize = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || DEFAULT_PAGE_SIZE), 100) : DEFAULT_PAGE_SIZE;
  const offset = (Math.max(1, page) - 1) * pageSize;

  try {
    // Require authentication
    const authSupabase = createServerSupabase();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Check if user is Pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const isPro = profile?.plan === 'pro';

    // Fetch search history
    const { data: searches, error, count } = await supabase
      .from('searches')
      .select('id, query, sell_through_rate, verdict, avg_sold_price, median_sold_price, sold_count_90d, active_count, searched_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Search history error:', error);
      return NextResponse.json({ error: 'Failed to load search history' }, { status: 500 });
    }

    return NextResponse.json({
      searches: searches || [],
      total: count || 0,
      page,
      isPro,
    });
  } catch (err) {
    console.error('Search history error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
