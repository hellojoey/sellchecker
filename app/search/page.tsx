'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import CompCheck from '@/components/CompCheck';
import SourcingCalc from '@/components/SourcingCalc';
import ProFeatureCatalog from '@/components/ProFeatureCatalog';
import CompCheckTeaser from '@/components/CompCheckTeaser';
import TrendingSearches from '@/components/TrendingSearches';
import SaveSearchButton from '@/components/SaveSearchButton';
import WatchButton from '@/components/WatchButton';
import OnboardingModal from '@/components/OnboardingModal';
import { createClient } from '@/lib/supabase/client';
import { calculateSellThrough, getVerdict, median, type SellThroughResult } from '@/lib/sellthrough';
import type { ConditionValue } from '@/components/ConditionFilter';

// Mini recent searches component for search page empty state
function RecentSearchesOnSearch() {
  const [searches, setSearches] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/search-history?limit=5');
        if (res.ok) {
          const data = await res.json();
          setSearches(data.searches || []);
        }
      } catch {
        // Silently fail
      }
    };
    fetchRecent();
  }, []);

  if (searches.length === 0) return null;

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'S_TIER': return 'bg-purple-100 text-purple-700';
      case 'STRONG_BUY': return 'bg-green-100 text-green-800';
      case 'BUY': return 'bg-green-100 text-green-700';
      case 'MAYBE': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'S_TIER': return 'S-TIER';
      case 'STRONG_BUY': return 'STRONG BUY';
      default: return verdict;
    }
  };

  const getRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center mb-3">
        🕐 Your Recent Searches
      </p>
      <div className="space-y-1.5 max-w-md mx-auto">
        {searches.map((search: any, i: number) => (
          <button
            key={i}
            onClick={() => router.push(`/search?q=${encodeURIComponent(search.query)}`)}
            className="flex items-center w-full gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition group text-left"
          >
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${getVerdictColor(search.verdict)}`}>
              {getVerdictLabel(search.verdict)}
            </span>
            <span className="text-sm text-gray-700 truncate flex-1 group-hover:text-green-800">{search.query}</span>
            {search.sell_through_rate != null && (
              <span className="text-xs text-gray-400 shrink-0">{search.sell_through_rate}%</span>
            )}
            <span className="text-xs text-gray-300 shrink-0">{getRelativeDate(search.searched_at)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [result, setResult] = useState<SellThroughResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const conditionParam = (searchParams.get('condition') || '') as ConditionValue;
  const [condition, setCondition] = useState<ConditionValue>(conditionParam);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptQuery, setAuthPromptQuery] = useState('');
  const [excludedIndices, setExcludedIndices] = useState<Set<number>>(new Set());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const prevQueryRef = useRef('');

  // Check user plan + onboarding on mount (re-check when upgraded param changes)
  const upgraded = searchParams.get('upgraded');
  useEffect(() => {
    const checkPlan = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (data?.plan === 'pro') {
          setIsPro(true);
        }
        // Show onboarding for new users
        if (!localStorage.getItem('sellchecker_onboarded')) {
          setShowOnboarding(true);
        }
      }
    };
    checkPlan();
  }, [upgraded]);

  useEffect(() => {
    if (query) {
      // Reset exclusions when query changes; keep condition from URL param
      if (query !== prevQueryRef.current) {
        const urlCondition = (searchParams.get('condition') || '') as ConditionValue;
        setCondition(urlCondition);
        setExcludedIndices(new Set());
        prevQueryRef.current = query;
        runSearch(query, urlCondition);
        return;
      }
      runSearch(query, condition);
    }
  }, [query]);

  // Re-run search when condition changes (if there's already a query)
  const handleConditionChange = (newCondition: ConditionValue) => {
    setCondition(newCondition);
    // Persist condition in URL so refresh/share keeps it
    const params = new URLSearchParams(searchParams.toString());
    if (newCondition) {
      params.set('condition', newCondition);
    } else {
      params.delete('condition');
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
    if (query) {
      runSearch(query, newCondition);
    }
  };

  // Recalculate result when listings are excluded
  const adjustedResult = useMemo(() => {
    if (!result || excludedIndices.size === 0) return result;
    const listings = result.topListings || [];
    const includedPrices = listings
      .filter((_, i) => !excludedIndices.has(i))
      .map(l => l.price);
    if (includedPrices.length === 0) return result;

    // Recalculate active count (subtract excluded listings)
    const adjustedActiveCount = Math.max(0, result.activeCount - excludedIndices.size);
    const adjustedSTR = calculateSellThrough(result.soldCount90d, adjustedActiveCount);

    return {
      ...result,
      activeCount: adjustedActiveCount,
      sellThroughRate: adjustedSTR,
      verdict: getVerdict(adjustedSTR),
      avgSoldPrice: Math.round(includedPrices.reduce((a, b) => a + b, 0) / includedPrices.length * 100) / 100,
      medianSoldPrice: Math.round(median(includedPrices) * 100) / 100,
      priceLow: Math.min(...includedPrices),
      priceHigh: Math.max(...includedPrices),
    };
  }, [result, excludedIndices]);

  const handleToggleExclude = (index: number) => {
    setExcludedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSearchTitle = (title: string) => {
    router.push(`/search?q=${encodeURIComponent(title)}`);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('sellchecker_onboarded', '1');
    setShowOnboarding(false);
  };

  const runSearch = async (q: string, cond: ConditionValue = condition) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      let url = `/api/search?q=${encodeURIComponent(q)}`;
      if (cond) {
        url += `&condition=${cond}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      // Require login — show inline auth prompt
      if (res.status === 401 && data.requireLogin) {
        setShowAuthPrompt(true);
        setAuthPromptQuery(q);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setErrorCode(data.errorCode || null);
        return;
      }

      setResult(data.result);
      setExcludedIndices(new Set());
      setRemaining(data.remainingSearches ?? null);
    } catch (err) {
      setError('Failed to connect. Please try again.');
      setErrorCode('UNKNOWN');
    } finally {
      setLoading(false);
    }
  };

  // Use adjusted result (accounts for excluded comps) for all display components
  const displayResult = adjustedResult;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Onboarding modal for new users */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Search bar at top */}
      <div className="mb-4">
        <SearchBar initialQuery={query} autoFocus />
      </div>

      {/* Remaining searches counter */}
      {query && remaining !== null && (
        <div className="flex items-center justify-end mb-4">
          <span className="text-xs text-gray-500">
            {remaining} left today
            {remaining <= 1 && (
              <span className="text-green-600 font-medium"> · <a href="/pricing" className="underline">Pro</a></span>
            )}
          </span>
        </div>
      )}

      {/* Remaining searches (when no query yet, shown centered) */}
      {!query && remaining !== null && (
        <div className="text-center mb-4">
          <span className="text-sm text-gray-500">
            {remaining} SellCheck{remaining !== 1 ? 's' : ''} remaining today
            {remaining <= 1 && (
              <span className="text-green-600 font-medium"> · <a href="/pricing" className="underline">Upgrade to Pro</a> for unlimited</span>
            )}
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Checking sell-through data...
          </div>
        </div>
      )}

      {/* Auth prompt — shown after search for anonymous users */}
      {showAuthPrompt && !loading && (
        <div className="animate-fade-in max-w-md mx-auto mt-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 sm:p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Your results are ready!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Create a free account to see sell-through rates, pricing data, and more for <strong>&ldquo;{authPromptQuery}&rdquo;</strong>. It only takes 10 seconds.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={`/login?redirect=${encodeURIComponent(`/search?q=${encodeURIComponent(authPromptQuery)}`)}`}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition text-center"
              >
                Sign up free
              </a>
              <a
                href={`/login?redirect=${encodeURIComponent(`/search?q=${encodeURIComponent(authPromptQuery)}`)}`}
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2 transition text-center"
              >
                Already have an account? Log in
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Free plan includes 5 SellChecks per day
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          {error.includes('limit') && (
            <a href="/pricing" className="text-sm text-red-600 underline mt-2 inline-block">
              Upgrade to Pro for unlimited SellChecks
            </a>
          )}
          {errorCode && ['TIMEOUT', 'EBAY_DOWN', 'EBAY_AUTH', 'UNKNOWN'].includes(errorCode) && (
            <button
              onClick={() => runSearch(query, condition)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 mt-3 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try again
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {displayResult && !loading && (
        <div className="animate-fade-in">
          {/* Unified results card — includes condition filter, slider, deal calc */}
          <SearchResults
            result={displayResult}
            isPro={isPro}
            condition={condition}
            onConditionChange={handleConditionChange}
          />

          {/* Exclusion indicator */}
          {excludedIndices.size > 0 && (
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-amber-600">
                {excludedIndices.size} listing{excludedIndices.size !== 1 ? 's' : ''} excluded — stats adjusted
              </span>
              <button
                onClick={() => setExcludedIndices(new Set())}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Action bar — Save + Watch buttons */}
          <div className="flex items-center justify-end gap-2 mt-3 mb-2">
            <WatchButton result={displayResult} isPro={isPro} isLoggedIn={isLoggedIn} />
            <SaveSearchButton result={displayResult} isPro={isPro} isLoggedIn={isLoggedIn} />
          </div>

          {/* Pro-only separate cards */}
          {isPro && (
            <>
              <CompCheck
                listings={result?.topListings || []}
                query={displayResult.query}
                excludedIndices={excludedIndices}
                onToggleExclude={handleToggleExclude}
                onSearchTitle={handleSearchTitle}
              />
              <SourcingCalc result={displayResult} />
            </>
          )}

          {/* Free users: competitor teaser (1 visible, rest blurred) */}
          {!isPro && result?.topListings && result.topListings.length > 0 && (
            <CompCheckTeaser
              listings={result.topListings}
              query={displayResult.query}
              onSearchTitle={handleSearchTitle}
            />
          )}

          {/* Pro feature showcase catalog for free users */}
          {!isPro && <ProFeatureCatalog />}

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              Data sourced from eBay active and sold listings · Updated every 24 hours
            </p>
          </div>
        </div>
      )}

      {/* Empty state — show recent searches + trending */}
      {!query && !loading && !result && (
        <div className="py-12">
          <div className="text-center text-gray-400 mb-8">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg mb-1">Search for any item to see its sell-through rate</p>
            <p className="text-sm">Try &ldquo;Lululemon Define Jacket&rdquo; or &ldquo;Nike Dunk Low&rdquo;</p>
          </div>

          {/* Your Recent Searches (personal, logged-in only) */}
          {isLoggedIn && <RecentSearchesOnSearch />}

          {/* Trending on SellChecker (platform-wide, only if live data) */}
          <TrendingSearches />
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>
    }>
      <SearchContent />
    </Suspense>
  );
}
