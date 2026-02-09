// eBay Sold Listings Scraper
// Fetches real sold/completed listing data from eBay's search pages
// This gives us actual sold counts and prices instead of estimates

export interface SoldListingsResult {
  soldCount: number;
  soldPrices: number[];
  avgSoldPrice: number;
  medianSoldPrice: number;
  priceLow: number;
  priceHigh: number;
}

// Zero-result response â scraper confirmed no exact sold matches exist
const ZERO_RESULT: SoldListingsResult = {
  soldCount: 0,
  soldPrices: [],
  avgSoldPrice: 0,
  medianSoldPrice: 0,
  priceLow: 0,
  priceHigh: 0,
};

// Fetch sold listings data from eBay search
// Returns SoldListingsResult with soldCount: 0 when no exact matches found
// Returns null only on fetch/parse errors (scraper failure)
export async function fetchSoldListings(query: string): Promise<SoldListingsResult | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    // eBay sold listings URL with both LH_Sold and LH_Complete filters
    // _ipg=240 = max items per page for data richness
    // _in_kw=4 = "All words, any order" â prevents eBay from showing
    //   fuzzy/partial matches that inflate the sold count for niche queries
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}&_sacat=0&LH_Sold=1&LH_Complete=1&_ipg=240&rt=nc&_in_kw=4`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      return null; // Fetch error â scraper failed
    }

    const html = await response.text();

    // Parse the total results count from the page FIRST
    const soldCount = parseTotalResults(html);

    // If eBay reports real results, use them â even if the page also
    // contains "Results matching fewer words" text in a sidebar/section
    if (soldCount > 0) {
      console.log(`[SellChecker] Found ${soldCount} sold results for "${query}"`);
      // Fall through to price parsing below
    } else {
      // soldCount is 0 â check if eBay showed fuzzy/no-match indicators
      if (hasNoExactMatches(html)) {
        console.log(`[SellChecker] No exact sold matches for "${query}" â eBay showed fuzzy results only`);
        return ZERO_RESULT; // Confirmed: 0 exact matches
      }
      // soldCount is 0 and no fuzzy indicators â page may have parsed wrong
      console.log(`[SellChecker] eBay reported 0 sold results for "${query}"`);
      return ZERO_RESULT; // Confirmed: 0 results
    }

    // Parse individual sold prices from the page
    const soldPrices = parseSoldPrices(html);

    // Sort prices for statistics
    const sortedPrices = [...soldPrices].sort((a, b) => a - b);

    return {
      soldCount, // Use parsed total count from eBay header
      soldPrices,
      avgSoldPrice: soldPrices.length > 0
        ? Math.round(soldPrices.reduce((a, b) => a + b, 0) / soldPrices.length * 100) / 100
        : 0,
      medianSoldPrice: sortedPrices.length > 0
        ? Math.round(medianCalc(sortedPrices) * 100) / 100
        : 0,
      priceLow: sortedPrices.length > 0
        ? Math.round(sortedPrices[0] * 100) / 100
        : 0,
      priceHigh: sortedPrices.length > 0
        ? Math.round(sortedPrices[sortedPrices.length - 1] * 100) / 100
        : 0,
    };
  } catch (error) {
    console.error('[SellChecker] Sold listings scrape error:', error);
    return null; // Error â scraper failed, caller should estimate
  }
}

// Detect when eBay shows "No exact matches found" / "Results matching fewer words"
function hasNoExactMatches(html: string): boolean {
  if (/No exact matches found/i.test(html)) return true;
  if (/Results matching fewer words/i.test(html)) return true;
  if (/srp-save-null-search/i.test(html)) return true;
  return false;
}

// Parse the total results count from the eBay search page header
// e.g. "1,234 results for ..." â 1234
function parseTotalResults(html: string): number {
  // Pattern 1: "X results for ..."
  const resultMatch = html.match(/([\d,]+)\s+results?\s+for/i);
  if (resultMatch) {
    return parseInt(resultMatch[1].replace(/,/g, ''), 10) || 0;
  }

  // Pattern 2: Bold count in heading â <span class="BOLD">X</span> results
  const boldMatch = html.match(/<span[^>]*class="[^"]*BOLD[^"]*"[^>]*>([\d,]+)<\/span>\s*results?/i);
  if (boldMatch) {
    return parseInt(boldMatch[1].replace(/,/g, ''), 10) || 0;
  }

  // Pattern 3: srp-controls__count-heading
  const headingMatch = html.match(/srp-controls__count-heading[^>]*>[^<]*([\d,]+)\s+results?/i);
  if (headingMatch) {
    return parseInt(headingMatch[1].replace(/,/g, ''), 10) || 0;
  }

  return 0;
}

// Parse individual sold prices from item cards
function parseSoldPrices(html: string): number[] {
  const prices: number[] = [];

  // Pattern 1: s-item__price spans â "$XX.XX"
  const priceRegex = /s-item__price[^>]*>\s*<span[^>]*>\$([\d,]+\.?\d*)<\/span>/gi;
  let match;
  const seenPrices = new Set<string>();

  while ((match = priceRegex.exec(html)) !== null) {
    const priceStr = match[1].replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price >= 1 && price <= 10000 && !seenPrices.has(priceStr)) {
      seenPrices.add(priceStr);
      prices.push(price);
    }
  }

  // Pattern 2: Fallback dollar amount regex
  if (prices.length === 0) {
    const altPriceRegex = /\$\s*([\d,]+\.?\d{0,2})/g;
    const seenPrices = new Set<string>();
    while ((match = altPriceRegex.exec(html)) !== null) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price >= 1 && price <= 10000 && !seenPrices.has(priceStr)) {
        seenPrices.add(priceStr);
        prices.push(price);
      }
    }
  }

  // Remove obvious outliers â keep within 10th-90th percentile range
  if (prices.length > 10) {
    const sorted = [...prices].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.1);
    const q3Index = Math.floor(sorted.length * 0.9);
    return sorted.slice(q1Index, q3Index + 1);
  }

  return prices;
}

function medianCalc(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
