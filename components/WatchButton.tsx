'use client';

import { useState } from 'react';
import type { SellThroughResult } from '@/lib/sellthrough';

interface WatchButtonProps {
  result: SellThroughResult;
  isPro: boolean;
  isLoggedIn: boolean;
}

export default function WatchButton({ result, isPro, isLoggedIn }: WatchButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'price_drop' | 'str_change' | 'both'>('both');
  const [saving, setSaving] = useState(false);
  const [watching, setWatching] = useState(false);
  const [error, setError] = useState('');

  const handleWatch = () => {
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

  const confirmWatch = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: result.query,
          target_price: targetPrice ? parseFloat(targetPrice) : null,
          alert_type: alertType,
          current_str: result.sellThroughRate,
          current_avg_price: result.avgSoldPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add to watchlist');
      }

      setWatching(true);
      setShowModal(false);
      setTimeout(() => setWatching(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleWatch}
        className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition ${
          watching
            ? 'bg-blue-100 text-blue-700'
            : isPro
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
      >
        {watching ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Watching!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {isPro ? 'Watch' : 'Watch (Pro)'}
          </>
        )}
      </button>

      {/* Watch modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Watch This Item</h3>
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
                <span>{result.sellThroughRate}% STR</span>
                <span>Avg ${result.avgSoldPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Alert type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert me when:
              </label>
              <div className="space-y-2">
                {[
                  { value: 'both' as const, label: 'Price drops or STR changes', desc: 'Get notified about any significant market change' },
                  { value: 'price_drop' as const, label: 'Price drops below target', desc: 'Set a target price and get alerted when it drops' },
                  { value: 'str_change' as const, label: 'Sell-through rate changes', desc: 'Get alerted when demand shifts significantly' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAlertType(opt.value)}
                    className={`w-full text-left rounded-lg p-3 border-2 transition ${
                      alertType === opt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <p className={`text-sm font-medium ${alertType === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target price (only for price_drop or both) */}
            {(alertType === 'price_drop' || alertType === 'both') && (
              <div className="mb-4">
                <label htmlFor="watch-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Target price {alertType === 'both' ? '(optional)' : ''}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    id="watch-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={`Current avg: $${result.avgSoldPrice.toFixed(2)}`}
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  We&apos;ll alert you when the average sold price drops below this
                </p>
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
                onClick={confirmWatch}
                disabled={saving}
                className="flex-1 py-2.5 px-4 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400 transition"
              >
                {saving ? 'Adding...' : 'Start Watching'}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">
              We&apos;ll check weekly and email you if anything changes significantly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
