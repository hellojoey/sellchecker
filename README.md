# SellChecker - Sell-Through Rate Checker for Resellers

A modern web application that helps resellers make data-driven purchasing decisions by instantly checking eBay sell-through rates and pricing data.

**Domain:** sellcheckerer.app

## Project Overview

SellChecker is a Next.js 14 application built with TypeScript, Tailwind CSS, and Supabase. It provides resellers with instant sell-through metrics for any product on eBay, helping them determine whether an item is worth buying.

### Key Features

- **Instant Search:** Get sell-through data in 2 seconds
- **Verdicts:** Smart BUY/RISKY/PASS recommendations based on data
- **Price Analytics:** Min/max/median pricing with visualization
- **Mobile-First:** Fully responsive web app, installable to home screen
- **Free + Pro Pricing:** 5 free checks/day, unlimited with Pro subscription

## Project Structure

```
sellchecker/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts          # Search API endpoint
│   ├── page.tsx                  # Home page (landing)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles & Tailwind directives
├── components/
│   ├── Navbar.tsx                # Top navigation
│   ├── Footer.tsx                # Footer
│   ├── Gauge.tsx                 # Sell-through rate gauge component
│   ├── SearchBar.tsx             # Search input with suggestions
│   ├── ResultCard.tsx            # Search result display
│   └── PricingCard.tsx           # Pricing tier card
├── lib/
│   ├── supabase.ts               # Supabase client setup
│   ├── ebay.ts                   # eBay API client
│   └── stripe.ts                 # Stripe client setup
├── public/                       # Static assets
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind configuration
├── postcss.config.js             # PostCSS config
├── .env.example                  # Environment variables template
└── .gitignore                    # Git ignore rules
```

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Configuration

### Environment Variables

Create a `.env.local` file with:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **eBay API:** `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`
- **Stripe:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **App:** `NEXT_PUBLIC_APP_URL`

See `.env.example` for template.

## Architecture

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom theme
- **Components:** Server and client components
- **Interactivity:** React hooks for search, results

### Backend

- **API Route:** `/api/search` - Get sell-through data
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (TODO)
- **Payments:** Stripe (TODO)

### External APIs

- **eBay Browse API:** Active listing data
- **eBay Trading API:** Completed listing data (TODO)
- **eBay Marketplace Insights API:** Advanced metrics (TODO)

## Development Notes

### TODO Items

#### Search API (`app/api/search/route.ts`)
- [ ] Implement real eBay API integration
- [ ] Add search result caching in Supabase
- [ ] Implement rate limiting
- [ ] Add user auth check for free vs Pro limits

#### Supabase Integration (`lib/supabase.ts`)
- [ ] Implement SSR client with cookie handling
- [ ] Create search cache table and queries
- [ ] Implement auth session management

#### eBay API (`lib/ebay.ts`)
- [ ] Complete OAuth 2.0 token refresh logic
- [ ] Integrate eBay Trading API for sold items
- [ ] Add Marketplace Insights API for advanced data
- [ ] Implement proper error handling and retry logic

#### Frontend
- [ ] Add barcode scanner (Pro feature)
- [ ] Implement search history
- [ ] Add wishlist with price alerts
- [ ] CSV export functionality
- [ ] User authentication flow

#### Stripe Integration (`lib/stripe.ts`)
- [ ] Implement checkout session creation
- [ ] Add webhook handler for subscription events
- [ ] Implement subscription status checks

## Technology Stack

### Core
- Next.js 14
- React 18
- TypeScript 5

### Styling
- Tailwind CSS 3
- PostCSS
- Autoprefixer

### Libraries
- @supabase/supabase-js - Database & Auth
- @supabase/ssr - Server-side Supabase
- stripe - Payment processing
- @stripe/stripe-js - Stripe client
- lucide-react - Icons

### Dev Tools
- ESLint
- TypeScript

## Design System

### Colors

- **Primary (BUY):** `#10b981` (Emerald)
- **Warning (RISKY):** `#f59e0b` (Amber)
- **Danger (PASS):** `#ef4444` (Red)
- **Dark backgrounds:** `#0f172a`, `#1e293b`

### Typography

- Font: Inter (via Google Fonts)
- Headings: Extrabold (800) to Bold (700)
- Body: Regular (400) to Medium (500)

### Components

All components are built with Tailwind CSS utilities for consistency and rapid development.

## Performance Considerations

- Demo data allows instant feedback without API calls
- Search results cache planned in Supabase (7-day TTL)
- Mobile-optimized for thrift store aisles
- Lightweight dependencies for fast load times

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 12+, Chrome Android

## Deployment

Recommended platforms:
- **Vercel** (optimized for Next.js)
- **Railway** (with PostgreSQL)
- **Supabase** (complete backend)

## Related Documentation

- `ARCHITECTURE.md` - System design and data flow
- `ROADMAP.md` - Feature roadmap
- `schema.sql` - Database schema
- `COPY.md` - Marketing copy
- `ENV_TEMPLATE.md` - Environment setup
- `COMPETITORS.md` - Competitive analysis

## License

© 2026 SellChecker. All rights reserved.
