'use client';

import { useState, useMemo } from 'react';
import type { SellThroughResult } from '@/lib/sellthrough';

interface SourcingCalcProps {
  result: SellThroughResult;
}

const EBAY_FEE_RATE = 0.1325; // 13.25%
const EBAY_PER_ORDER = 0.30;  // $0.30

const ROI_PRESETS = [
  { label: '50%', value: 50 },
  { label: '100%', value: 100 },
  { label: '200%', value: 200 },
  { label: 'Custom', value: -1 },
];

export default function SourcingCalc({ result }: SourcingCalcProps) {
  const [targetRoi, setTargetRoi] = useState(100);
  const [customRoi, setCustomRoi] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(1); // 100% default
  const [estShipping, setEstShipping] = useState('8');

  const effectiveRoi = selectedPreset === 3 ? (parseFloat(customRoi) || 0) : targetRoi;
  const shippingCost = parseFloat(estShipping) || 0;

  // Calculate max purchase price at different price points
  const calculations = useMemo(() => {
    const prices = [
      { label: 'Low price', price: result.priceLow },
      { label: 'Median price', price: result.medianSoldPrice },
      { label: 'Avg price', price: result.avgSoldPrice },
      { label: 'High price', price: result.priceHigh },
    ];

    return prices.map(({ label, price }) => {
      const ebayFees = price * EBAY_FEE_RATE + EBAY_PER_ORDER;
      const netAfterFees = price - ebayFees - shippingCost;
      const maxCost = netAfterFees / (1 + effectiveRoi / 100);
      const profit = netAfterFees - maxCost;

      return {
        label,
        salePrice: price,
        ebayFees,
        maxCost: Math.max(0, maxCost),
        profit: Math.max(0, profit),
        viable: maxCost > 0,
      };
    });
  }, [result, effectiveRoi, shippingCost]);

  const medianCalc = calculations[1]; // Median is the most useful

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-3 border-b border-amber-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>🧮</span> Sourcing Calculator
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          What&apos;s the most you should pay?
        </p>
      </div>

      <div className="p-6">
        {/* Target ROI selector */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Target ROI
          </label>
          <div className="flex gap-2">
            {ROI_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPreset(idx);
                  if (preset.value > 0) setTargetRoi(preset.value);
                }}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition ${
                  selectedPreset === idx
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {selectedPreset === 3 && (
            <div className="mt-2 relative max-w-[140px]">
              <input
                type="number"
                min="0"
                placeholder="e.g. 150"
                value={customRoi}
                onChange={(e) => setCustomRoi(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          )}
        </div>

        {/* Shipping estimate */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Est. shipping cost
          </label>
          <div className="relative max-w-[140px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.50"
              min="0"
              value={estShipping}
              onChange={(e) => setEstShipping(e.target.value)}
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Big number — max you should pay at median */}
        <div className="bg-amber-50 rounded-xl p-5 text-center mb-5 border border-amber-100">
          <p className="text-xs text-amber-700 font-medium uppercase tracking-wider mb-1">
            Max you should pay (at median price)
          </p>
          <p className="text-4xl font-bold text-gray-900">
            {medianCalc.viable ? `$${medianCalc.maxCost.toFixed(2)}` : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Sell at ${medianCalc.salePrice.toFixed(2)} → ${medianCalc.profit.toFixed(2)} profit ({effectiveRoi}% ROI)
          </p>
        </div>

        {/* Breakdown by price point */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">All price points</p>
          {calculations.map((calc, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${
                idx === 1 ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
              }`}
            >
              <div>
                <span className="text-xs text-gray-500">{calc.label}</span>
                <span className="text-sm font-medium text-gray-900 ml-2">
                  ${calc.salePrice.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                {calc.viable ? (
                  <>
                    <span className="text-sm font-bold text-gray-900">
                      Pay ≤ ${calc.maxCost.toFixed(2)}
                    </span>
                    <span className="text-xs text-green-600 ml-2">
                      +${calc.profit.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Not viable</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 mt-3 text-center">
          Assumes eBay fees of 13.25% + $0.30 per order
        </p>
      </div>
    </div>
  );
}
