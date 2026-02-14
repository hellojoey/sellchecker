// /api/search — Core search endpoint
// GET /api/search?q=Lululemon+Define+Jacket
import { NextRequest, NextResponse } from 'next/server';
import { searchEbay } from '@/lib/ebay/browse';
import { hashQuery, normalizeQuery, getCachedResult, setCachedResult } from '@/lib/cache';
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  if (query.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const normalized = normalizeQuery(query);
  const queryHash = hashQuery(query);

  try {
    const supabase = createServiceClient();

    // 1. Check cache first — cache hits are free for everyone
    const cached = await getCachedResult(supabase, queryHash);
    if (cached) {
      return NextResponse.json({
        result: {
          query: cached.query,
          soldCount90d: cached.sold_count_90d,
          activeCount: cached.active_count,
          sellThroughRate: cached.sell_through_rate,
          avgSoldPrice: cached.avg_sold_price,
          medianSoldPrice: cached.median_sold_price,
          priceLow: cached.price_low,
          priceHigh: cached.price_high,
          avgDaysToSell: cached.avg_days_to_sell,
          verdict: cached.verdict,
          totalResults: (cached.sold_count_90d || 0) + (cached.active_count || 0),
          platform: 'ebay',
          cachedAt: cached.cached_at,
          topListings: cached.raw_data?.topListings || [],
          dataSource: cached.raw_data?.dataSource || 'estimated',
        },
        cached: true,
      });
    }

    // 2. Cache miss — check auth + rate limit before calling eBay API
    let user: any = null;
    try {
      const authSupabase = createServerSupabase();
      const { data } = await authSupabase.auth.getUser();
      user = data?.user;
    } catch {
      // Auth check failed — proceed as anonymous
    }

    if (user) {
      const { data: allowed, error: limitError } = await supabase
        .rpc('check_search_limit', { p_user_id: user.id });

      if (!limitError && allowed === false) {
        return NextResponse.json(
          { error: 'Daily search limit reached. Upgrade to Pro for unlimited SellChecks!' },
          { status: 429 }
        );
      }
    }

    // 3. Call eBay API (Browse API + scraper in parallel)
    const result = await searchEbay(normalized);

    // 4. Cache the result
    await setCachedResult(supabase, queryHash, normalized, result);

    // 5. Track trending (fire and forget)
    trackTrending(supabase, normalized).catch(() => {});

    // 6. Get remaining searches for free users
    let remainingSearches: number | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, searches_today')
        .eq('id', user.id)
        .single();
      if (profile?.plan === 'free') {
        remainingSearches = Math.max(0, 5 - (profile.searches_today || 0));
      }
    }

    return NextResponse.json({
      result,
      cached: false,
      remainingSearches,
    });

  } catch (error: any) {
    console.error('Search API error:', error);

    // If eBay API is not configured, return demo data
    if (error.message?.includes('Missing eBay API credentials')) {
      return NextResponse.json({
        result: generateDemoResult(normalized),
        cached: false,
        demo: true,
      });
    }

    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Track search for trending feature
async function trackTrending(supabase: any, query: string) {
  try {
    // Upsert into search_trending table
    const { error } = await supabase.rpc('upsert_trending', { p_query: query });
    if (error) {
      // Fallback: try direct upsert if RPC doesn't exist yet
      await supabase
        .from('search_trending')
        .upsert(
          { query_normalized: query, search_count: 1, last_searched_at: new Date().toISOString() },
          { onConflict: 'query_normalized' }
        );
    }
  } catch (e) {
    // Silently fail — trending is non-critical
  }
}

// Demo data for development / when eBay API isn't configured yet
function generateDemoResult(query: string) {
  const DEMO_DATA: Record<string, any> = {
    'lululemon define jacket': { sold: 847, active: 1231, avgPrice: 68.50, median: 62.00, low: 28, high: 148 },
    'nike dunk low': { sold: 2341, active: 3892, avgPrice: 112.00, median: 105.00, low: 55, high: 350 },
    'coach tabby bag': { sold: 423, active: 389, avgPrice: 195.00, median: 175.00, low: 85, high: 450 },
    'doc martens 1460': { sold: 1156, active: 2089, avgPrice: 89.00, median: 82.00, low: 35, high: 190 },
    'true religion jeans': { sold: 634, active: 4521, avgPrice: 42.00, median: 35.00, low: 12, high: 185 },
    'carhartt wip jacket': { sold: 298, active: 412, avgPrice: 78.00, median: 72.00, low: 25, high: 195 },
  };

  const key = query.toLowerCase();
  const match = DEMO_DATA[key];

  let sold: number, active: number, avgPrice: number, medianPrice: number, low: number, high: number;

  if (match) {
    sold = match.sold;
    active = match.active;
    avgPrice = match.avgPrice;
    medianPrice = match.median;
    low = match.low;
    high = match.high;
  } else {
    // Generate plausible random data
    const seed = query.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    sold = 50 + (seed * 7) % 2000;
    active = 100 + (seed * 13) % 5000;
    avgPrice = 15 + (seed * 3) % 200;
    medianPrice = avgPrice * 0.9;
    low = avgPrice * 0.3;
    high = avgPrice * 2.5;
  }

  const sellThroughRate = Math.round((sold / (sold + active)) * 1000) / 10;
  const verdict = sellThroughRate >= 50 ? 'BUY' : sellThroughRate >= 20 ? 'RISKY' : 'PASS';

  return {
    query,
    soldCount90d: sold,
    activeCount: active,
    sellThroughRate,
    avgSoldPrice: Math.round(avgPrice * 100) / 100,
    medianSoldPrice: Math.round(medianPrice * 100) / 100,
    priceLow: Math.round(low * 100) / 100,
    priceHigh: Math.round(high * 100) / 100,
    avgDaysToSell: 3 + Math.floor(Math.random() * 14),
    verdict,
    totalResults: sold + active,
    platform: 'ebay',
    topListings: [],
  };
}
