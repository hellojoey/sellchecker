import SearchBar from '@/components/SearchBar';

const SOCIAL_PROOF = [
  { stat: '50K+', label: 'Searches run' },
  { stat: '12K+', label: 'Resellers' },
  { stat: '2s', label: 'Avg lookup time' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Search any item',
    desc: 'Type a brand, product, or category. We search across active and sold listings.',
    icon: '🔍',
  },
  {
    step: '2',
    title: 'Get your verdict',
    desc: 'See sell-through rate, price ranges, and a clear BUY / RISKY / PASS recommendation.',
    icon: '📊',
  },
  {
    step: '3',
    title: 'Source with confidence',
    desc: 'Stop guessing. Know what sells before you spend a dollar.',
    icon: '✅',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/80 via-white to-white" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 animate-fade-in">
            Know before you{' '}
            <span className="gradient-text">buy.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in">
            Instant sell-through rates for resellers. Check demand, pricing, and velocity on any item
            in seconds — so you only source what actually sells.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto animate-slide-up">
            <SearchBar size="large" autoFocus />
          </div>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 mt-10 animate-fade-in">
            {SOCIAL_PROOF.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{item.stat}</div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-400">
            5 free searches per day. No credit card required.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for resellers, by resellers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Whether you flip thrift finds, run a Poshmark closet, or do retail arbitrage —
            SellChecker helps you make smarter sourcing decisions.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '🏪', title: 'Thrift Flippers', desc: 'Check brands on the spot while you shop' },
              { emoji: '📱', title: 'Poshmark Sellers', desc: 'Know what your closet should stock' },
              { emoji: '🏷️', title: 'eBay PowerSellers', desc: 'Scale with data-driven sourcing' },
              { emoji: '🎯', title: 'Retail Arbitrage', desc: 'Scan clearance with confidence' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-600 mb-12">Start free. Upgrade when you need more.</p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 text-left">
              <h3 className="font-semibold text-gray-900 text-lg">Free</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/forever</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 5 searches per day
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Sell-through rate + verdict
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Price range data
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> eBay marketplace data
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-500 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Pro</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold">$10</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlimited searches
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Search history dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Watchlist with alerts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Brand hot list (weekly)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Profit calculator
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Barcode scanner
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stop guessing. Start checking.
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Join thousands of resellers who source smarter with SellChecker.
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar size="large" />
          </div>
        </div>
      </section>
    </div>
  );
}
