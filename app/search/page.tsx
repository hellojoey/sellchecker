'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import CompCheck from '@/components/CompCheck';
import SourcingCalc from '@/components/SourcingCalc';
import ProFeatureCatalog from '@/components/ProFeatureCatalog';
import CompCheckTeaser from '@/components/CompCheckTeaser';
import TrendingSearches from '@/components/TrendingSearches';
import SaveSearchButton from '@/components/SaveSearchButton';
import { createClient } from '@/lib/supabase/client';
import type { SellThroughResult } from '@/lib/sellthrough';
import type { ConditionValue } from '@/components/ConditionFilter';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [result, setResult] = useState<SellThroughResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [condition, setCondition] = useState<ConditionValue>('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptQuery, setAuthPromptQuery] = useState('');
  const prevQueryRef = useRef('');

  // Check user plan on mount
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
      }
    };
    checkPlan();
  }, []);

  useEffect(() => {
    if (query) {
      // Reset condition when query changes
      if (query !== prevQueryRef.current) {
        setCondition('');
        prevQueryRef.current = query;
      }
      runSearch(query, condition);
    }
  }, [query]);

  // Re-run search when condition changes (if there's already a query)
  const handleConditionChange = (newCondition: ConditionValue) => {
    setCondition(newCondition);
    if (query) {
      runSearch(query, newCondition);
    }
  };

  const runSearch = async (q: string, cond: ConditionValue = condition) => {
    setLoading(true);
    setError(null);

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
        return;
      }

      setResult(data.result);
      setRemaining(data.remainingSearches ?? null);
    } catch (err) {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
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
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="animate-fade-in">
          {/* Unified results card — includes condition filter, slider, deal calc */}
          <SearchResults
            result={result}
            isPro={isPro}
            condition={condition}
            onConditionChange={handleConditionChange}
          />

          {/* Action bar — Save Search button */}
          <div className="flex items-center justify-end mt-3 mb-2">
            <SaveSearchButton result={result} isPro={isPro} isLoggedIn={isLoggedIn} />
          </div>

          {/* Pro-only separate cards */}
          {isPro && (
            <>
              <CompCheck listings={result.topListings || []} query={result.query} />
              <SourcingCalc result={result} />
            </>
          )}

          {/* Free users: competitor teaser (1 visible, rest blurred) */}
          {!isPro && result.topListings && result.topListings.length > 0 && (
            <CompCheckTeaser listings={result.topListings} query={result.query} />
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

      {/* Empty state — show trending */}
      {!query && !loading && !result && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg mb-1">Search for any item to see its sell-through rate</p>
          <p className="text-sm mb-8">Try &ldquo;Lululemon Define Jacket&rdquo; or &ldquo;Nike Dunk Low&rdquo;</p>
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
