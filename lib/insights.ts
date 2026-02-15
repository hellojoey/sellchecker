// Smart Insights — Rule-based contextual tips for Pro users
// No LLM needed: generates 2-3 relevant insights per search from existing data

import type { SellThroughResult } from './sellthrough';

export interface Insight {
  text: string;
  emoji: string;
  priority: number; // lower = higher priority (shown first)
}

// All insight rules — each checks conditions and returns an Insight or null
const INSIGHT_RULES: Array<(r: SellThroughResult) => Insight | null> = [
  // Quick seller
  (r) => {
    if (r.sellThroughRate > 60 && r.avgDaysToSell < 10) {
      return {
        text: "This moves fast — don't overthink it, just grab it.",
        emoji: '🔥',
        priority: 1,
      };
    }
    return null;
  },

  // High value item
  (r) => {
    if (r.medianSoldPrice > 80) {
      return {
        text: 'Sells at a solid price point — worth buying even with a longer wait.',
        emoji: '💎',
        priority: 2,
      };
    }
    return null;
  },

  // Low competition
  (r) => {
    if (r.activeCount < 20) {
      return {
        text: `Only ${r.activeCount} listed right now — you could set your own price.`,
        emoji: '🎯',
        priority: 2,
      };
    }
    return null;
  },

  // Saturated market
  (r) => {
    if (r.activeCount > 500) {
      return {
        text: 'Lots of competition — price below median to sell faster.',
        emoji: '⚡',
        priority: 3,
      };
    }
    return null;
  },

  // Huge price spread
  (r) => {
    if (r.priceHigh > 0 && r.priceLow > 0 && r.priceHigh / r.priceLow > 4) {
      return {
        text: 'Huge price range — condition and completeness matter a lot here.',
        emoji: '📏',
        priority: 4,
      };
    }
    return null;
  },

  // Good margin potential
  (r) => {
    // Typical thrift price $3-8, so median > $25 is already strong margin
    if (r.medianSoldPrice > 25 && r.sellThroughRate > 30) {
      return {
        text: 'Strong margin potential even after fees and shipping.',
        emoji: '💰',
        priority: 3,
      };
    }
    return null;
  },

  // Slow mover warning
  (r) => {
    if (r.avgDaysToSell > 30) {
      return {
        text: "This is a slow burner — only buy if you can wait 30+ days to sell.",
        emoji: '🐢',
        priority: 5,
      };
    }
    return null;
  },

  // Shipping concern for low-price items
  (r) => {
    if (r.medianSoldPrice < 30 && r.medianSoldPrice > 0) {
      return {
        text: 'At this price point, shipping costs could eat your margins.',
        emoji: '📦',
        priority: 4,
      };
    }
    return null;
  },

  // Dying demand
  (r) => {
    if (r.sellThroughRate < 15) {
      return {
        text: 'Very few selling vs. listed — this category is oversaturated.',
        emoji: '📉',
        priority: 1,
      };
    }
    return null;
  },

  // Price sweet spot
  (r) => {
    if (r.sellThroughRate >= 40 && r.sellThroughRate < 70) {
      return {
        text: `Most sales happen around $${r.medianSoldPrice.toFixed(0)} — price there for fastest turnover.`,
        emoji: '🎯',
        priority: 3,
      };
    }
    return null;
  },

  // High volume seller
  (r) => {
    if (r.soldCount90d > 500) {
      return {
        text: `${r.soldCount90d.toLocaleString()} sold in 90 days — high volume, reliable demand.`,
        emoji: '📈',
        priority: 2,
      };
    }
    return null;
  },

  // Low sell count warning
  (r) => {
    if (r.soldCount90d < 10 && r.soldCount90d > 0) {
      return {
        text: "Very few recent sales — could be niche or declining demand.",
        emoji: '⚠️',
        priority: 5,
      };
    }
    return null;
  },
];

// Generate insights for a search result — returns 2-3 most relevant
export function generateInsights(result: SellThroughResult): Insight[] {
  const allInsights: Insight[] = [];

  for (const rule of INSIGHT_RULES) {
    const insight = rule(result);
    if (insight) {
      allInsights.push(insight);
    }
  }

  // Sort by priority (lower number = higher priority)
  allInsights.sort((a, b) => a.priority - b.priority);

  // Return top 3
  return allInsights.slice(0, 3);
}
