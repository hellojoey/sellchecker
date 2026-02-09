// /api/search — Core search endpoint
// GET /api/search?q=Lululemon+Define+Jacket
import { NextRequest, NextResponse } from 'next/server';
import { searchEbay } from '@/lib/ebay/browse';
import { hashQuery, normalizeQuery } from '@/lib/cache';

const FREE_LIMIT = parseInt(process.env.NEXT_PUBLIC_FREE_SEARCH_LIMIT || '5');

// In-memory cache as fallback when Supabase isn't configured
const memoryCache = new Map<string, { result: any; expiresAt: number }>();

// Try to get Supabase client (returns null if not configured)
function getSupabase() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;

    const { createClient } = require('@supabase/supabase-js');
    return createClient(url, key);
  } catch {
    return null;
  }
}

// Check cache — tries Supabase first, falls back to in-memory
async function checkCache(queryHash: string) {
  // Try Supabase cache
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('search_cache')
        .select('*')
        .eq('query_hash', queryHash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (data) {
        return {
          query: data.query,
          soldCount90d: data.sold_count_90d,
          activeCount: data.active_count,
          sellThroughRate: data.sell_through_rate,
          avgSoldPrice: data.avg_sold_price,
          medianSoldPrice: data.median_sold_price,
          priceLow: data.price_low,
          priceHigh: data.price_high,
          avgDaysToSell: data.avg_days_to_sell,
          verdict: data.verdict,
          totalResults: (data.sold_count_90d || 0) + (data.active_count || 0),
          platform: 'ebay',
          cachedAt: data.cached_at,
        };
      }
    } catch (e) {
      console.warn('Supabase cache read failed, using memory cache');
    }
  }

  // Fall back to in-memory cache
  const cached = memoryCache.get(queryHash);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  return null;
}

// Store in cache — tries Supabase, falls back to in-memory
async function storeCache(queryHash: string, query: string, result: any) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Store in memory cache regardless
  memoryCache.set(queryHash, {
    result,
    expiresAt: expiresAt.getTime(),
  });

  // Also store in Supabase if available
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('search_cache').upsert({
        query_hash: queryHash,
        query,
        sold_count_90d: result.soldCount90d,
        active_count: result.activeCount,
        sell_through_rate: result.sellThroughRate,
        avg_sold_price: result.avgSoldPrice,
        median_sold_price: result.medianSoldPrice,
        price_low: result.priceLow,
        price_high: result.priceHigh,
        avg_days_to_sell: result.avgDaysToSell,
        verdict: result.verdict,
        raw_data: result,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    } catch (e) {
      console.warn('Supabase cache write failed, using memory only');
    }
  }
}

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
    // 1. Check cache first
    const cached = await checkCache(queryHash);
    if (cached) {
      return NextResponse.json({
        result: cached,
        cached: true,
      });
    }

    // 2. Not cached — call eBay API
    const result = await searchEbay(normalized);

    // 3. Cache the result
    await storeCache(queryHash, normalized, result);

    return NextResponse.json({
      result,
      cached: false,
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

    // If eBay API returned an error, include details for debugging
    if (error.message?.includes('eBay')) {
      return NextResponse.json(
        { error: 'eBay API error. Please try again.', details: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
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
  };
}
