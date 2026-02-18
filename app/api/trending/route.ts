// /api/trending — Returns popular search queries
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Try to get trending from the search_trending table
    const { data, error } = await supabase
      .from('search_trending')
      .select('query_normalized, search_count, last_searched_at')
      .gte('last_searched_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('search_count', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      // No real trending data yet — return empty (don't show fake data)
      return NextResponse.json({
        trending: [],
        source: 'default',
      });
    }

    return NextResponse.json({
      trending: data.map((item: any) => ({
        query: item.query_normalized,
        searches: item.search_count,
      })),
      source: 'live',
    });
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json({
      trending: [],
      source: 'error',
    });
  }
}
