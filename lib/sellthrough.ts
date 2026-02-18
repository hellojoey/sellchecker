// ═══════════════════════════════════════════════
// SellChecker Core Engine — Sell-Through Calculator
// ═══════════════════════════════════════════════

export type Verdict = 'PASS' | 'MAYBE' | 'BUY' | 'STRONG_BUY' | 'S_TIER';

export interface TopListing {
  title: string;
  price: number;
  imageUrl?: string;
  condition: string;
  itemUrl: string;
  itemId?: string;
  seller?: string;
}

export interface SellThroughResult {
  query: string;
  soldCount90d: number;
  activeCount: number;
  sellThroughRate: number;
  avgSoldPrice: number;
  medianSoldPrice: number;
  priceLow: number;
  priceHigh: number;
  avgDaysToSell: number;
  verdict: Verdict;
  totalResults: number;
  platform: string;
  cachedAt?: string;
  topListings?: TopListing[];
  dataSource?: 'scraped' | 'estimated';
  category?: string;
  categoryBenchmark?: number;
}

export function calculateSellThrough(sold: number, active: number): number {
  if (sold + active === 0) return 0;
  return Math.round((sold / (sold + active)) * 1000) / 10; // one decimal
}

export function getVerdict(rate: number): Verdict {
  if (rate >= 100) return 'S_TIER';
  if (rate >= 75) return 'STRONG_BUY';
  if (rate >= 50) return 'BUY';
  if (rate >= 25) return 'MAYBE';
  return 'PASS';
}

export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'S_TIER': return '#7c3aed';
    case 'STRONG_BUY': return '#16a34a';
    case 'BUY': return '#22c55e';
    case 'MAYBE': return '#eab308';
    case 'PASS': return '#dc2626';
  }
}

export function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'S_TIER': return 'S-Tier demand — sell it yesterday';
    case 'STRONG_BUY': return 'Strong demand — BUY confidently';
    case 'BUY': return 'Good demand — BUY';
    case 'MAYBE': return 'Maybe — price carefully';
    case 'PASS': return 'Low demand — skip it';
  }
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Deterministic price-to-speed estimate (replaces random brackets)
export function estimateDaysToSell(
  price: number,
  medianPrice: number,
  sellThroughRate: number
): number {
  if (medianPrice <= 0) return 30;
  const priceRatio = price / medianPrice;
  const baseDays = Math.max(2, Math.round(30 - sellThroughRate * 0.4));

  // Piecewise multiplier curve
  let multiplier: number;
  if (priceRatio <= 0.5) {
    multiplier = 0.4; // Deep discount — very fast
  } else if (priceRatio <= 0.8) {
    multiplier = 0.4 + (priceRatio - 0.5) * 2; // 0.4 → 1.0
  } else if (priceRatio <= 1.2) {
    multiplier = 1.0; // Near median — baseline speed
  } else if (priceRatio <= 1.5) {
    multiplier = 1.0 + (priceRatio - 1.2) * 3.33; // 1.0 → 2.0
  } else if (priceRatio <= 2.0) {
    multiplier = 2.0 + (priceRatio - 1.5) * 4; // 2.0 → 4.0
  } else {
    multiplier = 4.0 + (priceRatio - 2.0) * 2; // Keeps climbing
  }

  return Math.max(1, Math.min(60, Math.round(baseDays * multiplier)));
}

// Returns a range of estimated days (at 70% and 140% of median) for display
export function estimateDaysToSellRange(
  medianPrice: number,
  sellThroughRate: number
): { low: number; high: number } {
  const atMedian = estimateDaysToSell(medianPrice, medianPrice, sellThroughRate);
  const atLow = estimateDaysToSell(medianPrice * 0.7, medianPrice, sellThroughRate);
  const atHigh = estimateDaysToSell(medianPrice * 1.4, medianPrice, sellThroughRate);
  return {
    low: Math.min(atMedian, atLow),
    high: Math.max(atMedian, atHigh),
  };
}

// ═══════════════════════════════════════════════
// Category Benchmarks — Average STR by eBay category
// ═══════════════════════════════════════════════

// Map eBay category names (lowercased) to benchmark STR percentages.
// These are approximate industry averages for reseller reference.
const CATEGORY_BENCHMARKS: Record<string, number> = {
  'clothing, shoes & accessories': 35,
  'shoes': 40,
  'men\'s shoes': 40,
  'women\'s shoes': 38,
  'men\'s clothing': 32,
  'women\'s clothing': 30,
  'electronics': 45,
  'cell phones & accessories': 50,
  'computers/tablets & networking': 42,
  'video games & consoles': 48,
  'collectibles': 55,
  'sports mem, cards & fan shop': 50,
  'toys & hobbies': 42,
  'home & garden': 30,
  'kitchen, dining & bar': 35,
  'sporting goods': 38,
  'jewelry & watches': 28,
  'books': 25,
  'music': 30,
  'movies & tv': 28,
  'health & beauty': 35,
  'baby': 32,
  'pet supplies': 30,
  'crafts': 25,
  'musical instruments & gear': 40,
  'cameras & photo': 45,
  'business & industrial': 35,
  'everything else': 30,
};

/**
 * Look up the benchmark sell-through rate for a given eBay category name.
 * Returns undefined if no match found.
 */
export function getCategoryBenchmark(categoryName: string): number | undefined {
  const lower = categoryName.toLowerCase();

  // Direct match
  if (CATEGORY_BENCHMARKS[lower] !== undefined) {
    return CATEGORY_BENCHMARKS[lower];
  }

  // Partial match: find the first benchmark key that's contained in the category name
  for (const [key, value] of Object.entries(CATEGORY_BENCHMARKS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return value;
    }
  }

  return undefined;
}

/**
 * Get the category insight text comparing a result's STR to its category benchmark.
 * Returns null if no category or benchmark available.
 */
export function getCategoryInsight(
  sellThroughRate: number,
  category?: string,
  benchmark?: number
): string | null {
  if (!category || benchmark === undefined) return null;

  const diff = sellThroughRate - benchmark;
  const absDiff = Math.abs(diff);

  if (absDiff <= 3) {
    return `About average for ${category}`;
  } else if (diff > 0) {
    return `${Math.round(absDiff)}% above average for ${category}`;
  } else {
    return `${Math.round(absDiff)}% below average for ${category}`;
  }
}
