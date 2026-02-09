import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Browser-side Supabase client for unauthenticated operations.
 * Used for search cache lookups, public queries.
 */
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client factory.
 * TODO: Implement proper SSR client with cookie handling using @supabase/ssr
 */
export function createSupabaseServer() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not configured");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Search cache operations
 * TODO: Implement caching layer for search results
 */
export async function getCachedSearch(query: string) {
  // TODO: Query supabase.search_cache table
  // SELECT * FROM search_cache WHERE query = ? AND cached_at > NOW() - INTERVAL 7 DAYS
  return null;
}

export async function setCachedSearch(
  query: string,
  result: Record<string, any>
) {
  // TODO: Insert or update search_cache
  // INSERT INTO search_cache (query, result, cached_at) VALUES (?, ?, NOW())
  return null;
}

/**
 * Auth operations
 */
export async function getCurrentUser() {
  // TODO: Get current user session from SSR context
  return null;
}
