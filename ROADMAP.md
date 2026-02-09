# SellChecker.app — Build Roadmap

**Domain:** sellchecker.app
**Stack:** Next.js 14 + Supabase + Vercel + Stripe
**Target:** 3-week MVP launch

---

## WEEK 1: Foundation (Days 1–7)

### Day 1–2: Project Setup
- [x] Create project folder and docs
- [ ] `npx create-next-app@latest sellchecker --typescript --tailwind --app`
- [ ] Install deps: `@supabase/supabase-js`, `@supabase/ssr`
- [ ] Create Supabase project at supabase.com
- [ ] Run database migration (see schema.sql)
- [ ] Set up environment variables
- [ ] Deploy skeleton to Vercel, point sellchecker.app DNS

### Day 3–4: Landing Page
- [ ] Hero section: "Will it sell? Know before you buy."
- [ ] How it works (3 steps)
- [ ] Pricing section (Free vs Pro)
- [ ] CTA: search bar that teases the product
- [ ] Mobile responsive
- [ ] SEO meta tags, OG image

### Day 5–7: Core Search Engine
- [ ] eBay Browse API integration (OAuth 2.0 setup)
- [ ] Search endpoint: `/api/search?q=...`
- [ ] Active listing count + pricing data
- [ ] Apply for eBay Marketplace Insights API (sold data)
- [ ] Fallback: scrape Terapeak or use completed items filter
- [ ] Sell-through calculation engine
- [ ] Search results UI with verdict (BUY/PASS/RISKY)

---

## WEEK 2: Product (Days 8–14)

### Day 8–9: User Accounts
- [ ] Supabase Auth: email magic link signup
- [ ] Login/signup pages
- [ ] User profile page
- [ ] Rate limiting: 5 searches/day for free users (tracked in DB)

### Day 10–11: Search Experience Polish
- [ ] Autocomplete/suggestions
- [ ] Price range visualization (bar chart)
- [ ] Sell-through rate gauge/meter
- [ ] Days-to-sell estimate
- [ ] "Similar searches" suggestions
- [ ] Loading states and error handling

### Day 12–14: Pro Features
- [ ] Search history (stored in DB)
- [ ] Profit calculator (enter cost → see estimated profit after fees)
- [ ] Wishlist/save items
- [ ] Pro badge and UI differentiation

---

## WEEK 3: Monetization & Launch (Days 15–21)

### Day 15–16: Stripe Integration
- [ ] Stripe account setup
- [ ] Checkout session for $10/mo Pro plan
- [ ] Webhook handler for subscription events
- [ ] Billing portal (manage/cancel subscription)
- [ ] Paywall logic: check subscription status before Pro features

### Day 17–18: Barcode Scanner
- [ ] Camera access on mobile
- [ ] UPC/EAN barcode scanning (use quagga2 or zxing)
- [ ] UPC → product lookup → sell-through search
- [ ] Fallback: manual UPC entry

### Day 19–20: Testing & Polish
- [ ] Test all flows: signup → search → upgrade → Pro features
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Error states, edge cases
- [ ] Performance optimization (cache sell-through data 24hrs)
- [ ] Rate limit enforcement testing

### Day 21: Launch
- [ ] Final deploy to production
- [ ] Post to r/Flipping, r/eBaySellers
- [ ] Post in Facebook reseller groups
- [ ] Share on TikTok/YouTube reseller community
- [ ] Monitor analytics and errors

---

## POST-LAUNCH (Week 4+)

### v1.1 Enhancements
- [ ] Brand hot list (trending brands with sell-through rates)
- [ ] CSV export of search history
- [ ] Price alerts for wishlisted items
- [ ] Chrome extension for in-page eBay analysis

### v1.2 Multi-Platform
- [ ] Poshmark sold data (partnership or scraping)
- [ ] Mercari sold data
- [ ] Cross-platform sell-through comparison view

### v2.0 Advanced
- [ ] AI-powered sourcing recommendations
- [ ] Inventory connection (for TTS Hub users)
- [ ] Bulk lookup (upload CSV of items)
- [ ] API access for developers/power sellers

---

## Key Metrics to Track
- Daily active users (DAU)
- Searches per user per day
- Free → Pro conversion rate (target: 5–10%)
- Monthly recurring revenue (MRR)
- Churn rate (target: <5%/month)
- Search latency (target: <2 seconds)
