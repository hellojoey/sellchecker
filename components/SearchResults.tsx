'use client';

import type { SellThroughResult } from '@/lib/sellthrough';
import { estimateDaysToSellRange } from '@/lib/sellthrough';
import SellThroughGauge from './SellThroughGauge';
import VerdictBadge from './VerdictBadge';
import SmartInsights from './SmartInsights';
import ConditionFilter, { type ConditionValue } from './ConditionFilter';
import PriceSpeedSlider from './PriceSpeedSlider';
import DealCalculator from './DealCalculator';

interface SearchResultsProps {
  result: SellThroughResult;
  loading?: boolean;
  isPro?: boolean;
  condition: ConditionValue;
  onConditionChange: (condition: ConditionValue) => void;
}

export default function SearchResults({
  result,
  loading = false,
  isPro = false,
  condition,
  onConditionChange,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-24 bg-gray-200 rounded-lg" />
          <div className="w-32 h-8 bg-gray-200 rounded-full" />
          <div className="grid grid-cols-3 gap-8 w-full max-w-md">
            <div className="h-16 bg-gray-200 rounded-lg" />
            <div className="h-16 bg-gray-200 rounded-lg" />
            <div className="h-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              &ldquo;{result.query}&rdquo;
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {result.totalResults.toLocaleString()} results on eBay
              {result.dataSource === 'estimated' && (
                <span className="text-xs text-amber-500 ml-1">(estimated)</span>
              )}
            </p>
          </div>
          {/* Condition Filter — greyed out for free */}
          <ConditionFilter
            value={condition}
            onChange={onConditionChange}
            disabled={!isPro}
          />
        </div>
      </div>

      <div className="p-6">
        {/* Gauge + Verdict */}
        <div className="flex flex-col items-center mb-4">
          <SellThroughGauge rate={result.sellThroughRate} verdict={result.verdict} />
          <div className="mt-3">
            <VerdictBadge verdict={result.verdict} showLabel size="lg" />
          </div>
        </div>

        {/* Smart Insights — inline below verdict */}
        <SmartInsights result={result} isPro={isPro} />

        {/* Stats Grid */}
        {(() => {
          const daysRange = estimateDaysToSellRange(result.medianSoldPrice, result.sellThroughRate);
          const daysDisplay = daysRange.low === daysRange.high
            ? `~${daysRange.low}d`
            : `${daysRange.low}-${daysRange.high}d`;
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <StatBox
                label="Sold (90d)"
                value={result.soldCount90d.toLocaleString()}
                icon="📦"
              />
              <StatBox
                label="Active"
                value={result.activeCount.toLocaleString()}
                icon="🏷️"
              />
              <StatBox
                label="Avg Price"
                value={`$${result.avgSoldPrice.toFixed(2)}`}
                icon="💰"
              />
              <StatBox
                label="Days to Sell"
                value={daysDisplay}
                icon="⏱️"
              />
            </div>
          );
        })()}

        {/* Price Range */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Price Range</p>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
              style={{
                left: `${(result.priceLow / result.priceHigh) * 30}%`,
                width: `${70 - (result.priceLow / result.priceHigh) * 30}%`,
              }}
            />
            {/* Median marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-green-600 rounded-full shadow"
              style={{ left: `${(result.medianSoldPrice / result.priceHigh) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500">${result.priceLow.toFixed(0)}</span>
            <span className="font-medium text-green-700">
              Median: ${result.medianSoldPrice.toFixed(2)}
            </span>
            <span className="text-gray-500">${result.priceHigh.toFixed(0)}</span>
          </div>
        </div>

        {/* ── Divider ── */}
        <hr className="border-gray-100 my-6" />

        {/* Price vs. Speed Slider — embedded in card */}
        <PriceSpeedSlider result={result} isPro={isPro} embedded />

        {/* ── Divider ── */}
        <hr className="border-gray-100 my-6" />

        {/* Deal Calculator — embedded in card */}
        <DealCalculator result={result} isPro={isPro} embedded />
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
