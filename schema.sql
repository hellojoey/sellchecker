-- ═══════════════════════════════════════════════════════
-- SellChecker.app — Database Schema (Supabase / PostgreSQL)
-- Run this in your Supabase SQL Editor to set up all tables
-- ═══════════════════════════════════════════════════════

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- USERS (extends Supabase Auth)
-- ─────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  shipping_zip TEXT,
  default_weight_category INTEGER NOT NULL DEFAULT 0,
  searches_today INTEGER NOT NULL DEFAULT 0,
  searches_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when user signs up (captures first_name from signup metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- SEARCHES (search history + rate limiting)
-- ─────────────────────────────────────────
CREATE TABLE public.searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,

  -- Results snapshot (cached at time of search)
  sold_count_90d INTEGER,        -- items sold in last 90 days
  active_count INTEGER,          -- currently active listings
  sell_through_rate DECIMAL,     -- calculated: sold / (sold + active) * 100
  avg_sold_price DECIMAL,        -- average sold price
  median_sold_price DECIMAL,     -- median sold price
  price_low DECIMAL,             -- lowest sold price
  price_high DECIMAL,            -- highest sold price
  avg_days_to_sell INTEGER,      -- average time to sell
  verdict TEXT CHECK (verdict IN ('PASS', 'MAYBE', 'BUY', 'STRONG_BUY', 'S_TIER')),

  -- Metadata
  platform TEXT NOT NULL DEFAULT 'ebay',
  is_pro_search BOOLEAN DEFAULT FALSE,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_searches_user_id ON public.searches(user_id);
CREATE INDEX idx_searches_query ON public.searches(query);
CREATE INDEX idx_searches_searched_at ON public.searches(searched_at);

-- ─────────────────────────────────────────
-- WISHLIST (saved items for Pro users)
-- ─────────────────────────────────────────
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  last_sell_through DECIMAL,
  last_avg_price DECIMAL,
  last_checked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);

-- ─────────────────────────────────────────
-- SAVED SEARCHES (Pro feature — sourcing list)
-- ─────────────────────────────────────────
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  cost_of_goods DECIMAL,
  notes TEXT,
  sell_through_rate DECIMAL,
  avg_sold_price DECIMAL,
  median_sold_price DECIMAL,
  price_low DECIMAL,
  price_high DECIMAL,
  verdict TEXT CHECK (verdict IN ('PASS', 'MAYBE', 'BUY', 'STRONG_BUY', 'S_TIER')),
  sold_count INTEGER,
  active_count INTEGER,
  snapshot_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);

-- ─────────────────────────────────────────
-- SEARCH TRENDING (popular searches)
-- ─────────────────────────────────────────
CREATE TABLE public.search_trending (
  query_normalized TEXT PRIMARY KEY,
  search_count INTEGER NOT NULL DEFAULT 1,
  last_searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trending_count ON public.search_trending(search_count DESC);

-- Upsert trending search counts
CREATE OR REPLACE FUNCTION public.upsert_trending(p_query TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.search_trending (query_normalized, search_count, last_searched_at)
  VALUES (p_query, 1, NOW())
  ON CONFLICT (query_normalized)
  DO UPDATE SET search_count = search_trending.search_count + 1, last_searched_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────
-- SEARCH CACHE (reduce eBay API calls)
-- ─────────────────────────────────────────
CREATE TABLE public.search_cache (
  query_hash TEXT PRIMARY KEY,   -- MD5 hash of normalized query
  query TEXT NOT NULL,
  sold_count_90d INTEGER,
  active_count INTEGER,
  sell_through_rate DECIMAL,
  avg_sold_price DECIMAL,
  median_sold_price DECIMAL,
  price_low DECIMAL,
  price_high DECIMAL,
  avg_days_to_sell INTEGER,
  verdict TEXT,
  raw_data JSONB,                -- full API response for debugging
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_cache_expires ON public.search_cache(expires_at);

-- Auto-cleanup expired cache entries (run daily via Supabase cron or Edge Function)
-- DELETE FROM public.search_cache WHERE expires_at < NOW();

-- ─────────────────────────────────────────
-- BRAND HOT LIST (weekly trending data)
-- ─────────────────────────────────────────
CREATE TABLE public.brand_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  category TEXT,                 -- clothing/shoes/accessories/electronics
  sell_through_rate DECIMAL,
  avg_sold_price DECIMAL,
  search_volume INTEGER,         -- how many SellChecker users searched this
  trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
  week_of DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brand_trends_week ON public.brand_trends(week_of);
CREATE UNIQUE INDEX idx_brand_trends_unique ON public.brand_trends(brand, category, week_of);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Searches: users can only see their own searches
CREATE POLICY "Users can view own searches"
  ON public.searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
  ON public.searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Wishlist: users can only manage their own wishlist
CREATE POLICY "Users can view own wishlist"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist"
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- Saved searches: users can manage their own saved searches
CREATE POLICY "Users can view own saved searches"
  ON public.saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved searches"
  ON public.saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON public.saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON public.saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Search trending: readable by all authenticated users (shared data)
-- Note: writes handled via upsert_trending() SECURITY DEFINER function
ALTER TABLE public.search_trending ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read trending"
  ON public.search_trending FOR SELECT
  USING (auth.role() = 'authenticated');

-- Cache: readable by all authenticated users (shared cache)
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read cache"
  ON public.search_cache FOR SELECT
  USING (auth.role() = 'authenticated');

-- Brand trends: readable by all authenticated users
ALTER TABLE public.brand_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read trends"
  ON public.brand_trends FOR SELECT
  USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────

-- Check and increment daily search count
-- Returns TRUE if search is allowed, FALSE if limit reached
CREATE OR REPLACE FUNCTION public.check_search_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_searches INTEGER;
  v_reset_date DATE;
BEGIN
  SELECT plan, searches_today, searches_reset_at
  INTO v_plan, v_searches, v_reset_date
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Pro users: unlimited
  IF v_plan = 'pro' THEN
    UPDATE public.profiles
    SET searches_today = searches_today + 1, updated_at = NOW()
    WHERE id = p_user_id;
    RETURN TRUE;
  END IF;

  -- Reset counter if new day
  IF v_reset_date < CURRENT_DATE THEN
    UPDATE public.profiles
    SET searches_today = 1, searches_reset_at = CURRENT_DATE, updated_at = NOW()
    WHERE id = p_user_id;
    RETURN TRUE;
  END IF;

  -- Free users: 5 per day
  IF v_searches >= 5 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET searches_today = searches_today + 1, updated_at = NOW()
  WHERE id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate verdict from sell-through rate
CREATE OR REPLACE FUNCTION public.calc_verdict(sell_through DECIMAL)
RETURNS TEXT AS $$
BEGIN
  IF sell_through >= 100 THEN RETURN 'S_TIER';
  ELSIF sell_through >= 75 THEN RETURN 'STRONG_BUY';
  ELSIF sell_through >= 50 THEN RETURN 'BUY';
  ELSIF sell_through >= 25 THEN RETURN 'MAYBE';
  ELSE RETURN 'PASS';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
