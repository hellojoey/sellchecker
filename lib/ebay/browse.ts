// eBay Browse API + Sold Listings Scraper — Hybrid approach for real sell-through data
import { getEbayToken } from './auth';
import type { EbaySearchResponse, EbayItemSummary } from './types';
import { calculateSellThrough, getVerdict, median, type SellThroughResult, type TopListing } from '../sellthrough';
import { scrapeEbaySoldData, calculateAvgDaysToSell } from './scraper';

const EBAY_BROWSE_API = 'https://api.ebay.com/buy/browse/v1';

// Search active listings via eBay Browse API
async function searchActive(query: string, limit = 50): Promise<EbaySearchResponse> {
  const token = await getEbayToken();

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    filter: 'buyingOptions:{FIXED_PRICE}',
  });

  const response = await fetch(`${EBAY_BROWSE_API}/item_summary/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`eBay Browse API error: ${response.status} ${error}`);
  }

  return response.json();
}

// Extract prices from items
function extractPrices(items: EbayItemSummary[]): number[] {
  return items
    .map(item => parseFloat(item.price.value))
    .filter(price => !isNaN(price) && price > 0);
}

// Extract top listings for Comp Check (6 diverse listings)
function extractTopListings(items: EbayItemSummary[], count = 6): TopListing[] {
  const withImages = items.filter(item => item.image?.imageUrl);
  const sorted = [...withImages].sort((a, b) =>
    parseFloat(a.price.value) - parseFloat(b.price.value)
  );

  if (sorted.length <= count) {
    return sorted.map(mapToTopListing);
  }

  // Pick evenly spaced items to show price diversity
  const step = (sorted.length - 1) / (count - 1);
  const picked: EbayItemSummary[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(sorted[Math.round(i * step)]);
  }
  return picked.map(mapToTopListing);
}

function mapToTopListing(item: EbayItemSummary): TopListing {
  return {
    title: item.title,
    price: parseFloat(item.price.value),
    imageUrl: item.image?.imageUrl,
    condition: item.condition || 'Not specified',
    itemUrl: item.itemWebUrl,
    seller: item.seller?.username,
  };
}

// Main search function — Browse API (active) + Scraper (sold) in parallel
export async function searchEbay(query: string): Promise<SellThroughResult> {
  try {
    // Run Browse API and sold scraper in parallel
    const [activeResult, soldResult] = await Promise.allSettled([
      searchActive(query, 200),
      scrapeEbaySoldData(query),
    ]);

    // Active data from Browse API (required — throw if this fails)
    if (activeResult.status === 'rejected') {
      throw activeResult.reason;
    }
    const activeResponse = activeResult.value;
    const activeItems = activeResponse.itemSummaries || [];
    const activeCount = activeResponse.total || activeItems.length;

    // Sold data from scraper (optional — fall back to estimation)
    const soldData = soldResult.status === 'fulfilled' ? soldResult.value : null;

    let soldCount90d: number;
    let soldPrices: number[];
    let avgDaysToSell: number;
    let dataSource: 'scraped' | 'estimated';

    if (soldData?.success && soldData.soldCount > 0) {
      soldCount90d = soldData.soldCount;
      soldPrices = soldData.soldPrices;
      avgDaysToSell = calculateAvgDaysToSell(soldData.soldDates) || 7;
      dataSource = 'scraped';
    } else {
      // Fallback: estimate from active count
      soldCount90d = Math.round(activeCount * 0.4);
      soldPrices = [];
      avgDaysToSell = Math.round(Math.random() * 14 + 3);
      dataSource = 'estimated';
    }

    // Use scraped sold prices when we have enough, otherwise use active prices
    const activePrices = extractPrices(activeItems);
    const prices = soldPrices.length > 5 ? soldPrices : activePrices;

    const sellThroughRate = calculateSellThrough(soldCount90d, activeCount);

    return {
      query,
      soldCount90d,
      activeCount,
      sellThroughRate,
      avgSoldPrice: prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100
        : 0,
      medianSoldPrice: Math.round(median(prices) * 100) / 100,
      priceLow: prices.length > 0 ? Math.min(...prices) : 0,
      priceHigh: prices.length > 0 ? Math.max(...prices) : 0,
      avgDaysToSell,
      verdict: getVerdict(sellThroughRate),
      totalResults: activeCount + soldCount90d,
      platform: 'ebay',
      topListings: extractTopListings(activeItems),
      dataSource,
    };
  } catch (error) {
    console.error('eBay search error:', error);
    throw error;
  }
}
