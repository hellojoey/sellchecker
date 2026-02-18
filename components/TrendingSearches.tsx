'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TrendingItem {
  query: string;
  searches: number;
}

export default function TrendingSearches() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/trending');
        const data = await res.json();
        if (data.trending) {
          setTrending(data.trending.slice(0, 8));
        }
        setSource(data.source || '');
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-28 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  // Only show if we have real live data — hide if using defaults or empty
  if (trending.length === 0 || source !== 'live') return null;

  return (
    <div className="mt-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center mb-3">
        🔥 Trending on SellChecker
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {trending.map((item, idx) => (
          <button
            key={idx}
            onClick={() => router.push(`/search?q=${encodeURIComponent(item.query)}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-full text-sm text-gray-700 hover:text-green-800 transition"
          >
            <span>{item.query}</span>
            {item.searches > 0 && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {item.searches}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
