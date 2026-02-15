'use client';

import Link from 'next/link';

/* ─── Showcase Section Layout ─── */

interface ShowcaseSectionProps {
  title: string;
  description: string;
  mockup: React.ReactNode;
  reversed?: boolean;
}

function ShowcaseSection({ title, description, mockup, reversed }: ShowcaseSectionProps) {
  return (
    <div className="py-12 border-t border-gray-100">
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

function PriceSpeedMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>\ud83d\udcca</span> Price vs. Speed
        </h3>
      </div>
      <div className="p-6">
        {/* Price + Days */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-3xl font-bold text-gray-900">$45</div>
            <div className="text-xs text-gray-500">list price</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">~5d</div>
            <div className="text-xs text-gray-500">est. time to sell</div>
          </div>
        </div>

        {/* Speed bar */}
        <div className="mb-6">
          <span className="text-xs font-medium text-green-600">Fast</span>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Static slider */}
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded-lg" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-green-600 border-2 border-white rounded-full shadow-md"
            style={{ left: 'calc(40% - 10px)' }}
          />
          <div className="flex justify-between mt-3 text-xs text-gray-400">
            <span>$20</span>
            <span className="font-medium text-gray-600">Median: $45</span>
            <span>$95</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitorMockup() {
  const listings = [
    {
      title: 'Lululemon Define Jacket Size 6 Black',
      price: '$58.99',
      condition: 'Used',
      bg: 'from-purple-100 to-purple-200',
    },
    {
      title: 'Lululemon Define Jacket Nulu Dark Olive',
      price: '$72.00',
      condition: 'New',
      bg: 'from-green-100 to-green-200',
    },
    {
      title: 'Lululemon Define Jacket Luon Size 8',
      price: '$45.50',
      condition: 'Used',
      bg: 'from-blue-100 to-blue-200',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>\ud83c\udff7\ufe0f</span> Your Competition
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">6 active listings on eBay right now</p>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {listings.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <div
              className={`aspect-square bg-gradient-to-br ${item.bg} flex items-center justify-center`}
            >
              <span className="text-3xl opacity-40">\ud83d\udc55</span>
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

function DealCalcMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>\ud83d\udcb0</span> Deal Calculator
        </h3>
      </div>
      <div className="p-6">
        {/* Static COG */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-1.5">What did you pay?</div>
          <div className="max-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700">
            $5.00
          </div>
        </div>

        {/* Static weight buttons */}
        <div className="mb-5">
          <div className="text-xs font-medium text-gray-600 mb-1.5">Shipping weight</div>
          <div className="grid grid-cols-4 gap-2">
            {['Small', 'Medium', 'Large', 'Oversized'].map((w, i) => (
              <div
                key={w}
                className={`text-center rounded-lg py-2 border-2 text-xs font-medium ${
                  i === 1
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-100 text-gray-500'
                }`}
              >
                {w}
              </div>
            ))}
          </div>
        </div>

        {/* Static profit breakdown */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Median sale price</span>
            <span className="text-gray-900 font-medium">$52.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">eBay fees (13.25% + $0.30)</span>
            <span className="text-red-600">-$7.19</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cost of goods</span>
            <span className="text-red-600">-$5.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping (Medium)</span>
            <span className="text-red-600">-$9.93</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-sm font-bold">
            <span className="text-green-700">Net profit</span>
            <span className="text-green-700">$29.88</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Return on investment</span>
            <span className="text-green-600 font-medium">+598% ROI</span>
          </div>
        </div>
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
            <span>\ud83d\udccb</span> Saved Searches
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {searches.map((item, i) => (
            <div key={i} className="px-6 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.query}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span className={`font-bold ${item.verdictColor}`}>{item.verdict}</span>
                  <span>\u00b7</span>
                  <span>{item.rate}</span>
                  <span>\u00b7</span>
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
            <span>\ud83e\uddee</span> Sourcing Calculator
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

/* ─── Main Component ─── */

export default function ProFeatureCatalog() {
  const sections: ShowcaseSectionProps[] = [
    {
      title: 'Smart Insights',
      description:
        'Get contextual, actionable tips on every search. Know instantly whether to buy, pass, or wait for a better deal.',
      mockup: <InsightsMockup />,
    },
    {
      title: 'Competitor Check',
      description:
        'See what your competition is listing right now. View their prices, conditions, and photos to price yours competitively.',
      mockup: <CompetitorMockup />,
      reversed: true,
    },
    {
      title: 'Saved Searches & Sourcing',
      description:
        'Save any search with your cost of goods. Build a sourcing list you can reference while you shop. Track profitability at a glance.',
      mockup: <SavedSearchesMockup />,
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
      <div className="text-center py-12 border-t border-gray-100">
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
