'use client';

import { useState } from 'react';
import type { SellThroughResult } from '@/lib/sellthrough';

interface SaveSearchButtonProps {
  result: SellThroughResult;
  isPro: boolean;
  isLoggedIn: boolean;
}

export default function SaveSearchButton({ result, isPro, isLoggedIn }: SaveSearchButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [costOfGoods, setCostOfGoods] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!isPro) {
      window.location.href = '/pricing';
      return;
    }
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    setShowModal(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: result.query,
          costOfGoods: costOfGoods ? parseFloat(costOfGoods) : null,
          notes: notes || null,
          searchData: result,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
      setShowModal(false);

      // Reset after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Save button */}
      <button
        onClick={handleSave}
        className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition ${
          saved
            ? 'bg-green-100 text-green-700'
            : isPro
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}
      >
        {saved ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Saved!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {isPro ? 'Save Search' : 'Save Search (Pro)'}
          </>
        )}
      </button>

      {/* Save modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Save Search</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Item summary */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">{result.query}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className={`font-bold ${
                  result.verdict === 'BUY' ? 'text-green-600' :
                  result.verdict === 'MAYBE' ? 'text-yellow-600' : 'text-red-600'
                }`}>{result.verdict}</span>
                <span>{result.sellThroughRate}% sell-through</span>
                <span>Avg ${result.avgSoldPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* COG input */}
            <div className="mb-4">
              <label htmlFor="save-cog" className="block text-sm font-medium text-gray-700 mb-1">
                Cost of Goods (what you paid or plan to pay)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  id="save-cog"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 5.00"
                  value={costOfGoods}
                  onChange={(e) => setCostOfGoods(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Optional — you can add this later too</p>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label htmlFor="save-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="save-notes"
                placeholder="e.g. Found at Goodwill, great condition"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
              />
            </div>

            {/* Estimated profit preview */}
            {costOfGoods && parseFloat(costOfGoods) > 0 && (
              <div className="bg-green-50 rounded-xl p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Median sale price</span>
                  <span className="font-medium">${result.medianSoldPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your cost</span>
                  <span className="font-medium text-red-600">-${parseFloat(costOfGoods).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">eBay fees (~13.25%)</span>
                  <span className="font-medium text-red-600">
                    -${(result.medianSoldPrice * 0.1325 + 0.30).toFixed(2)}
                  </span>
                </div>
                <hr className="border-green-200 my-1.5" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-green-800">Est. profit</span>
                  <span className={
                    result.medianSoldPrice - parseFloat(costOfGoods) - (result.medianSoldPrice * 0.1325 + 0.30) >= 0
                      ? 'text-green-700' : 'text-red-700'
                  }>
                    ${(result.medianSoldPrice - parseFloat(costOfGoods) - (result.medianSoldPrice * 0.1325 + 0.30)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                disabled={saving}
                className="flex-1 py-2.5 px-4 bg-green-600 rounded-xl text-sm font-semibold text-white hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {saving ? 'Saving...' : 'Save to My List'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
