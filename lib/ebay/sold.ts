// eBay Sold Listings Scraper
// Fetches real sold/completed listing data from eBay's search pages
// This gives us actual sold counts and prices instead of estimates

// Validate that eBay returned a real search results page
// (not a bot detection, CAPTCHA, or error page)
function isValidSearchPage(html: string): boolean {
  return (
    html.includes('srp-controls__count-heading') ||
    html.includes('srp-results') ||
    html.includes('srp-river-results') ||
    html.includes('s-card__price') ||
    html.includes('s-item__price') ||
    html.includes('No exact matches found') ||
    html.includes('srp-save-null-search')
  );
}

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
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}&_sacat=0&LH_Sold=1&LH_Complete=1&_ipg=240&rt=nc`;

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

    // Validate we got a real eBay search page (not bot detection/CAPTCHA)
    if (!isValidSearchPage(html)) {
      console.log(`[SellChecker] eBay returned non-search page for "${query}" â likely bot detection. HTML length: ${html.length}`);
      return null; // Scraper failed â caller should fall back to estimation
    }

    // Parse the total results count
    const soldCount = parseTotalResults(html);

    // Parse individual sold prices from the listing cards
    const soldPrices = parseSoldPrices(html);

    if (soldCount === 0 && soldPrices.length === 0) {
      return null;
    }

    // Calculate price stats
    const sortedPrices = [...soldPrices].sort((a, b) => a - b);

    return {
      soldCount: soldCount || soldPrices.length,
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

// Parse total results count from eBay search page HTML
function parseTotalResults(html: string): number {
  // eBay shows total results in several formats:
  // "1,234 results" or "1,234+ results" in the results heading
  // Also in: <h1 class="srp-controls__count-heading">
  //   <span class="BOLD">1,234</span> results

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
  const dataMatch = html.match(/totalCount['"]\s*:\s*['"]([\d]+)['"]/);
  if (dataMatch) {
    return parseInt(dataMatch[1], 10);
  }

  return 0;
}

// Parse individual sold prices from listing cards
function parseSoldPrices(html: string): number[] {
  const prices: number[] = [];

  // eBay sold listings show prices in several formats:
  // <span class="s-item__price">$XX.XX</span>
  // Sometimes with strikethrough original price and sold price

  // Pattern 1: s-item__price spans with dollar amounts
  const priceRegex = /<span[^>]*class="[^"]*s-item__price[^"]*"[^>]*>\s*\$?([\d,]+\.?\d*)\s*<\/span>/gi;
  let match;

  while ((match = priceRegex.exec(html)) !== null) {
    const price = parseFloat(match[1].replace(/,/g, ''));
    // Filter out unreasonable prices (shipping costs, etc.)
    if (!isNaN(price) && price > 0 && price < 100000) {
      prices.push(price);
    }
  }

  // Pattern 2: Look for prices in the item card structure
  // eBay sometimes uses data attributes or different class names
  if (prices.length === 0) {
    const altPriceRegex = /\$\s*([\d,]+\.?\d{0,2})/g;
    const seenPrices = new Set<string>();

    while ((match = altPriceRegex.exec(html)) !== null) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);
      // Only include unique prices that look like item prices
      if (!isNaN(price) && price >= 1 && price < 100000 && !seenPrices.has(priceStr)) {
        seenPrices.add(priceStr);
        prices.push(price);
      }
    }
  }

  // Remove obvious outliers (shipping costs often show as small values)
  // Keep prices within reasonable IQR range
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
