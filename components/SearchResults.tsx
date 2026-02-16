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
      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              &ldquo;{result.query}&rdquo;
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {result.totalResults.toLocaleString()} results on eBay
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

      {/* Estimated data warning banner */}
      {result.dataSource === 'estimated' && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 sm:px-6 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs text-amber-700">
            Sold data is estimated. Actual figures may vary.
          </p>
        </div>
      )}

      <div className="p-4 sm:p-6">
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

        {/* Price vs. Speed Slider (merged with price range bar) — embedded in card */}
        <div className="mt-6">
          <PriceSpeedSlider result={result} isPro={isPro} embedded />
        </div>

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
      <div className="text-base sm:text-lg mb-0.5">{icon}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
