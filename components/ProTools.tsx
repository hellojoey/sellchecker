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
  // Create 5 price brackets spanning the range
  const range = high - low;
  if (range <= 0) return [];

  const step = range / 5;
  const brackets = [];

  for (let i = 0; i < 5; i++) {
    const bracketLow = Math.round(low + step * i);
    const bracketHigh = Math.round(low + step * (i + 1));
    const midpoint = (bracketLow + bracketHigh) / 2;

    // Estimate speed: items priced below median sell faster
    // Items well below median: ~3-5 days
    // Items at median: ~7-10 days
    // Items above median: ~14-21+ days
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
  const [selectedBracketIdx, setSelectedBracketIdx] = useState(2); // Start at middle
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

  // Locked overlay for free users
  if (!isPro) {
    return (
      <div className="relative mt-6">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center">
          <div className="text-center p-6">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pro Tools</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-xs">
              Unlock the pricing slider, profit calculator, and shipping estimator with Pro.
            </p>
            <a
              href="/pricing"
              className="inline-block bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 transition"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>

        {/* Blurred preview behind the lock */}
        <div className="filter blur-[3px] pointer-events-none select-none">
          <ProToolsContent
            brackets={brackets}
            selectedBracketIdx={selectedBracketIdx}
            selectedBracket={selectedBracket}
            onBracketChange={() => {}}
            costOfGoods=""
            onCostChange={() => {}}
            shippingCost=""
            onShippingChange={() => {}}
            selectedWeight={0}
            onWeightChange={() => {}}
            salePrice={salePrice}
            ebayFees={ebayFees}
            netProfit={netProfit}
            roi={roi}
            shippingRate={shippingRate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <ProToolsContent
        brackets={brackets}
        selectedBracketIdx={selectedBracketIdx}
        selectedBracket={selectedBracket}
        onBracketChange={setSelectedBracketIdx}
        costOfGoods={costOfGoods}
        onCostChange={setCostOfGoods}
        shippingCost={shippingCost}
        onShippingChange={setShippingCost}
        selectedWeight={selectedWeight}
        onWeightChange={setSelectedWeight}
        salePrice={salePrice}
        ebayFees={ebayFees}
        netProfit={netProfit}
        roi={roi}
        shippingRate={shippingRate}
      />
    </div>
  );
}

// Extracted inner content so we can render it blurred or normal
function ProToolsContent({
  brackets,
  selectedBracketIdx,
  selectedBracket,
  onBracketChange,
  costOfGoods,
  onCostChange,
  shippingCost,
  onShippingChange,
  selectedWeight,
  onWeightChange,
  salePrice,
  ebayFees,
  netProfit,
  roi,
  shippingRate,
}: {
  brackets: ReturnType<typeof generatePriceBrackets>;
  selectedBracketIdx: number;
  selectedBracket: ReturnType<typeof generatePriceBrackets>[0];
  onBracketChange: (idx: number) => void;
  costOfGoods: string;
  onCostChange: (val: string) => void;
  shippingCost: string;
  onShippingChange: (val: string) => void;
  selectedWeight: number;
  onWeightChange: (idx: number) => void;
  salePrice: number;
  ebayFees: number;
  netProfit: number;
  roi: number;
  shippingRate: typeof SHIPPING_RATES[0];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-b border-green-100 flex items-center gap-2">
        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">PRO</span>
        <h3 className="text-sm font-semibold text-gray-900">Reseller Tools</h3>
      </div>

      <div className="p-6 space-y-8">
        {/* ━━━ PRICING SLIDER ━━━ */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>📊</span> Price vs. Speed
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Choose your price point — see how fast it&apos;ll likely sell
          </p>

          {/* Price brackets as clickable bars */}
          <div className="space-y-2">
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
                  onClick={() => onBracketChange(idx)}
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

          {selectedBracket && (
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

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* ━━━ PROFIT CALCULATOR ━━━ */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>💰</span> Profit Calculator
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Enter what you paid — see your net profit after eBay fees
          </p>

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
                  onChange={(e) => onCostChange(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
            {parseFloat(costOfGoods) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cost of goods</span>
                <span className="text-red-600">-${parseFloat(costOfGoods).toFixed(2)}</span>
              </div>
            )}
            {parseFloat(shippingCost) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping cost</span>
                <span className="text-red-600">-${parseFloat(shippingCost).toFixed(2)}</span>
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
            {parseFloat(costOfGoods) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Return on investment</span>
                <span className={roi >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(0)}% ROI
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* ━━━ SHIPPING ESTIMATOR ━━━ */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>📦</span> Shipping Estimator
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Estimate shipping cost by package size — factors into your profit above
          </p>

          {/* Weight selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {SHIPPING_RATES.map((rate, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onWeightChange(idx);
                  // Auto-fill shipping cost with the average
                  const avg = (rate.local + rate.national) / 2;
                  onShippingChange(avg.toFixed(2));
                }}
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

          {/* Shipping rates table */}
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

          {/* Manual shipping override */}
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
                onChange={(e) => onShippingChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
