/**
 * eBay API client for SellChecker
 * Handles OAuth 2.0 authentication and Browse API calls
 */

interface eBayAccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface eBayBrowseSearchResult {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  condition: string;
  sellingStatus: {
    currentSoldCount?: number;
  };
}

interface eBaySearchResponse {
  searchResult: {
    item: eBayBrowseSearchResult[];
  };
}

/**
 * Get eBay OAuth 2.0 access token using Client Credentials flow
 */
async function getEBayAccessToken(): Promise<string | null> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("eBay API credentials not configured");
    return null;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    });

    if (!response.ok) {
      console.error("eBay token request failed:", response.statusText);
      return null;
    }

    const data: eBayAccessTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting eBay access token:", error);
    return null;
  }
}

/**
 * Search active listings on eBay using Browse API
 */
export async function searchActiveListings(query: string): Promise<{
  activeCount: number;
  avgPrice: number;
  prices: number[];
} | null> {
  const token = await getEBayAccessToken();

  if (!token) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      limit: "50",
      sort: "newlyListed",
    });

    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
      }
    );

    if (!response.ok) {
      console.error("eBay Browse API request failed:", response.statusText);
      return null;
    }

    const data = await response.json();

    const prices: number[] = [];
    if (data.itemSummaries) {
      data.itemSummaries.forEach((item: any) => {
        if (item.price?.value) {
          prices.push(parseFloat(item.price.value));
        }
      });
    }

    const avgPrice =
      prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;

    return {
      activeCount: data.total || 0,
      avgPrice: Math.round(avgPrice * 100) / 100,
      prices,
    };
  } catch (error) {
    console.error("Error searching active listings:", error);
    return null;
  }
}

/**
 * Search completed listings on eBay (mock for now)
 * NOTE: eBay's Browse API doesn't provide sold item data directly.
 * For production, integrate with Marketplace Insights API or Trading API (completed listings).
 */
export async function searchCompletedListings(query: string): Promise<{
  soldCount: number;
  avgPrice: number;
  avgDaysToSell: number;
} | null> {
  // TODO: Implement via eBay Trading API or Marketplace Insights
  // For now, return null to indicate not implemented
  console.warn(
    "searchCompletedListings not yet implemented. Requires eBay Marketplace Insights API."
  );
  return null;
}

/**
 * Calculate sell-through rate
 * @param soldCount Items sold in the last 90 days
 * @param activeCount Currently active listings
 * @returns Sell-through rate as percentage (0-100)
 */
export function calculateSellThrough(
  soldCount: number,
  activeCount: number
): number {
  if (soldCount === 0 && activeCount === 0) return 0;
  const rate = (soldCount / (soldCount + activeCount)) * 100;
  return Math.round(rate * 10) / 10; // Round to 1 decimal place
}

/**
 * Get verdict based on sell-through rate
 * @param sellThroughRate Percentage (0-100)
 * @returns "BUY" (strong demand), "MAYBE" (moderate), or "PASS" (weak)
 */
export function getVerdict(
  sellThroughRate: number
): "BUY" | "MAYBE" | "PASS" {
  if (sellThroughRate >= 50) {
    return "BUY";
  } else if (sellThroughRate >= 20) {
    return "MAYBE";
  } else {
    return "PASS";
  }
}

/**
 * Type definitions for search result
 */
export interface SearchResult {
  soldCount90d: number;
  activeCount: number;
  sellThroughRate: number;
  avgSoldPrice: number;
  medianSoldPrice: number;
  priceLow: number;
  priceHigh: number;
  avgDaysToSell: number;
  verdict: "BUY" | "MAYBE" | "PASS";
}
