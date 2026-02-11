# SellChecker — Stripe Setup Guide

## Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up with your email (joeypayongayong@gmail.com)
3. Complete the onboarding (business name: "SellChecker" or "The Thursday Store")

## Step 2: Create the Product + Price

1. In the Stripe Dashboard, go to **Product Catalog** → **Add Product**
2. Fill in:
   - **Name:** SellChecker Pro
   - **Description:** Unlimited searches, search history, watchlist, brand trends, and more
3. Under Pricing:
   - **Model:** Standard pricing
   - **Price:** $10.00 USD
   - **Billing period:** Monthly
   - Check "Include free trial" → **7 days**
4. Click **Save product**
5. Click into the product, then click the **Price** row
6. Copy the **Price ID** — it starts with `price_` (e.g., `price_1Abc123...`)

## Step 3: Set Up Webhook Endpoint

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Set the endpoint URL to: `https://sellchecker.app/api/webhooks/stripe`
3. Under "Select events to listen to", add these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. On the endpoint detail page, click **Reveal** under "Signing secret"
6. Copy the **Webhook Secret** — it starts with `whsec_`

## Step 4: Get Your API Keys

1. Go to **Developers** → **API Keys**
2. Copy:
   - **Publishable key:** starts with `pk_live_...` (or `pk_test_...` for testing)
   - **Secret key:** starts with `sk_live_...` (or `sk_test_...` for testing)

> **Tip:** Use TEST MODE first! Toggle "Test mode" in the top-right of the dashboard.
> Test keys start with `pk_test_` / `sk_test_` and won't charge real cards.

## Step 5: Configure Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable these options:
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Allow customers to switch plans (not needed yet, but future-proof)
3. Save

## Step 6: Set Environment Variables

Add these to your Vercel dashboard (Settings → Environment Variables):

```
STRIPE_SECRET_KEY=sk_test_...          (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_...     (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

Also add them to your local `.env.local` for development.

## Step 7: Test the Flow

1. Make sure Supabase Auth is working (magic link login)
2. Log in to SellChecker
3. Go to /pricing → Click "Start 7-day free trial"
4. You should be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
6. After checkout, you should be redirected to /search?upgraded=true
7. Check the navbar — should show "PRO" badge and "Billing" link
8. Click "Billing" — should open Stripe Customer Portal

## File Changes Summary

### New files:
- `app/api/checkout/route.ts` — Creates Stripe Checkout sessions (POST /api/checkout)
- `app/api/billing/portal/route.ts` — Opens Stripe Customer Portal (POST /api/billing/portal)

### Updated files:
- `lib/stripe.ts` — Added getOrCreateCustomer(), createPortalSession(), proper constructWebhookEvent()
- `app/api/webhooks/stripe/route.ts` — Real signature verification, handles checkout.session.completed, subscription updates/deletes, payment failures
- `app/pricing/page.tsx` — Pro button now calls /api/checkout (checks auth first, redirects to login if needed)
- `components/Navbar.tsx` — Auth-aware: shows PRO badge, Billing/Upgrade/Log out based on user state

## Architecture: The Payment Flow

```
User clicks "Start 7-day free trial" on /pricing
  ↓
Is user logged in? (checked via Supabase client)
  ├─ NO → Redirect to /login?plan=pro
  │         → After magic link auth → redirect back to /pricing
  │         → Click button again (now logged in)
  └─ YES → POST /api/checkout
              ↓
           Server gets user from Supabase session
           Server finds/creates Stripe customer
           Server creates Stripe Checkout Session (7-day trial)
              ↓
           Client redirects to Stripe hosted checkout page
              ↓
           User enters card details on Stripe
              ↓
           Stripe sends webhook → POST /api/webhooks/stripe
              ↓
           checkout.session.completed event
              ↓
           Webhook updates profiles.plan = 'pro'
           Webhook stores stripe_customer_id + stripe_subscription_id
              ↓
           User redirected to /search?upgraded=true
           Navbar shows PRO badge
```
