'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const FREE_FEATURES = [
  '5 SellChecks per day',
  'Sell-through rate + BUY/MAYBE/PASS verdict',
  'New/Used condition filter',
  'Deal Calculator — COG, shipping, and profit breakdown',
  'Price-to-Speed preview (locked at median)',
  'Comp Check + Sourcing Calculator',
];

const PRO_FEATURES = [
  'Unlimited SellChecks — never run out at the thrift store',
  'Smart Insights — contextual tips per search',
  'Interactive Price-to-Speed slider',
  'Saved Searches with COG tracking',
  'Profile & default settings',
  'Everything in Free, plus priority support',
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if user is logged in
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in — send to login with plan=pro so they come back after auth
        window.location.href = '/login?plan=pro';
        return;
      }

      // User is logged in — create checkout session
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Start free. Upgrade to Pro when you want unlimited searches and power features.
            Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 flex flex-col">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Free</h2>
              <p className="text-sm text-gray-500 mt-1">Perfect for casual sourcing</p>
              <div className="mt-4 mb-8">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 ml-1">/forever</span>
              </div>

              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <Link
                href="/login"
                className="block w-full text-center py-3 px-6 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Get started free
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-500 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pro</h2>
              <p className="text-sm text-gray-500 mt-1">For serious resellers</p>
              <div className="mt-4 mb-8">
                <span className="text-5xl font-bold text-gray-900">$10</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full text-center py-3 px-6 bg-green-600 rounded-xl font-semibold text-white hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {loading ? 'Redirecting...' : 'Start 7-day free trial'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">7-day free trial, then $10/month</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Questions?</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Where does the data come from?',
                a: 'We pull real-time data from eBay active and recently sold listings. Our sell-through rate formula: Items Sold (90d) / (Items Sold + Active Listings) × 100.',
              },
              {
                q: 'Can I cancel Pro anytime?',
                a: 'Yes. Cancel in one click from your dashboard. You keep Pro access until the end of your billing cycle.',
              },
              {
                q: 'Is there really a free tier?',
                a: 'Yes! 5 searches per day, forever free. No credit card needed. We want every reseller to have access to good data.',
              },
              {
                q: 'Why eBay only?',
                a: 'eBay has the deepest marketplace data with real sold prices and volumes. We focus on doing one thing really well — giving you the best eBay reseller data possible.',
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
