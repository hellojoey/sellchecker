// eBay Sold Listings Scraper — Fetches real sold data from eBay's public search pages
import * as cheerio from 'cheerio';

export type ParseStrategy = 'heading_bold' | 'heading_span' | 'heading_text' | 'alt_class' | 'dom_count' | 'zero_detected' | 'none';

export interface ScrapedSoldData {
  soldCount: number;
  soldPrices: number[];
  soldDates: string[];
  success: boolean;
  parseStrategy: ParseStrategy;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Scrape eBay's public sold listings page to get real sold count, prices, and dates.
 * Falls back gracefully — never throws.
 */
export async function scrapeEbaySoldData(query: string, condition?: string): Promise<ScrapedSoldData> {
  const startTime = Date.now();
  const empty: ScrapedSoldData = { soldCount: 0, soldPrices: [], soldDates: [], success: false, parseStrategy: 'none' };

  try {
    const encodedQuery = encodeURIComponent(query);
    // LH_ItemCondition: 1000 = New, 3000 = Used
    let conditionParam = '';
    if (condition === 'NEW') {
      conditionParam = '&LH_ItemCondition=1000';
    } else if (condition === 'USED') {
      conditionParam = '&LH_ItemCondition=3000';
    }
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}&LH_Sold=1&LH_Complete=1&_ipg=240&rt=nc${conditionParam}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(`[SellChecker Scraper] HTTP ${response.status} for query="${query}"`);
      return empty;
    }

    const html = await response.text();

    // Detect CAPTCHA or bot detection
    if (html.includes('captcha') || html.includes('robot') || html.includes('verify you are a human')) {
      console.warn(`[SellChecker Scraper] CAPTCHA detected for query="${query}"`);
      return empty;
    }

    const $ = cheerio.load(html);

    // --- Extract total sold count ---
    const soldCountResult = extractSoldCount($);
    const soldCount = soldCountResult.count;

    // --- Extract individual sold prices and dates ---
    const soldPrices: number[] = [];
    const soldDates: string[] = [];

    // eBay uses s-card containers (newer layout) or li.s-item (older layout)
    // Try s-card first (current eBay layout as of Feb 2026)
    const cards = $('.s-card');
    if (cards.length > 0) {
      cards.each((_, el) => {
        // Price: .s-card__price class
        const priceText = $(el).find('.s-card__price').first().text();
        const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1].replace(/,/g, ''));
          if (!isNaN(price) && price > 0 && price < 100000) {
            soldPrices.push(price);
          }
        }

        // Sold date: .s-card__caption contains "Sold  Feb 14, 2026"
        const dateText = $(el).find('.s-card__caption').first().text();
        if (dateText) {
          soldDates.push(dateText.trim());
        }
      });
    } else {
      // Fallback: older li.s-item layout
      $('li.s-item').each((_, el) => {
        const priceText = $(el).find('.s-item__price').first().text();
        const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1].replace(/,/g, ''));
          if (!isNaN(price) && price > 0 && price < 100000) {
            soldPrices.push(price);
          }
        }

        const dateText = $(el).find('.s-item__endedDate, .s-item__ended-date, .POSITIVE').first().text();
        if (dateText) {
          soldDates.push(dateText.trim());
        }
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[SellChecker Scraper] query="${query}" soldCount=${soldCount} pricesFound=${soldPrices.length} datesFound=${soldDates.length} duration=${duration}ms`);

    return {
      soldCount,
      soldPrices,
      soldDates,
      success: soldCount > 0,
      parseStrategy: soldCountResult.strategy,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.warn(`[SellChecker Scraper] FAILED query="${query}" error="${error.message}" duration=${duration}ms — falling back to estimation`);
    return empty;
  }
}

interface SoldCountResult {
  count: number;
  strategy: ParseStrategy;
}

/**
 * Detect if eBay's page indicates zero results.
 * eBay shows "0 results for..." or "No exact matches found" on empty searches.
 */
function isZeroResultsPage($: cheerio.CheerioAPI): boolean {
  // Check the heading for "0 results"
  const headingText = $('h1.srp-controls__count-heading').first().text().trim();
  if (/^0\s+results?\b/i.test(headingText)) return true;

  // Check the bold count for explicit "0"
  const boldCount = $('h1.srp-controls__count-heading .BOLD').first().text().trim();
  if (boldCount && parseInt(boldCount.replace(/[,.\s]/g, ''), 10) === 0) return true;

  // Check for "No exact matches found" messaging
  const bodyText = $('body').text();
  if (bodyText.includes('No exact matches found')) return true;
  if (bodyText.includes('0 results for')) return true;

  return false;
}

/**
 * Extract the total sold count from the search results page.
 * Uses multiple fallback selectors in case eBay changes class names.
 * Returns both the count and the strategy used so callers can assess confidence.
 */
function extractSoldCount($: cheerio.CheerioAPI): SoldCountResult {
  // First: detect zero-results pages before any counting
  if (isZeroResultsPage($)) {
    return { count: 0, strategy: 'zero_detected' };
  }

  // Strategy 1: Bold count in heading (most common)
  const boldCount = $('h1.srp-controls__count-heading .BOLD').first().text();
  if (boldCount) {
    const parsed = parseInt(boldCount.replace(/[,.\s]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) return { count: parsed, strategy: 'heading_bold' };
  }

  // Strategy 2: First span in the heading
  const headingSpan = $('h1.srp-controls__count-heading span').first().text();
  if (headingSpan) {
    const parsed = parseInt(headingSpan.replace(/[,.\s]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) return { count: parsed, strategy: 'heading_span' };
  }

  // Strategy 3: Parse number from full heading text
  const headingText = $('h1.srp-controls__count-heading').first().text();
  if (headingText) {
    const match = headingText.match(/([\d,]+)\s*(?:\+\s*)?results?/i);
    if (match) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) return { count: parsed, strategy: 'heading_text' };
    }
  }

  // Strategy 4: Alternate class name
  const altCount = $('.srp-controls__result-count').first().text();
  if (altCount) {
    const match = altCount.match(/([\d,]+)/);
    if (match) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) return { count: parsed, strategy: 'alt_class' };
    }
  }

  // Strategy 5: Count card elements — ONLY items with a price (not ads/suggestions)
  // Cap at 240 (the _ipg page limit) as a sanity check
  const realCards = $('.s-card').filter((_, el) => {
    return $(el).find('.s-card__price').length > 0;
  });
  const cardCount = Math.min(realCards.length, 240);
  if (cardCount > 0) return { count: cardCount, strategy: 'dom_count' };

  // Strategy 6: Older li.s-item layout (filter to items with prices)
  const realItems = $('li.s-item').filter((_, el) => {
    return $(el).find('.s-item__price').length > 0;
  });
  const itemCount = realItems.length;
  if (itemCount > 1) return { count: Math.min(Math.max(itemCount - 1, 0), 240), strategy: 'dom_count' };

  return { count: 0, strategy: 'none' };
}

/**
 * Calculate average days-to-sell from scraped sold dates.
 * Parses dates like "Sold Feb 10, 2026" or "Feb 10, 2026".
 */
export function calculateAvgDaysToSell(soldDates: string[]): number {
  if (soldDates.length === 0) return 0;

  const now = Date.now();
  const daysDiffs: number[] = [];

  for (const dateStr of soldDates) {
    // Strip "Sold" prefix and whitespace
    const cleaned = dateStr.replace(/^Sold\s*/i, '').trim();
    const parsed = Date.parse(cleaned);
    if (!isNaN(parsed)) {
      const daysAgo = Math.floor((now - parsed) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo <= 90) {
        daysDiffs.push(daysAgo);
      }
    }
  }

  if (daysDiffs.length === 0) return 0;
  return Math.round(daysDiffs.reduce((a, b) => a + b, 0) / daysDiffs.length);
}
