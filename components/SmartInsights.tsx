'use client';

import { useMemo } from 'react';
import type { SellThroughResult } from '@/lib/sellthrough';
import { generateInsights, type Insight } from '@/lib/insights';

interface SmartInsightsProps {
  result: SellThroughResult;
  isPro: boolean;
}

export default function SmartInsights({ result, isPro }: SmartInsightsProps) {
  const insights = useMemo(() => generateInsights(result), [result]);

  if (insights.length === 0) return null;

  if (isPro) {
    // Pro users: show all insights clearly
    return (
      <div className="mt-4 space-y-2">
        {insights.map((insight, i) => (
          <InsightRow key={i} insight={insight} />
        ))}
      </div>
    );
  }

  // Free users: show first insight visible, blur the rest as a teaser
  const teaserInsight = insights[0];
  const remainingInsights = insights.slice(1);

  return (
    <div className="mt-4 space-y-2">
      {/* First insight — visible */}
      <InsightRow insight={teaserInsight} />

      {/* Remaining insights — blurred with lock overlay */}
      {remainingInsights.length > 0 && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-3">
          <div className="blur-[6px] select-none pointer-events-none space-y-2">
            {remainingInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg shrink-0">{insight.emoji}</span>
                <p className="text-sm text-gray-700">{insight.text}</p>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/30">
            <a
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-white border border-green-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-green-50 transition"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Unlock all insights with Pro
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  return (
    <div className="flex items-start gap-2 bg-green-50 rounded-xl px-3 py-2.5 border border-green-100">
      <span className="text-lg shrink-0 mt-0.5">{insight.emoji}</span>
      <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
    </div>
  );
}
