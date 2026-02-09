'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import type { SellThroughResult } from '@/lib/sellthrough';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [result, setResult] = useState<SellThroughResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (query) {
      runSearch(query);
    }
  }, [query]);

  const runSearch = async (q: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

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
      <div className="mb-8">
        <SearchBar initialQuery={query} autoFocus />
      </div>

      {/* Remaining searches */}
      {remaining !== null && (
        <div className="text-center mb-4">
          <span className="text-sm text-gray-500">
            {remaining} search{remaining !== 1 ? 'es' : ''} remaining today
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

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          {error.includes('limit') && (
            <a href="/pricing" className="text-sm text-red-600 underline mt-2 inline-block">
              Upgrade to Pro for unlimited searches
            </a>
          )}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="animate-fade-in">
          <SearchResults result={result} />

          {/* Search again prompt */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              Data sourced from eBay active and sold listings · Updated every 24 hours
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!query && !loading && !result && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg">Search for any item to see its sell-through rate</p>
          <p className="text-sm mt-1">Try &ldquo;Lululemon Define Jacket&rdquo; or &ldquo;Nike Dunk Low&rdquo;</p>
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
