"use client";

import { Gauge } from "./Gauge";

export interface SearchResult {
  soldCount90d: number;
  activeCount: number;
  sellThroughRate: number;
  avgSoldPrice: number;
  medianSoldPrice: number;
  priceLow: number;
  priceHigh: number;
  avgDaysToSell: number;
  verdict: "BUY" | "MAYBE" | "PASS";
}

interface ResultCardProps {
  result: SearchResult;
  query: string;
}

const VERDICT_CONFIG = {
  BUY: {
    bg: "bg-emerald-500",
    border: "border-emerald-200",
    label: "STRONG BUY",
  },
  MAYBE: {
    bg: "bg-yellow-500",
    border: "border-yellow-200",
    label: "MAYBE",
  },
  PASS: {
    bg: "bg-red-500",
    border: "border-red-200",
    label: "PASS",
  },
};

export function ResultCard({ result, query }: ResultCardProps) {
  const verdict = VERDICT_CONFIG[result.verdict];
  const priceRange = result.priceHigh - result.priceLow;
  const medianPosition =
    ((result.medianSoldPrice - result.priceLow) / priceRange) * 90 + 5;

  return (
    <div
      className={`bg-white rounded-2xl border-2 ${verdict.border} shadow-lg overflow-hidden max-w-lg mx-auto`}
    >
      {/* Verdict Header */}
      <div className={`${verdict.bg} px-5 py-3 flex items-center justify-between`}>
        <span className="text-white font-bold text-sm tracking-wide">
          {verdict.label}
        </span>
        <span className="text-white text-xs opacity-80">eBay · Last 90 days</span>
      </div>

      <div className="p-5">
        <p className="text-sm text-gray-500 mb-4 truncate">"{query}"</p>

        {/* Gauge + Stats */}
        <div className="flex items-start gap-5">
          <Gauge rate={result.sellThroughRate} />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sold (90d)</span>
              <span className="font-bold text-gray-800">
                {result.soldCount90d.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active listings</span>
              <span className="font-bold text-gray-800">
                {result.activeCount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg sold price</span>
              <span className="font-bold text-emerald-600">
                ${result.avgSoldPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg days to sell</span>
              <span className="font-bold text-gray-800">
                {result.avgDaysToSell} days
              </span>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="mt-4 bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-2">Price range</p>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div className="absolute h-2 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
              style={{ left: "5%", right: "5%" }} />
            <div className="absolute -top-5 text-xs font-medium text-gray-600" style={{ left: "5%" }}>
              ${result.priceLow}
            </div>
            <div className="absolute -top-5 text-xs font-medium text-emerald-600"
              style={{ left: `${medianPosition}%` }}>
              ${result.medianSoldPrice}
            </div>
            <div className="absolute -top-5 text-xs font-medium text-gray-600 right-0" style={{ right: "5%" }}>
              ${result.priceHigh}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
