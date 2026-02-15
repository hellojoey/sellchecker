'use client';

import { useState } from 'react';
import type { SellThroughResult } from '@/lib/sellthrough';

interface DealCalculatorProps {
  result: SellThroughResult;
  isPro?: boolean;
  embedded?: boolean;
}

// eBay fee structure (2024/2025 standard)
const EBAY_FVF = 0.1325; // 13.25% final value fee
const EBAY_ORDER_FEE = 0.30; // $0.30 per order

// USPS shipping estimates by weight
const SHIPPING_OPTIONS = [
  { label: 'Small', desc: 'Under 1 lb', local: 4.50, regional: 5.80, national: 7.20 },
  { label: 'Medium', desc: '1-3 lbs', local: 7.50, regional: 9.80, national: 12.50 },
  { label: 'Large', desc: '3-5 lbs', local: 9.50, regional: 13.50, national: 17.00 },
  { label: 'Oversized', desc: '5+ lbs', local: 14.00, regional: 19.50, national: 25.00 },
];

export default function DealCalculator({ result, isPro = false, embedded = false }: DealCalculatorProps) {
  const [costOfGoods, setCostOfGoods] = useState('');
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [shippingOverride, setShippingOverride] = useState('');

  const salePrice = result.medianSoldPrice;

  // --- Greyed-out preview for free users ---
  if (!isPro) {
    const exCOG = 5.00;
    const mediumRate = SHIPPING_OPTIONS[1];
    const exShipping = Math.round(((mediumRate.local + mediumRate.regional + mediumRate.national) / 3) * 100) / 100;
    const exFees = salePrice * EBAY_FVF + EBAY_ORDER_FEE;
    const exProfit = salePrice - exCOG - exShipping - exFees;
    const exROI = (exProfit / exCOG) * 100;

    const content = (
      <>
        {/* Section header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>💰</span> Deal Calculator
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">PRO</span>
          </h3>
          <a href="/pricing" className="text-xs text-green-600 font-medium hover:underline">
            Upgrade to unlock
          </a>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Enter what you paid and see your real profit after eBay fees and shipping
        </p>

        {/* Greyed-out content */}
        <div className="space-y-4">
          {/* COG Input — disabled */}
          <div>
            <div className="block text-xs font-medium text-gray-400 mb-1.5">What did you pay?</div>
            <div className="relative max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">$</span>
              <input
                type="text"
                disabled
                placeholder="Upgrade to Pro"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Weight buttons — greyed out, non-interactive */}
          <div>
            <div className="block text-xs font-medium text-gray-400 mb-1.5">Estimated shipping weight</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SHIPPING_OPTIONS.map((opt, idx) => (
                <div
                  key={idx}
                  className={`text-left rounded-lg p-2.5 border-2 text-xs opacity-50 cursor-not-allowed ${
                    idx === 1 ? 'border-gray-300 bg-gray-50' : 'border-gray-100'
                  }`}
                >
                  <div className="font-medium text-gray-500">{opt.label}</div>
                  <div className="text-gray-400">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Static profit breakdown — muted tones */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Median sale price</span>
              <span className="text-gray-500 font-medium">${salePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">eBay fees (13.25% + $0.30)</span>
              <span className="text-gray-400">-${exFees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cost of goods</span>
              <span className="text-gray-400">-${exCOG.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Shipping (Medium)</span>
              <span className="text-gray-400">-${exShipping.toFixed(2)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-400">Net profit</span>
              <span className="text-gray-400">
                {exProfit >= 0 ? '' : '-'}${Math.abs(exProfit).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Return on investment</span>
              <span className="text-gray-400">+{exROI.toFixed(0)}% ROI</span>
            </div>
          </div>
        </div>
      </>
    );

    if (embedded) return content;

    return (
      <div className="mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
          {content}
        </div>
      </div>
    );
  }

  // --- Interactive version for Pro users ---
  const costNum = parseFloat(costOfGoods) || 0;

  let shippingCost = 0;
  if (shippingOverride) {
    shippingCost = parseFloat(shippingOverride) || 0;
  } else if (selectedWeight !== null) {
    const rate = SHIPPING_OPTIONS[selectedWeight];
    shippingCost = Math.round(((rate.local + rate.regional + rate.national) / 3) * 100) / 100;
  }

  const ebayFees = salePrice * EBAY_FVF + EBAY_ORDER_FEE;
  const netProfit = salePrice - costNum - shippingCost - ebayFees;
  const roi = costNum > 0 ? ((netProfit / costNum) * 100) : 0;
  const hasCost = costNum > 0;

  const proContent = (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>💰</span> Deal Calculator
        </h3>
        <p className="text-xs text-gray-500">
          Enter what you paid — see your real profit
        </p>
      </div>

      <div className="space-y-5">
        {/* COG Input */}
        <div>
          <label htmlFor="deal-cog" className="block text-xs font-medium text-gray-600 mb-1.5">
            What did you pay?
          </label>
          <div className="relative max-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              id="deal-cog"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 5.00"
              value={costOfGoods}
              onChange={(e) => setCostOfGoods(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Shipping Weight Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Estimated shipping weight
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SHIPPING_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedWeight(idx);
                  setShippingOverride('');
                }}
                className={`text-left rounded-lg p-2.5 border-2 transition text-xs ${
                  idx === selectedWeight
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900">{opt.label}</div>
                <div className="text-gray-400">{opt.desc}</div>
              </button>
            ))}
          </div>

          {selectedWeight !== null && (
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              <span>Est. ${shippingCost.toFixed(2)} avg</span>
              <span className="text-gray-300">|</span>
              <span>Local ${SHIPPING_OPTIONS[selectedWeight].local.toFixed(2)}</span>
              <span>Nat&apos;l ${SHIPPING_OPTIONS[selectedWeight].national.toFixed(2)}</span>
            </div>
          )}

          <div className="mt-2">
            <div className="relative max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Or enter exact shipping"
                value={shippingOverride}
                onChange={(e) => {
                  setShippingOverride(e.target.value);
                  if (e.target.value) setSelectedWeight(null);
                }}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Profit Breakdown */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Median sale price</span>
            <span className="text-gray-900 font-medium">${salePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">eBay fees (13.25% + $0.30)</span>
            <span className="text-red-600">-${ebayFees.toFixed(2)}</span>
          </div>
          {hasCost && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cost of goods</span>
              <span className="text-red-600">-${costNum.toFixed(2)}</span>
            </div>
          )}
          {shippingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-red-600">-${shippingCost.toFixed(2)}</span>
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
          {hasCost && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Return on investment</span>
              <span className={roi >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(0)}% ROI
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (embedded) return proContent;

  return (
    <div className="mt-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
        {proContent}
      </div>
    </div>
  );
}
