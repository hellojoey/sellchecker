'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Rotating sample searches — mix of specific items and quirky finds
const SAMPLE_SEARCHES = [
  { query: 'Nike SB Dunk Jarritos Size 10 Mens', display: 'Nike SB Dunk Jarritos' },
  { query: 'Vintage Grateful Dead Tour Tee', display: 'Vintage Grateful Dead Tour Tee' },
  { query: 'Pokemon Charizard Holo 1st Edition', display: 'Pokemon Charizard Holo' },
  { query: 'Tamagotchi Original 1997', display: 'Tamagotchi Original 1997' },
  { query: 'KitchenAid Artisan Mixer Red', display: 'KitchenAid Artisan Mixer' },
  { query: 'Vintage Corningware Blue Cornflower', display: 'Vintage Corningware' },
  { query: 'Nintendo 64 Console Complete', display: 'Nintendo 64 Console' },
  { query: 'Supreme Box Logo Hoodie', display: 'Supreme Box Logo Hoodie' },
  { query: 'Patagonia Better Sweater Large', display: 'Patagonia Better Sweater' },
  { query: 'Lululemon Define Jacket Size 6', display: 'Lululemon Define Jacket' },
  { query: 'Birkenstock Boston Clog', display: 'Birkenstock Boston Clog' },
  { query: 'Vitamix 5200 Blender', display: 'Vitamix 5200 Blender' },
  { query: 'Vintage Pyrex Mixing Bowl Set', display: 'Vintage Pyrex Mixing Bowls' },
  { query: 'Air Jordan 4 Retro Bred', display: 'Air Jordan 4 Bred' },
  { query: 'Pendleton Wool Blanket', display: 'Pendleton Wool Blanket' },
];

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();

  // Pick a random sample search once per mount
  const [sampleSearch] = useState(() =>
    SAMPLE_SEARCHES[Math.floor(Math.random() * SAMPLE_SEARCHES.length)]
  );

  const handleSampleSearch = () => {
    onComplete();
    router.push(`/search?q=${encodeURIComponent(sampleSearch.query)}`);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleSkip}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 0 && (
          <>
            {/* Step 1: Welcome */}
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome to SellChecker!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Check sell-through rates before you source. Here&apos;s how it works:
              </p>

              <div className="space-y-3 text-left mb-6">
                {[
                  { icon: '🔍', text: 'Search any item — brand, product, or category' },
                  { icon: '📊', text: 'Get a verdict — BUY, MAYBE, or PASS based on real data' },
                  { icon: '💰', text: 'See pricing — median, average, and price ranges' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <p className="text-sm text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
              >
                Got it — let&apos;s go!
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            {/* Step 2: Try a sample search */}
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Try your first SellCheck
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                See what a real search looks like — we picked one for you.
              </p>

              <button
                onClick={handleSampleSearch}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition mb-3 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                SellCheck &ldquo;{sampleSearch.display}&rdquo;
              </button>

              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium py-2 transition"
              >
                I&apos;ll search on my own
              </button>
            </div>
          </>
        )}

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition ${
                i === step ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
