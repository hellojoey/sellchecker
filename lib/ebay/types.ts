// eBay Browse API response types

export interface EbaySearchResponse {
  href: string;
  total: number;
  next?: string;
  limit: number;
  offset: number;
  itemSummaries?: EbayItemSummary[];
}

export interface EbayItemSummary {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  image?: {
    imageUrl: string;
  };
  condition: string;
  conditionId: string;
  itemLocation?: {
    country: string;
    postalCode?: string;
  };
  categories?: Array<{
    categoryId: string;
    categoryName: string;
  }>;
  seller?: {
    username: string;
    feedbackPercentage: string;
    feedbackScore: number;
  };
  itemWebUrl: string;
  itemEndDate?: string;
  buyingOptions: string[];
  listingMarketplaceId: string;
}

export interface EbayOAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface EbayCompletedItem {
  itemId: string;
  title: string;
  soldPrice: number;
  soldDate: string;
  condition: string;
}
