# SellChecker Environment Variables

Copy these to Vercel Dashboard → Settings → Environment Variables.
Also create a local `.env.local` file with these values for development.

```env
# ─── Supabase ───
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ─── eBay API ───
EBAY_CLIENT_ID=your-ebay-app-id
EBAY_CLIENT_SECRET=your-ebay-cert-id
EBAY_ENVIRONMENT=PRODUCTION
# OAuth token is refreshed automatically by the app

# ─── Stripe ───
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# ─── App Config ───
NEXT_PUBLIC_APP_URL=https://sellchecker.app
FREE_DAILY_LIMIT=5
CACHE_TTL_HOURS=24
```

## Setup Steps

### 1. Supabase
1. Go to supabase.com → New Project
2. Copy the URL and anon key from Settings → API
3. Copy the service role key (keep this SECRET — server-side only)
4. Run `schema.sql` in the SQL Editor

### 2. eBay Developer Program
1. Go to developer.ebay.com → Create Account
2. Create a new application (Production keys)
3. Copy the App ID (Client ID) and Cert ID (Client Secret)
4. Apply for Marketplace Insights API access (optional, for sold data)

### 3. Stripe
1. Go to dashboard.stripe.com → Create Account
2. Create a Product: "SellChecker Pro" → $10/month recurring
3. Copy the Price ID (starts with price_)
4. Set up a webhook endpoint: https://sellchecker.app/api/webhooks/stripe
5. Copy the webhook signing secret

### 4. Vercel
1. Go to vercel.com → Import Git Repository
2. Add all environment variables above
3. Deploy
4. Add custom domain: sellchecker.app
5. Update DNS: add CNAME record pointing to cname.vercel-dns.com
