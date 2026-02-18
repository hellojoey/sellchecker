'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface SavedSearch {
  id: string;
  query: string;
  cost_of_goods: number | null;
  notes: string | null;
  sell_through_rate: number;
  avg_sold_price: number;
  median_sold_price: number;
  price_low: number;
  price_high: number;
  verdict: string;
  sold_count: number;
  active_count: number;
  created_at: string;
}

interface RecentSearch {
  id: string;
  query: string;
  sell_through_rate: number;
  verdict: string;
  avg_sold_price: number;
  median_sold_price: number;
  sold_count_90d: number;
  active_count: number;
  searched_at: string;
}

interface WatchlistItem {
  id: string;
  query: string;
  target_price: number | null;
  alert_type: string;
  last_str: number | null;
  last_avg_price: number | null;
  last_checked: string | null;
  created_at: string;
}

export default function SavedPage() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCog, setEditCog] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [removingWatch, setRemovingWatch] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    // Fetch recent searches for all logged-in users
    try {
      const historyRes = await fetch('/api/search-history?page=1');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRecentSearches(historyData.searches || []);
      }
    } catch {
      // Non-critical — recent searches are just a nice-to-have
    }

    if (profile?.plan === 'pro') {
      setIsPro(true);

      // Load saved searches and watchlist in parallel
      const [savedRes, watchRes] = await Promise.allSettled([
        fetch('/api/saved'),
        fetch('/api/watchlist'),
      ]);

      if (savedRes.status === 'fulfilled' && savedRes.value.ok) {
        const data = await savedRes.value.json();
        setSavedSearches(data.savedSearches || []);
      }

      if (watchRes.status === 'fulfilled' && watchRes.value.ok) {
        const data = await watchRes.value.json();
        setWatchlist(data.watchlist || []);
      }
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this saved search?')) return;
    setDeleting(id);

    try {
      const res = await fetch(`/api/saved?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch('/api/saved', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          costOfGoods: editCog ? parseFloat(editCog) : null,
          notes: editNotes || null,
        }),
      });

      if (res.ok) {
        const { updated } = await res.json();
        setSavedSearches((prev) =>
          prev.map((s) => (s.id === id ? { ...s, cost_of_goods: updated.cost_of_goods, notes: updated.notes } : s))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleRemoveWatch = async (id: string) => {
    if (!confirm('Remove this item from your watchlist?')) return;
    setRemovingWatch(id);
    try {
      const res = await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWatchlist((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error('Remove watch failed:', err);
    } finally {
      setRemovingWatch(null);
    }
  };

  const startEditing = (search: SavedSearch) => {
    setEditingId(search.id);
    setEditCog(search.cost_of_goods?.toString() || '');
    setEditNotes(search.notes || '');
  };

  // Calculate profit for a saved search
  const calcProfit = (search: SavedSearch) => {
    if (!search.cost_of_goods) return null;
    const fees = search.median_sold_price * 0.1325 + 0.30;
    return search.median_sold_price - search.cost_of_goods - fees;
  };

  // Export saved searches as CSV
  const handleExportCsv = () => {
    if (savedSearches.length === 0) return;
    const headers = ['Query', 'Verdict', 'STR%', 'Avg Sold', 'Median Sold', 'Low', 'High', 'Cost of Goods', 'Est. Profit', 'ROI%', 'Notes', 'Saved Date'];
    const rows = savedSearches.map((s) => {
      const profit = calcProfit(s);
      const roi = s.cost_of_goods && profit !== null ? ((profit / s.cost_of_goods) * 100).toFixed(1) : '';
      return [
        `"${s.query}"`,
        s.verdict === 'STRONG_BUY' ? 'STRONG BUY' : s.verdict === 'S_TIER' ? 'S-TIER' : s.verdict,
        s.sell_through_rate,
        s.avg_sold_price.toFixed(2),
        s.median_sold_price.toFixed(2),
        s.price_low.toFixed(2),
        s.price_high.toFixed(2),
        s.cost_of_goods?.toFixed(2) || '',
        profit !== null ? profit.toFixed(2) : '',
        roi,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
        new Date(s.created_at).toLocaleDateString(),
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sellchecker-saved-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Total portfolio stats
  const totalCog = savedSearches.reduce((sum, s) => sum + (s.cost_of_goods || 0), 0);
  const totalEstProfit = savedSearches.reduce((sum, s) => {
    const profit = calcProfit(s);
    return sum + (profit || 0);
  }, 0);
  const itemsWithCog = savedSearches.filter((s) => s.cost_of_goods).length;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading saved searches...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Searches</h1>
        <p className="text-gray-600 mb-6">Log in to save items and track your sourcing list.</p>
        <Link
          href="/login"
          className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Searches</h1>
          <p className="text-gray-600 mb-2">
            Save your research with Cost of Goods so you never have to re-search at the thrift store.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This feature is available for Pro members.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition"
          >
            Upgrade to Pro
          </Link>
        </div>

        {/* Recent Searches for free users — limited to 3 */}
        {recentSearches.length > 0 && (
          <RecentSearchesSection searches={recentSearches} maxVisible={3} showUpgrade />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Saved Searches</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {savedSearches.length} item{savedSearches.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSearches.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 transition"
              title="Export as CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
          )}
          <Link
            href="/search"
            className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            New Search
          </Link>
        </div>
      </div>

      {/* Recent Searches for pro users — show up to 10 */}
      {recentSearches.length > 0 && (
        <RecentSearchesSection searches={recentSearches} maxVisible={10} />
      )}

      {/* Portfolio summary */}
      {savedSearches.length > 0 && itemsWithCog > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border border-green-100">
          <h2 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3">Portfolio Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total COG</p>
              <p className="text-lg font-bold text-gray-900">${totalCog.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Est. Total Profit</p>
              <p className={`text-lg font-bold ${totalEstProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ${totalEstProfit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Est. ROI</p>
              <p className={`text-lg font-bold ${totalCog > 0 && totalEstProfit / totalCog >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totalCog > 0 ? `${((totalEstProfit / totalCog) * 100).toFixed(0)}%` : '--'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Based on {itemsWithCog} item{itemsWithCog !== 1 ? 's' : ''} with cost entered · Profits estimated at median sale price after eBay fees
          </p>
        </div>
      )}

      {/* Saved searches list */}
      {savedSearches.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600 font-medium mb-1">No saved searches yet</p>
          <p className="text-sm text-gray-400 mb-6">Search for an item and click &ldquo;Save Search&rdquo; to add it here.</p>
          <Link
            href="/search"
            className="inline-block bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 transition"
          >
            Start Searching
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((search) => {
            const profit = calcProfit(search);
            const isEditing = editingId === search.id;
            const daysAgo = Math.floor((Date.now() - new Date(search.created_at).getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={search.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/search?q=${encodeURIComponent(search.query)}`}
                        className="text-sm font-semibold text-gray-900 hover:text-green-600 transition truncate block"
                      >
                        {search.query}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          search.verdict === 'S_TIER' ? 'bg-purple-100 text-purple-700' :
                          search.verdict === 'STRONG_BUY' ? 'bg-green-100 text-green-800' :
                          search.verdict === 'BUY' ? 'bg-green-100 text-green-700' :
                          search.verdict === 'MAYBE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>{search.verdict === 'STRONG_BUY' ? 'STRONG BUY' : search.verdict === 'S_TIER' ? 'S-TIER' : search.verdict}</span>
                        <span className="text-xs text-gray-400">{search.sell_through_rate}% STR</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">
                          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => isEditing ? setEditingId(null) : startEditing(search)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(search.id)}
                        disabled={deleting === search.id}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Price info row */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-gray-400 uppercase">Avg Sold</p>
                      <p className="text-sm font-semibold text-gray-900">${search.avg_sold_price.toFixed(0)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-gray-400 uppercase">Your Cost</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {search.cost_of_goods ? `$${search.cost_of_goods.toFixed(2)}` : '—'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-gray-400 uppercase">Est. Profit</p>
                      <p className={`text-sm font-semibold ${
                        profit === null ? 'text-gray-400' :
                        profit >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {profit !== null ? `$${profit.toFixed(2)}` : '—'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-gray-400 uppercase">ROI</p>
                      <p className={`text-sm font-semibold ${
                        !search.cost_of_goods || !profit ? 'text-gray-400' :
                        profit >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {search.cost_of_goods && profit !== null
                          ? `${((profit / search.cost_of_goods) * 100).toFixed(0)}%`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {search.notes && !isEditing && (
                    <p className="text-xs text-gray-500 mt-2 italic">{search.notes}</p>
                  )}

                  {/* Edit form */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Cost of Goods</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={editCog}
                              onChange={(e) => setEditCog(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                          <input
                            type="text"
                            placeholder="e.g. Found at Goodwill"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(search.id)}
                          className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Watchlist Section ─── */}
      {isPro && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Watchlist
            {watchlist.length > 0 && (
              <span className="text-xs font-normal text-gray-400">({watchlist.length}/25)</span>
            )}
          </h2>

          {watchlist.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-600 font-medium mb-1">No items on your watchlist</p>
              <p className="text-sm text-gray-400 mb-4">
                Search for an item and click &ldquo;Watch&rdquo; to track price changes and STR shifts.
              </p>
              <Link
                href="/search"
                className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Start searching &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((item) => {
                const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24));
                const alertLabel = item.alert_type === 'price_drop' ? 'Price drop' :
                                   item.alert_type === 'str_change' ? 'STR change' : 'All changes';

                return (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/search?q=${encodeURIComponent(item.query)}`}
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition truncate block"
                        >
                          {item.query}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {alertLabel}
                          </span>
                          {item.target_price && (
                            <span className="text-xs text-gray-500">
                              Target: ${item.target_price.toFixed(2)}
                            </span>
                          )}
                          {item.last_str !== null && (
                            <span className="text-xs text-gray-400">
                              Last STR: {item.last_str}%
                            </span>
                          )}
                          {item.last_avg_price !== null && (
                            <span className="text-xs text-gray-400">
                              Avg: ${item.last_avg_price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            Added {daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveWatch(item.id)}
                        disabled={removingWatch === item.id}
                        className="text-gray-400 hover:text-red-500 p-1 ml-2 shrink-0"
                        title="Remove from watchlist"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Recent Searches section component
function RecentSearchesSection({
  searches,
  maxVisible,
  showUpgrade,
}: {
  searches: RecentSearch[];
  maxVisible: number;
  showUpgrade?: boolean;
}) {
  const visible = searches.slice(0, maxVisible);
  const hasMore = searches.length > maxVisible;

  function formatRelativeDate(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }

  function verdictStyle(verdict: string): string {
    switch (verdict) {
      case 'S_TIER': return 'bg-purple-100 text-purple-700';
      case 'STRONG_BUY': return 'bg-green-100 text-green-800';
      case 'BUY': return 'bg-green-100 text-green-700';
      case 'MAYBE': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-red-100 text-red-700';
    }
  }

  function verdictLabel(verdict: string): string {
    if (verdict === 'STRONG_BUY') return 'STRONG BUY';
    if (verdict === 'S_TIER') return 'S-TIER';
    return verdict;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span>🕐</span> Recent Searches
      </h2>
      <div className="space-y-2">
        {visible.map((search) => (
          <Link
            key={search.id}
            href={`/search?q=${encodeURIComponent(search.query)}`}
            className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 hover:border-green-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${verdictStyle(search.verdict)}`}>
                {verdictLabel(search.verdict)}
              </span>
              <span className="text-sm font-medium text-gray-900 truncate group-hover:text-green-600 transition">
                {search.query}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className="text-xs text-gray-500">{search.sell_through_rate}% STR</span>
              <span className="text-xs text-gray-400">{formatRelativeDate(search.searched_at)}</span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}

        {/* Blurred items + upgrade prompt for free users */}
        {showUpgrade && hasMore && (
          <div className="relative">
            <div className="space-y-2 blur-sm pointer-events-none select-none">
              {searches.slice(maxVisible, maxVisible + 2).map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${verdictStyle(search.verdict)}`}>
                      {verdictLabel(search.verdict)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{search.query}</span>
                  </div>
                  <span className="text-xs text-gray-500">{search.sell_through_rate}% STR</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Link
                href="/pricing"
                className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition shadow-lg"
              >
                Upgrade to Pro for full history
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
