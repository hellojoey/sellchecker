// ═══════════════════════════════════════════════
// SellChecker Core Engine — Sell-Through Calculator
// ═══════════════════════════════════════════════

export type Verdict = 'BUY' | 'RISKY' | 'PASS';

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
}

export function calculateSellThrough(sold: number, active: number): number {
  if (sold + active === 0) return 0;
  return Math.round((sold / (sold + active)) * 1000) / 10; // one decimal
}

export function getVerdict(rate: number): Verdict {
  if (rate >= 50) return 'BUY';
  if (rate >= 20) return 'RISKY';
  return 'PASS';
}

export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'BUY': return '#22c55e';
    case 'RISKY': return '#f59e0b';
    case 'PASS': return '#ef4444';
  }
}

export function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'BUY': return 'Strong demand — BUY';
    case 'RISKY': return 'Moderate demand — price carefully';
    case 'PASS': return 'Low demand — skip it';
  }
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
