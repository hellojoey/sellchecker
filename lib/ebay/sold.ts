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

// Fetch sold listings data from eBay search
export async function fetchSoldListings(query: string): Promise<SoldListingsResult | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    // eBay sold listings URL with both LH_Sold and LH_Complete filters
    // _ipg=240 = max items per page for data richness
    // _in_kw=4 = "All words, any order" — prevents eBay from showing
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
      console.error(`eBay sold listings fetch failed: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // IMPORTANT: Check if eBay returned "No exact matches found"
    // When this happens, eBay shows "Results matching fewer words" which are
    // loosely related items — NOT actual matches for our query.
    // We must return null to avoid counting irrelevant fuzzy-match results.
    if (hasNoExactMatches(html)) {
      console.log(`[SellChecker] No exact sold matches for "${query}" — eBay showed fuzzy results only`);
      return null;
    }

    // Parse the total results count
    const soldCount = parseTotalResults(html);

    // If eBay explicitly says 0 results, return null
    // (even if there are fuzzy-match items on the page)
    if (soldCount === 0) {
      console.log(`[SellChecker] 0 sold results for "${query}"`);
      return null;
    }

    // Parse individual sold prices from the listing cards
    const soldPrices = parseSoldPrices(html);

    // Calculate price stats
    const sortedPrices = [...soldPrices].sort((a, b) => a - b);

    return {
      // Use the parsed total count (NOT soldPrices.length as fallback)
      soldCount,
      soldPrices,
      avgSoldPrice: soldPrices.length > 0
        ? Math.round(soldPrices.reduce((a, b) => a + b, 0) / soldPrices.length * 100) / 100
        : 0,
      medianSoldPrice: soldPrices.length > 0
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
    console.error('Failed to fetch sold listings:', error);
    return null;
  }
}

// Detect eBay's "No exact matches found" page
// eBay shows this when 0 exact results exist, then displays loosely related items
function hasNoExactMatches(html: string): boolean {
  // Check for the explicit "No exact matches found" heading
  if (/No exact matches found/i.test(html)) {
    return true;
  }
  // Check for "Results matching fewer words" notice
  if (/Results matching fewer words/i.test(html)) {
    return true;
  }
  // Check for srp-save-null-search class (eBay's null search component)
  if (/srp-save-null-search/i.test(html)) {
    return true;
  }
  return false;
}

// Parse total results count from eBay search page HTML
function parseTotalResults(html: string): number {
  // Try the BOLD span pattern first (most reliable)
  const boldMatch = html.match(/<span[^>]*class="[^"]*BOLD[^"]*"[^>]*>([\d,]+)\+?<\/span>\s*results/i);
  if (boldMatch) {
    return parseInt(boldMatch[1].replace(/,/g, ''), 10);
  }

  // Try srp-controls__count-heading pattern
  const headingMatch = html.match(/srp-controls__count-heading[^>]*>.*?([\d,]+)\+?\s*results/is);
  if (headingMatch) {
    return parseInt(headingMatch[1].replace(/,/g, ''), 10);
  }

  // Try generic "X results for" pattern
  const genericMatch = html.match(/([\d,]+)\+?\s*results?\s*(for|found)/i);
  if (genericMatch) {
    return parseInt(genericMatch[1].replace(/,/g, ''), 10);
  }

  // Try data attribute pattern
  const dataMatch = html.match(/totalCount['"']\s*:\s*['"](\d+)['"]/);
  if (dataMatch) {
    return parseInt(dataMatch[1], 10);
  }

  return 0;
}

// Parse individual sold prices from listing cards
function parseSoldPrices(html: string): number[] {
  const prices: number[] = [];

  // Pattern 1: s-item__price spans with dollar amounts
  const priceRegex = /<span[^>]*class="[^"]*s-item__price[^"]*"[^>]*>\s*\$?([\d,]+\.?\d*)\s*<\/span>/gi;
  let match;
  while ((match = priceRegex.exec(html)) !== null) {
    const price = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(price) && price > 0 && price < 100000) {
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
      if (!isNaN(price) && price >= 1 && price < 100000 && !seenPrices.has(priceStr)) {
        seenPrices.add(priceStr);
        prices.push(price);
      }
    }
  }

  // Remove obvious outliers — keep within 10th-90th percentile
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
