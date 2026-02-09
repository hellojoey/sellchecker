# SellChecker.app — Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│              Next.js 14 (App Router)                │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Landing  │  │ Search   │  │ Dashboard (Pro)  │  │
│  │ Page     │  │ Results  │  │ History/Wishlist  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                      │
│  Tailwind CSS · Mobile-first · PWA installable      │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────┐
│                  API ROUTES                          │
│            Next.js Serverless Functions              │
│                                                      │
│  /api/search         → eBay API → calc verdict      │
│  /api/auth/callback  → Supabase Auth                │
│  /api/webhooks/stripe → Stripe subscription events  │
│  /api/wishlist       → CRUD wishlist items           │
│  /api/trends         → Weekly brand aggregation      │
└──────┬──────────┬──────────┬────────────────────────┘
       │          │          │
  ┌────▼────┐ ┌──▼───┐ ┌───▼────┐
  │ Supabase│ │ eBay │ │ Stripe │
  │   DB    │ │ API  │ │  API   │
  │ + Auth  │ │      │ │        │
  └─────────┘ └──────┘ └────────┘
```

## Directory Structure (Next.js App Router)

```
sellchecker/
├── app/
│   ├── layout.tsx              # Root layout (nav, footer)
│   ├── page.tsx                # Landing page / search
│   ├── search/
│   │   └── page.tsx            # Search results page
│   ├── login/
│   │   └── page.tsx            # Auth page (magic link)
│   ├── dashboard/
│   │   ├── page.tsx            # Pro dashboard (history, wishlist)
│   │   └── layout.tsx          # Dashboard layout
│   ├── pricing/
│   │   └── page.tsx            # Pricing page
│   └── api/
│       ├── search/
│       │   └── route.ts        # GET: search eBay, return sell-through
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts    # Supabase auth callback
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts    # POST: Stripe webhook handler
│       └── wishlist/
│           └── route.ts        # GET/POST/DELETE wishlist
├── components/
│   ├── SearchBar.tsx           # Main search input
│   ├── SearchResults.tsx       # Results card with verdict
│   ├── SellThroughGauge.tsx    # Visual gauge component
│   ├── PriceChart.tsx          # Price range visualization
│   ├── VerdictBadge.tsx        # BUY/RISKY/PASS badge
│   ├── ProfitCalculator.tsx    # Pro: enter cost → see profit
│   ├── BarcodeScanner.tsx      # Pro: camera barcode reader
│   ├── Navbar.tsx              # Top navigation
│   └── Footer.tsx              # Footer with links
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   └── middleware.ts       # Auth middleware
│   ├── ebay/
│   │   ├── auth.ts             # eBay OAuth token management
│   │   ├── browse.ts           # Browse API: search active listings
│   │   ├── insights.ts         # Marketplace Insights: sold data
│   │   └── types.ts            # TypeScript types for eBay responses
│   ├── stripe/
│   │   ├── client.ts           # Stripe client setup
│   │   └── webhooks.ts         # Webhook event handlers
│   ├── sellthrough.ts          # Core calculation engine
│   └── cache.ts                # Search cache logic
├── public/
│   ├── og-image.png            # Social share image
│   ├── favicon.ico
│   └── manifest.json           # PWA manifest
├── .env.local                  # Environment variables (git-ignored)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Core Algorithm: Sell-Through Rate

```typescript
interface SellThroughResult {
  soldCount90d: number;      // items sold in last 90 days
  activeCount: number;       // currently active listings
  sellThroughRate: number;   // percentage (0-100)
  avgSoldPrice: number;
  medianSoldPrice: number;
  priceLow: number;
  priceHigh: number;
  avgDaysToSell: number;
  verdict: 'BUY' | 'RISKY' | 'PASS';
}

function calculateSellThrough(sold: number, active: number): number {
  if (sold + active === 0) return 0;
  return (sold / (sold + active)) * 100;
}

function getVerdict(rate: number): 'BUY' | 'RISKY' | 'PASS' {
  if (rate >= 50) return 'BUY';    // Strong demand
  if (rate >= 20) return 'RISKY';  // Moderate, watch pricing
  return 'PASS';                    // Low demand, skip it
}
```

## Caching Strategy

All search results are cached for 24 hours in the `search_cache` table.

```
User searches "Lululemon Define Jacket"
  → Normalize query (lowercase, trim)
  → MD5 hash the normalized query
  → Check search_cache for matching hash where expires_at > NOW()
  → If HIT: return cached data (no API call)
  → If MISS: call eBay API → calculate → store in cache → return
```

This keeps eBay API usage under the 5,000/day limit even with
thousands of users, since popular queries get cached.

## Rate Limiting

Free tier: 5 searches per calendar day (reset at midnight UTC).
Tracked in the `profiles` table (`searches_today` + `searches_reset_at`).
Enforced server-side in the `/api/search` route before making any API calls.

Pro tier: unlimited (but still cached to reduce API load).
```

