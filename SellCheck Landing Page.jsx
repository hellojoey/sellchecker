import { useState, useRef, useEffect } from "react";
import { Search, BarChart3, Zap, Clock, TrendingUp, Check, ChevronRight, Star, Shield, Smartphone, ArrowRight } from "lucide-react";

// ── Demo data for interactive search ──
const DEMO_RESULTS = {
  "lululemon define jacket": { sold: 247, active: 183, rate: 57.4, avg: 62.5, median: 58, low: 35, high: 95, days: 11, verdict: "BUY" },
  "nike air max 90": { sold: 892, active: 1247, rate: 41.7, avg: 78.3, median: 72, low: 40, high: 180, days: 18, verdict: "RISKY" },
  "carhartt vintage tee": { sold: 156, active: 89, rate: 63.7, avg: 34.2, median: 30, low: 15, high: 65, days: 8, verdict: "BUY" },
  "coach crossbody bag": { sold: 534, active: 412, rate: 56.4, avg: 48.7, median: 42, low: 18, high: 125, days: 14, verdict: "BUY" },
  "the office complete series dvd": { sold: 78, active: 156, rate: 33.3, avg: 42.1, median: 40, low: 25, high: 65, days: 22, verdict: "RISKY" },
  "doc martens 1460": { sold: 312, active: 198, rate: 61.2, avg: 89.4, median: 85, low: 45, high: 160, days: 12, verdict: "BUY" },
  "true religion jeans": { sold: 45, active: 287, rate: 13.6, avg: 28.5, median: 25, low: 12, high: 55, days: 45, verdict: "PASS" },
  "patagonia better sweater": { sold: 203, active: 167, rate: 54.9, avg: 68.2, median: 65, low: 35, high: 110, days: 13, verdict: "BUY" },
};

const findResult = (q) => {
  const lower = q.toLowerCase().trim();
  for (const [key, val] of Object.entries(DEMO_RESULTS)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }
  // Generate plausible random result for unknown queries
  const sold = Math.floor(Math.random() * 300) + 20;
  const active = Math.floor(Math.random() * 400) + 50;
  const rate = Math.round((sold / (sold + active)) * 1000) / 10;
  const avg = Math.floor(Math.random() * 80) + 15;
  return {
    sold, active, rate, avg, median: Math.floor(avg * 0.9), low: Math.floor(avg * 0.4),
    high: Math.floor(avg * 1.8), days: Math.floor(Math.random() * 30) + 5,
    verdict: rate >= 50 ? "BUY" : rate >= 20 ? "RISKY" : "PASS",
  };
};

// ── Verdict colors ──
const VERDICT = {
  BUY: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "STRONG BUY" },
  RISKY: { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "RISKY" },
  PASS: { bg: "bg-red-500", light: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "PASS" },
};

// ── Sell-Through Gauge ──
function Gauge({ rate, size = 120 }) {
  const angle = (rate / 100) * 180;
  const color = rate >= 50 ? "#10b981" : rate >= 20 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path d={`M 10 ${size / 2} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
        <path d={`M 10 ${size / 2} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * Math.PI * (size / 2 - 10)} ${Math.PI * (size / 2 - 10)}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
        <span className="text-2xl font-bold" style={{ color }}>{rate}%</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">sell-through</span>
      </div>
    </div>
  );
}

// ── Search Results Card ──
function ResultCard({ result, query }) {
  const v = VERDICT[result.verdict];
  return (
    <div className={`bg-white rounded-2xl border-2 ${v.border} shadow-lg overflow-hidden max-w-lg mx-auto`}>
      {/* Verdict Header */}
      <div className={`${v.bg} px-5 py-3 flex items-center justify-between`}>
        <span className="text-white font-bold text-sm tracking-wide">{v.label}</span>
        <span className="text-white text-xs opacity-80">eBay · Last 90 days</span>
      </div>

      <div className="p-5">
        <p className="text-sm text-gray-500 mb-4 truncate">"{query}"</p>

        {/* Gauge + Stats */}
        <div className="flex items-start gap-5">
          <Gauge rate={result.rate} />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sold (90d)</span>
              <span className="font-bold text-gray-800">{result.sold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active listings</span>
              <span className="font-bold text-gray-800">{result.active.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg sold price</span>
              <span className="font-bold text-emerald-600">${result.avg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg days to sell</span>
              <span className="font-bold text-gray-800">{result.days} days</span>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="mt-4 bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-2">Price range</p>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div className="absolute h-2 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
              style={{ left: "5%", right: "5%" }} />
            <div className="absolute -top-5 text-xs font-medium text-gray-600" style={{ left: "5%" }}>${result.low}</div>
            <div className="absolute -top-5 text-xs font-medium text-emerald-600"
              style={{ left: `${((result.median - result.low) / (result.high - result.low)) * 90 + 5}%` }}>${result.median}</div>
            <div className="absolute -top-5 text-xs font-medium text-gray-600 right-0" style={{ right: "5%" }}>${result.high}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Landing Page ──
export default function SellCheckerLanding() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchCount, setSearchCount] = useState(5);
  const resultsRef = useRef(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setResult(findResult(query));
      setSearching(false);
      setSearchCount(c => Math.max(0, c - 1));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SellChecker</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#how" className="text-sm text-gray-600 hover:text-gray-900">How it works</a>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Log in</button>
            <button className="text-sm font-medium bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all">
              Sign up free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-emerald-100">
            <Zap size={12} /> Free for 5 checks per day — no signup needed
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
            Will it sell?<br />
            <span className="text-emerald-500">Know before you buy.</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            SellChecker gives you instant sell-through data so you never waste money on items that won't move. Type any item, get the answer in 2 seconds.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="flex gap-2 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 p-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder='Try "Lululemon Define Jacket" or "Nike Air Max 90"'
                  className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-transparent focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching || !query.trim()}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {searching ? (
                  <span className="animate-pulse">Checking...</span>
                ) : (
                  <>Check <ArrowRight size={14} /></>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {searchCount > 0
                ? `${searchCount} free checks remaining today`
                : "Daily limit reached — sign up for Pro for unlimited"}
            </p>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Lululemon Define Jacket", "Doc Martens 1460", "Coach Crossbody", "True Religion Jeans"].map(s => (
              <button key={s} onClick={() => { setQuery(s); }}
                className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full hover:border-emerald-300 hover:text-emerald-600 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results (appears after search) */}
      {result && (
        <section ref={resultsRef} className="py-12 px-4 bg-gray-50">
          <ResultCard result={result} query={query} />
        </section>
      )}

      {/* How It Works */}
      <section id="how" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500 mb-12">Three steps. Two seconds. One answer.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Search any item", desc: "Type a product name, brand, or scan a barcode. Works for clothing, shoes, electronics, media — anything." },
              { icon: BarChart3, title: "See the data", desc: "Sell-through rate, average sold price, days to sell, price range, and active competition — all in one glance." },
              { icon: TrendingUp, title: "Get the verdict", desc: "BUY (strong demand), RISKY (moderate — watch your price), or PASS (skip it). Simple as that." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-lg text-gray-800 font-medium max-w-lg mx-auto italic">
            "I check SellChecker before every thrift run. It's like having a pro reseller whispering in your ear which items to grab."
          </p>
          <p className="text-sm text-gray-500 mt-3">— The kind of thing people will say about us</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple pricing</h2>
          <p className="text-gray-500 mb-12">Start free. Upgrade when you're hooked.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left">
              <h3 className="text-lg font-bold text-gray-900">Free</h3>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">$0<span className="text-sm font-normal text-gray-400">/forever</span></p>
              <p className="text-sm text-gray-500 mt-1 mb-6">Perfect for casual sourcing trips</p>
              <ul className="space-y-3">
                {["5 checks per day", "Sell-through rate + pricing", "BUY / RISKY / PASS verdict", "No signup required"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full mt-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Start checking
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 text-left relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <h3 className="text-lg font-bold text-gray-900">Pro</h3>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">$10<span className="text-sm font-normal text-gray-400">/month</span></p>
              <p className="text-sm text-gray-500 mt-1 mb-6">For serious resellers who source daily</p>
              <ul className="space-y-3">
                {["Unlimited checks", "Barcode scanner", "Search history", "Profit calculator", "Brand hot list", "Wishlist with alerts", "CSV export"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full mt-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all">
                Start Pro — 7 day free trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Built for mobile */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Smartphone size={22} className="text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Built for the thrift store aisle</h2>
          <p className="text-gray-500 max-w-lg mx-auto mb-6">
            SellChecker is a mobile-first web app. No app store download needed — just open sellchecker.app on your phone and add it to your home screen. Works offline for your last 10 searches.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { icon: Zap, text: "2-second results" },
              { icon: Shield, text: "No data sold" },
              { icon: Smartphone, text: "Install as app" },
              { icon: Clock, text: "Offline cache" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 text-sm text-gray-700">
                <Icon size={14} className="text-emerald-500" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-500 to-emerald-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Stop guessing. Start selling.</h2>
          <p className="text-emerald-100 mb-8">Your next thrift store trip is going to be a lot more profitable.</p>
          <button className="bg-white text-emerald-600 font-bold px-8 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-all shadow-lg">
            Try SellChecker free — no signup needed
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
              <BarChart3 size={12} className="text-white" />
            </div>
            <span className="text-sm text-gray-300 font-medium">SellChecker</span>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <p className="text-xs">© 2026 SellChecker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
