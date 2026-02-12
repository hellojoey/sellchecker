'use client';

import { useState, useMemo } from 'react';
import type { SellThroughResult } from '@/lib/sellthrough';

interface ProToolsProps {
  result: SellThroughResult;
  isPro: boolean;
}

// eBay fee structure (2024/2025 standard)
const EBAY_FINAL_VALUE_FEE = 0.1325; // 13.25% for most categories
const EBAY_PER_ORDER_FEE = 0.30; // $0.30 per order

// Price bracket helpers
function generatePriceBrackets(low: number, high: number, median: number) {
  const range = high - low;
  if (range <= 0) return [];

  const step = range / 5;
  const brackets = [];

  for (let i = 0; i < 5; i++) {
    const bracketLow = Math.round(low + step * i);
    const bracketHigh = Math.round(low + step * (i + 1));
    const midpoint = (bracketLow + bracketHigh) / 2;

    const priceRatio = midpoint / median;
    let estDays: number;
    let speed: 'fast' | 'moderate' | 'slow';

    if (priceRatio <= 0.7) {
      estDays = Math.round(2 + Math.random() * 3);
      speed = 'fast';
    } else if (priceRatio <= 1.0) {
      estDays = Math.round(5 + Math.random() * 5);
      speed = 'fast';
    } else if (priceRatio <= 1.3) {
      estDays = Math.round(10 + Math.random() * 7);
      speed = 'moderate';
    } else {
      estDays = Math.round(18 + Math.random() * 14);
      speed = 'slow';
    }

    brackets.push({
      low: bracketLow,
      high: bracketHigh,
      midpoint: Math.round(midpoint),
      estDays,
      speed,
    });
  }

  return brackets;
}

// USPS shipping estimates by weight + distance
const SHIPPING_RATES = [
  { label: 'Small (under 1 lb)', weight: 'light', local: 4.50, regional: 5.80, national: 7.20 },
  { label: 'Medium (1-3 lbs)', weight: 'medium', local: 7.50, regional: 9.80, national: 12.50 },
  { label: 'Large (3-5 lbs)', weight: 'heavy', local: 9.50, regional: 13.50, national: 17.00 },
  { label: 'Oversized (5+ lbs)', weight: 'oversized', local: 14.00, regional: 19.50, national: 25.00 },
];

export default function ProTools({ result, isPro }: ProToolsProps) {
  const [selectedBracketIdx, setSelectedBracketIdx] = useState(2);
  const [costOfGoods, setCostOfGoods] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [selectedWeight, setSelectedWeight] = useState(0);

  const brackets = useMemo(
    () => generatePriceBrackets(result.priceLow, result.priceHigh, result.medianSoldPrice),
    [result.priceLow, result.priceHigh, result.medianSoldPrice]
  );

  const selectedBracket = brackets[selectedBracketIdx];

  // Profit calculation
  const salePrice = selectedBracket?.midpoint || result.medianSoldPrice;
  const costNum = parseFloat(costOfGoods) || 0;
  const shippingNum = parseFloat(shippingCost) || 0;
  const ebayFees = salePrice * EBAY_FINAL_VALUE_FEE + EBAY_PER_ORDER_FEE;
  const netProfit = salePrice - costNum - shippingNum - ebayFees;
  const roi = costNum > 0 ? ((netProfit / costNum) * 100) : 0;

  const shippingRate = SHIPPING_RATES[selectedWeight];

  return (
    <div className="mt-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with PRO badge */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">PRO</span>
              <h3 className="text-sm font-semibold text-gray-900">Reseller Tools</h3>
            </div>
            {!isPro && (
              <a
                href="/pricing"
                className="text-xs font-semibold text-green-700 hover:text-green-800 transition flex items-center gap-1"
              >
                Unlock all tools
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Upgrade banner for free users */}
        {!isPro && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Upgrade to Pro for full access</p>
                <p className="text-xs text-green-100 mt-0.5">
                  Unlimited SellChecks + Saved Searches + all tools below
                </p>
              </div>
              <a
                href="/pricing"
                className="shrink-0 bg-white text-green-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-50 transition"
              >
                Start Free Trial
              </a>
            </div>
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* ━━━ PRICING SLIDER ━━━ */}
          <div className={!isPro ? 'relative' : ''}>
            <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <span>📊</span> Price vs. Speed
              {!isPro && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">PRO</span>}
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Choose your price point — see how fast it&apos;ll likely sell
            </p>

            <div className={`space-y-2 ${!isPro ? 'opacity-60 pointer-events-none select-none' : ''}`}>
              {brackets.map((bracket, idx) => {
                const isSelected = idx === selectedBracketIdx;
                const barWidth =
                  bracket.speed === 'fast' ? '85%' :
                  bracket.speed === 'moderate' ? '55%' : '30%';
                const barColor =
                  bracket.speed === 'fast' ? 'bg-green-500' :
                  bracket.speed === 'moderate' ? 'bg-yellow-500' : 'bg-red-400';

                return (
                  <button
                    key={idx}
                    onClick={() => isPro && setSelectedBracketIdx(idx)}
                    disabled={!isPro}
                    className={`w-full text-left rounded-lg p-3 border-2 transition ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-900">
                        ${bracket.low} – ${bracket.high}
                      </span>
                      <span className={`text-xs font-medium ${
                        bracket.speed === 'fast' ? 'text-green-700' :
                        bracket.speed === 'moderate' ? 'text-yellow-700' : 'text-red-600'
                      }`}>
                        ~{bracket.estDays} days
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-300`}
                        style={{ width: barWidth }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedBracket && isPro && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">
                  At <strong className="text-gray-900">${selectedBracket.low}–${selectedBracket.high}</strong>,
                  expect to sell in roughly <strong className={
                    selectedBracket.speed === 'fast' ? 'text-green-700' :
                    selectedBracket.speed === 'moderate' ? 'text-yellow-700' : 'text-red-600'
                  }>~{selectedBracket.estDays} days</strong>
                </p>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* ━━━ PROFIT CALCULATOR ━━━ */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <span>💰</span> Profit Calculator
              {!isPro && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">PRO</span>}
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Enter what you paid — see your net profit after eBay fees
            </p>

            <div className={`${!isPro ? 'opacity-60 pointer-events-none select-none' : ''}`}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Sale price (selected)
                  </label>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 border border-gray-200">
                    ${salePrice.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label htmlFor="costOfGoods" className="block text-xs font-medium text-gray-600 mb-1">
                    Your cost (what you paid)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id="costOfGoods"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={costOfGoods}
                      onChange={(e) => isPro && setCostOfGoods(e.target.value)}
                      disabled={!isPro}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Fee breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sale price</span>
                  <span className="text-gray-900">${salePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">eBay fees (13.25% + $0.30)</span>
                  <span className="text-red-600">-${ebayFees.toFixed(2)}</span>
                </div>
                {costNum > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost of goods</span>
                    <span className="text-red-600">-${costNum.toFixed(2)}</span>
                  </div>
                )}
                {shippingNum > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping cost</span>
                    <span className="text-red-600">-${shippingNum.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between text-sm font-bold">
                  <span className={netProfit >= 0 ? 'text-green-700' : 'text-red-700'}>
                    Net profit
                  </span>
                  <span className={netProfit >= 0 ? 'text-green-700' : 'text-red-700'}>
                    {netProfit >= 0 ? '' : '-'}${Math.abs(netProfit).toFixed(2)}
                  </span>
                </div>
                {costNum > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Return on investment</span>
                    <span className={roi >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(0)}% ROI
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* ━━━ SHIPPING ESTIMATOR ━━━ */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <span>📦</span> Shipping Estimator
              {!isPro && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">PRO</span>}
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Estimate shipping cost by package size — factors into your profit above
            </p>

            <div className={`${!isPro ? 'opacity-60 pointer-events-none select-none' : ''}`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {SHIPPING_RATES.map((rate, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!isPro) return;
                      setSelectedWeight(idx);
                      const avg = (rate.local + rate.national) / 2;
                      setShippingCost(avg.toFixed(2));
                    }}
                    disabled={!isPro}
                    className={`text-left rounded-lg p-2.5 border-2 transition text-xs ${
                      idx === selectedWeight
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{rate.label}</div>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Local</div>
                    <div className="text-sm font-semibold text-gray-900">${shippingRate.local.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Regional</div>
                    <div className="text-sm font-semibold text-gray-900">${shippingRate.regional.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">National</div>
                    <div className="text-sm font-semibold text-gray-900">${shippingRate.national.toFixed(2)}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Estimated USPS rates · Actual cost may vary
                </p>
              </div>

              <div className="mt-3">
                <label htmlFor="shippingCost" className="block text-xs font-medium text-gray-600 mb-1">
                  Or enter your exact shipping cost
                </label>
                <div className="relative max-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    id="shippingCost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={shippingCost}
                    onChange={(e) => isPro && setShippingCost(e.target.value)}
                    disabled={!isPro}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ━━━ SAVED SEARCHES TEASER (for free users) ━━━ */}
          {!isPro && (
            <>
              <hr className="border-gray-100" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <span>📋</span> Saved Searches
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">PRO</span>
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Save items with your cost — build a sourcing list you can reference from the thrift store
                </p>
                <div className="bg-gray-50 rounded-xl p-4 opacity-60">
                  <div className="space-y-2">
                    {['Lululemon Define Jacket', 'Nike Dunk Low', 'Coach Tabby Bag'].map((item) => (
                      <div key={item} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-sm text-gray-700">{item}</span>
                        <span className="text-xs text-gray-400">COG: $--</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ━━━ UNLIMITED SELLCHECKS TEASER (for free users) ━━━ */}
          {!isPro && (
            <>
              <hr className="border-gray-100" />
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-2 mb-2">
                  <span className="text-lg">🔓</span>
                  <span className="text-sm font-semibold text-green-800">Unlimited SellChecks</span>
                </div>
                <p className="text-xs text-gray-500">
                  Free users get 5 searches/day. Pro members get unlimited — never worry about running out at the thrift store.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom upgrade CTA for free users */}
        {!isPro && (
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 text-center">
            <a
              href="/pricing"
              className="inline-block bg-green-600 text-white text-sm font-semibold px-8 py-2.5 rounded-xl hover:bg-green-700 transition"
            >
              Start 7-day Free Trial — $10/mo
            </a>
            <p className="text-xs text-gray-400 mt-1.5">Cancel anytime · No credit card for trial</p>
          </div>
        )}
      </div>
    </div>
  );
}
