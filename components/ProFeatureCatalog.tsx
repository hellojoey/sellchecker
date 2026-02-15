'use client';

import Link from 'next/link';

/* ─── Showcase Section Layout ─── */

interface ShowcaseSectionProps {
  title: string;
  description: string;
  mockup: React.ReactNode;
  reversed?: boolean;
  bgColor?: string;
}

function ShowcaseSection({ title, description, mockup, reversed, bgColor }: ShowcaseSectionProps) {
  return (
    <div className={`py-12 ${bgColor || ''} rounded-2xl px-4 sm:px-8 mb-4`}>
      <div
        className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12`}
      >
        {/* Text side */}
        <div className="md:w-2/5 text-center md:text-left">
          <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">{description}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition"
          >
            Start Free Trial
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mockup side */}
        <div className="md:w-3/5 w-full">{mockup}</div>
      </div>
    </div>
  );
}

/* ─── Static Mockups ─── */

function InsightsMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-2.5">
      {[
        { emoji: '\ud83d\udd25', text: "This moves fast \u2014 don\u2019t overthink it, just grab it." },
        { emoji: '\ud83c\udfaf', text: 'Only 12 listed right now \u2014 you could set your own price.' },
        { emoji: '\ud83d\udcb0', text: 'Strong margin potential even after fees and shipping.' },
      ].map((row, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 bg-green-50 rounded-xl px-3.5 py-3 border border-green-100"
        >
          <span className="text-lg shrink-0 mt-0.5">{row.emoji}</span>
          <p className="text-sm text-gray-700 leading-snug">{row.text}</p>
        </div>
      ))}
    </div>
  );
}

function CompetitorMockup() {
  const listings = [
    {
      title: 'Lululemon Define Jacket Size 6 Black',
      price: '$58.99',
      condition: 'Used',
      gradient: 'from-purple-200 to-purple-300',
      icon: '\ud83e\udde5',
    },
    {
      title: 'Lululemon Define Jacket Nulu Dark Olive',
      price: '$72.00',
      condition: 'New',
      gradient: 'from-green-200 to-green-300',
      icon: '\ud83e\udde5',
    },
    {
      title: 'Lululemon Define Jacket Luon Size 8',
      price: '$45.50',
      condition: 'Used',
      gradient: 'from-blue-200 to-blue-300',
      icon: '\ud83e\udde5',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>{'\ud83c\udff7\ufe0f'}</span> Your Competition
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">6 active listings on eBay right now</p>
        </div>
        <span className="text-xs text-green-600 font-medium">View all on eBay &rarr;</span>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {listings.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <div
              className={`aspect-square bg-gradient-to-br ${item.gradient} flex items-center justify-center relative`}
            >
              <span className="text-4xl">{item.icon}</span>
              {/* Simulated photo overlay bars */}
              <div className="absolute bottom-2 left-2 right-2 space-y-1">
                <div className="h-1 bg-white/40 rounded-full w-3/4" />
                <div className="h-1 bg-white/30 rounded-full w-1/2" />
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-tight mb-1.5">
                {item.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">{item.price}</span>
                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  {item.condition}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavedSearchesMockup() {
  const searches = [
    { query: 'Lululemon Define Jacket', verdict: 'BUY', rate: '68%', cog: '$5.00', profit: '+$29.88', verdictColor: 'text-green-600' },
    { query: 'Nike Dunk Low Panda', verdict: 'MAYBE', rate: '34%', cog: '$45.00', profit: '+$22.50', verdictColor: 'text-yellow-600' },
    { query: 'Vintage Pyrex Mixing Bowl', verdict: 'BUY', rate: '72%', cog: '$3.00', profit: '+$18.40', verdictColor: 'text-green-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Saved searches list */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>{'\ud83d\udccb'}</span> Saved Searches
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {searches.map((item, i) => (
            <div key={i} className="px-6 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.query}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span className={`font-bold ${item.verdictColor}`}>{item.verdict}</span>
                  <span>{'\u00b7'}</span>
                  <span>{item.rate}</span>
                  <span>{'\u00b7'}</span>
                  <span>COG: {item.cog}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-green-700">{item.profit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sourcing calc big number */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-3 border-b border-amber-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>{'\ud83e\uddee'}</span> Sourcing Calculator
          </h3>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 rounded-xl p-5 text-center border border-amber-100">
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wider mb-1">
              Max you should pay (at median)
            </p>
            <p className="text-4xl font-bold text-gray-900">$14.22</p>
            <p className="text-xs text-gray-500 mt-1">
              Sell at $52.00 &rarr; $14.22 profit (100% ROI)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SEOTitleMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>{'\u2728'}</span> AI Title Optimizer
        </h3>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          COMING SOON
        </span>
      </div>
      <div className="p-6 space-y-4">
        {/* Original title */}
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Your title</p>
          <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-600 border border-gray-200">
            lululemon define jacket size 6 black used
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Optimized title — blurred */}
        <div>
          <p className="text-[10px] font-medium text-green-600 uppercase tracking-wider mb-1.5">SEO optimized</p>
          <div className="relative">
            <div className="blur-[4px] select-none pointer-events-none bg-green-50 rounded-lg px-3 py-2.5 text-sm text-green-800 border border-green-200 font-medium">
              Lululemon Define Jacket Nulu Size 6 Black | Women&apos;s Athletic Full Zip | EUC
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-green-700 bg-white/80 px-2.5 py-1 rounded-full border border-green-200">
                Upgrade to see
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function ProFeatureCatalog() {
  const sections: ShowcaseSectionProps[] = [
    {
      title: 'Smart Insights',
      description:
        'Get contextual, actionable tips on every search. Know instantly whether to buy, pass, or wait for a better deal.',
      mockup: <InsightsMockup />,
      bgColor: 'bg-green-50/50',
    },
    {
      title: 'Competitor Check',
      description:
        'See what your competition is listing right now. View their prices, conditions, and photos to price yours competitively.',
      mockup: <CompetitorMockup />,
      reversed: true,
      bgColor: 'bg-blue-50/50',
    },
    {
      title: 'Saved Searches & Sourcing',
      description:
        'Save any search with your cost of goods. Build a sourcing list you can reference while you shop. Track profitability at a glance.',
      mockup: <SavedSearchesMockup />,
      bgColor: 'bg-amber-50/50',
    },
    {
      title: 'AI-Optimized Listing Titles',
      description:
        'Get SEO-friendly titles that help your listings rank higher and sell faster. Coming soon to Pro.',
      mockup: <SEOTitleMockup />,
      reversed: true,
      bgColor: 'bg-purple-50/50',
    },
  ];

  return (
    <div className="mt-12">
      {/* Section header */}
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
          PRO
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Unlock the full toolkit
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Pro members get powerful tools to source smarter and profit more on every flip.
        </p>
      </div>

      {/* Feature showcase sections */}
      {sections.map((section) => (
        <ShowcaseSection key={section.title} {...section} />
      ))}

      {/* Final CTA */}
      <div className="text-center py-12">
        <Link
          href="/pricing"
          className="inline-block bg-green-600 text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-600/20"
        >
          Start 7-day Free Trial &mdash; $10/mo
        </Link>
        <p className="text-xs text-gray-500 mt-3">Cancel anytime. No credit card for trial.</p>
      </div>
    </div>
  );
}
