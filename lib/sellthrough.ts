// ═══════════════════════════════════════════════
// SellChecker Core Engine — Sell-Through Calculator
// ═══════════════════════════════════════════════

export type Verdict = 'BUY' | 'MAYBE' | 'PASS';

export interface TopListing {
  title: string;
  price: number;
  imageUrl?: string;
  condition: string;
  itemUrl: string;
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
}

export function calculateSellThrough(sold: number, active: number): number {
  if (sold + active === 0) return 0;
  return Math.round((sold / (sold + active)) * 1000) / 10; // one decimal
}

export function getVerdict(rate: number): Verdict {
  if (rate >= 50) return 'BUY';
  if (rate >= 20) return 'MAYBE';
  return 'PASS';
}

export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'BUY': return '#22c55e';
    case 'MAYBE': return '#eab308';
    case 'PASS': return '#dc2626';
  }
}

export function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'BUY': return 'Strong demand — BUY';
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
