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

export default function SavedPage() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCog, setEditCog] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

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

    if (profile?.plan === 'pro') {
      setIsPro(true);

      const res = await fetch('/api/saved');
      if (res.ok) {
        const data = await res.json();
        setSavedSearches(data.savedSearches || []);
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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
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
                          search.verdict === 'BUY' ? 'bg-green-100 text-green-700' :
                          search.verdict === 'RISKY' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{search.verdict}</span>
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
    </div>
  );
}
