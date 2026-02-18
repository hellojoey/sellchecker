'use client';

import { useRouter } from 'next/navigation';
import VerdictBadge from '@/components/VerdictBadge';
import SearchBar from '@/components/SearchBar';

const STEPS = [
  {
    number: '01',
    title: 'Search any item',
    description: 'Type in a brand, product, model, or category. Be as specific as possible for the best results — include size, color, condition, or year.',
    examples: '"Nike SB Dunk Jarritos Size 10"  •  "Vintage Pyrex Mixing Bowls"  •  "KitchenAid Artisan Mixer Red"',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: 'from-green-500 to-emerald-600',
  },
  {
    number: '02',
    title: 'We analyze the market',
    description: 'SellChecker pulls real-time data from eBay — both active listings and recently sold items. We combine the official eBay API with sold listing data to calculate how quickly items are actually selling.',
    detail: 'Active listings tell us supply. Sold listings tell us demand. The ratio between them is your sell-through rate.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'from-blue-500 to-indigo-600',
  },
  {
    number: '03',
    title: 'Get your verdict',
    description: 'Based on the sell-through rate, you get a clear verdict so you can decide in seconds whether to source that item.',
    detail: null,
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-purple-500 to-violet-600',
    verdicts: true,
  },
  {
    number: '04',
    title: 'Deep-dive with Pro tools',
    description: 'Pro users unlock powerful tools to analyze even further before making a sourcing decision.',
    tools: [
      { name: 'Deal Calculator', desc: 'Enter your buy price, fees, and shipping to see exact profit margins' },
      { name: 'Comp Check', desc: 'Visual grid of real eBay listings to compare pricing and competition' },
      { name: 'STR Slider', desc: 'Drag to see how sell-through rate changes with different listing counts' },
      { name: 'Save & Export', desc: 'Build a searchable portfolio and export to CSV for tracking' },
    ],
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    color: 'from-amber-500 to-orange-600',
  },
  {
    number: '05',
    title: 'Source smarter, every time',
    description: 'Build up your search history, track your wins, and develop an eye for what sells. SellChecker remembers your searches so you can reference past lookups and spot patterns over time.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'from-rose-500 to-pink-600',
  },
];

export default function HowItWorksPage() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          How SellChecker Works
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From search to sourcing decision in seconds. Here&apos;s how we help you know before you buy.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8 mb-16">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4 sm:gap-6">
                {/* Step icon */}
                <div className="shrink-0">
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-sm`}>
                    {step.icon}
                  </div>
                  <p className="text-[10px] font-bold text-gray-300 text-center mt-1.5">STEP {step.number}</p>
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

                  {/* Examples for step 1 */}
                  {step.examples && (
                    <div className="mt-3 bg-gray-50 rounded-lg px-4 py-2.5">
                      <p className="text-xs text-gray-500 italic">{step.examples}</p>
                    </div>
                  )}

                  {/* Detail text */}
                  {step.detail && (
                    <p className="text-sm text-gray-500 mt-2 italic">{step.detail}</p>
                  )}

                  {/* Verdict badges for step 3 */}
                  {step.verdicts && (
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-2.5">
                        <VerdictBadge verdict="STRONG_BUY" size="sm" />
                        <p className="text-xs text-gray-600">High demand, items are selling fast. Source with confidence.</p>
                      </div>
                      <div className="flex items-center gap-3 bg-green-50/50 rounded-lg px-4 py-2.5">
                        <VerdictBadge verdict="BUY" size="sm" />
                        <p className="text-xs text-gray-600">Solid demand. Good item to pick up at the right price.</p>
                      </div>
                      <div className="flex items-center gap-3 bg-yellow-50 rounded-lg px-4 py-2.5">
                        <VerdictBadge verdict="MAYBE" size="sm" />
                        <p className="text-xs text-gray-600">Moderate demand. Could sell, but check the price and competition.</p>
                      </div>
                      <div className="flex items-center gap-3 bg-red-50 rounded-lg px-4 py-2.5">
                        <VerdictBadge verdict="PASS" size="sm" />
                        <p className="text-xs text-gray-600">Low demand or oversaturated. Probably not worth your money.</p>
                      </div>
                    </div>
                  )}

                  {/* Pro tools for step 4 */}
                  {step.tools && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {step.tools.map((tool, j) => (
                        <div key={j} className="bg-gray-50 rounded-lg px-4 py-3">
                          <p className="text-xs font-semibold text-gray-800 mb-0.5">{tool.name}</p>
                          <p className="text-xs text-gray-500">{tool.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA: Try it */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to try it?</h2>
        <p className="text-sm text-gray-600 mb-6">
          Search any item for free — no account required. 5 free searches per day.
        </p>
        <div className="max-w-md mx-auto">
          <SearchBar onSearch={handleSearch} autoFocus={false} size="default" />
        </div>
      </div>
    </div>
  );
}
