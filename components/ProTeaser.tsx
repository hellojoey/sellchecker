'use client';

const PRO_HIGHLIGHTS = [
  {
    emoji: '♾️',
    title: 'Unlimited SellChecks',
    desc: 'Never run out at the thrift store. Search as many items as you want, every day.',
  },
  {
    emoji: '💡',
    title: 'Smart Insights',
    desc: 'Get contextual tips for every search — know when to buy, when to wait, and how to price.',
  },
  {
    emoji: '📊',
    title: 'Interactive Price Slider',
    desc: 'Drag to any price point and see how fast it\'ll sell. Find the sweet spot for maximum profit.',
  },
  {
    emoji: '📋',
    title: 'Saved Searches & Sourcing List',
    desc: 'Save items with your cost of goods. Build a sourcing list you can reference anywhere.',
  },
];

export default function ProTeaser() {
  return (
    <div className="mt-8">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 text-center">
          <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
            PRO
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Get more from every search
          </h3>
          <p className="text-sm text-gray-600">
            Upgrade to Pro and source smarter with powerful reseller tools.
          </p>
        </div>

        {/* Feature cards */}
        <div className="px-6 pb-4 grid sm:grid-cols-2 gap-3">
          {PRO_HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="bg-white/80 rounded-xl p-4 border border-green-100"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 py-5 text-center border-t border-green-100">
          <a
            href="/pricing"
            className="inline-block bg-green-600 text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-600/20"
          >
            Start 7-day Free Trial — $10/mo
          </a>
          <p className="text-xs text-gray-500 mt-2">Cancel anytime. No credit card for trial.</p>
        </div>
      </div>
    </div>
  );
}
