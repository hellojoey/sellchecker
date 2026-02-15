// Search cache — 24-hour TTL, MD5 hash key
import crypto from 'crypto';

export function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function hashQuery(query: string, condition?: string): string {
  const normalized = normalizeQuery(query);
  const key = condition ? `${normalized}::${condition}` : normalized;
  return crypto.createHash('md5').update(key).digest('hex');
}

// Check cache in Supabase (called from API route)
export async function getCachedResult(
  supabase: any,
  queryHash: string
): Promise<any | null> {
  const { data, error } = await supabase
    .from('search_cache')
    .select('*')
    .eq('query_hash', queryHash)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data;
}

// Flush all cached results (admin operation)
export async function flushAllCache(supabase: any): Promise<number> {
  const { data, error, count } = await supabase
    .from('search_cache')
    .delete()
    .neq('query_hash', '')  // match all rows
    .select('query_hash', { count: 'exact', head: true });

  if (error) {
    console.error('Cache flush error:', error);
    throw error;
  }
  return count || 0;
}

// Store result in cache
export async function setCachedResult(
  supabase: any,
  queryHash: string,
  query: string,
  result: any
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from('search_cache')
    .upsert({
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
      expires_at: expiresAt,
    });
}
