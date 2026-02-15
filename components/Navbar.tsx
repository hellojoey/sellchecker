'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Fetch plan from profile
        supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.plan) setPlan(data.plan);
          });
      }
      setLoading(false);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setPlan('free');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setPlan('free');
    window.location.href = '/';
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Sell<span className="text-green-600">Checker</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Pricing
            </Link>

            {loading ? (
              <div className="w-16 h-8 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Saved
                </Link>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                {plan === 'pro' && (
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    PRO
                  </span>
                )}
                {plan === 'pro' ? (
                  <button
                    onClick={handleManageBilling}
                    className="text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    Billing
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition"
                  >
                    Upgrade
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Log in
                </Link>
                <Link
                  href="/login?plan=pro"
                  className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/pricing" className="block text-gray-600 hover:text-gray-900">Pricing</Link>
          {user ? (
            <>
              <Link href="/saved" className="block text-gray-600 hover:text-gray-900">Saved Searches</Link>
              <Link href="/profile" className="block text-gray-600 hover:text-gray-900">Settings</Link>
              {plan === 'pro' && (
                <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  PRO
                </span>
              )}
              {plan === 'pro' ? (
                <button onClick={handleManageBilling} className="block text-gray-600 hover:text-gray-900">
                  Manage Billing
                </button>
              ) : (
                <Link href="/pricing" className="block text-green-600 font-medium">
                  Upgrade to Pro
                </Link>
              )}
              <button onClick={handleSignOut} className="block text-gray-600 hover:text-gray-900">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-600 hover:text-gray-900">Log in</Link>
              <Link href="/login?plan=pro" className="block bg-green-600 text-white text-center px-4 py-2 rounded-lg font-medium">
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
