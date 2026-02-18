'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [navQuery, setNavQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Show search bar on all pages except homepage and search page
  const showNavSearch = pathname !== '/' && pathname !== '/search';

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

  const closeMobile = () => setMobileOpen(false);

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(navQuery.trim())}`);
    setNavQuery('');
  };

  const isPro = plan === 'pro';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Sell<span className="text-green-600">Checker</span>
            </span>
          </Link>

          {/* Desktop: nav search bar */}
          {showNavSearch && (
            <form onSubmit={handleNavSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={navQuery}
                  onChange={(e) => setNavQuery(e.target.value)}
                  placeholder="Search eBay sell-through rates..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </form>
          )}

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            {/* Pricing + How It Works — only for logged-out users */}
            {!user && !loading && (
              <>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Pricing
                </Link>
                <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition">
                  How It Works
                </Link>
              </>
            )}

            {loading ? (
              <div className="w-16 h-8 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                {/* Saved — functional for Pro, greyed out with PRO badge for free */}
                {isPro ? (
                  <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved
                  </Link>
                ) : (
                  <span className="text-sm text-gray-400 flex items-center gap-1 cursor-not-allowed select-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved
                    <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1 py-0.5 rounded">PRO</span>
                  </span>
                )}

                {/* Profile */}
                <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>

                {isPro ? (
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    PRO
                  </span>
                ) : (
                  <Link
                    href="/pricing"
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Upgrade
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
                >
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
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
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
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down">
          <div className="px-4 py-2">
            {/* Mobile search bar */}
            {showNavSearch && (
              <form onSubmit={(e) => { handleNavSearch(e); closeMobile(); }} className="py-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={navQuery}
                    onChange={(e) => setNavQuery(e.target.value)}
                    placeholder="Search sell-through rates..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </form>
            )}

            {/* Logged-out only links */}
            {!user && !loading && (
              <>
                <Link
                  href="/pricing"
                  onClick={closeMobile}
                  className="flex items-center gap-3 min-h-[44px] py-3 px-2 text-gray-700 hover:text-gray-900 active:bg-gray-50 rounded-lg transition"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pricing
                </Link>
                <Link
                  href="/how-it-works"
                  onClick={closeMobile}
                  className="flex items-center gap-3 min-h-[44px] py-3 px-2 text-gray-700 hover:text-gray-900 active:bg-gray-50 rounded-lg transition"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How It Works
                </Link>
              </>
            )}

            {user ? (
              <>
                {/* Saved — functional for Pro, disabled for free */}
                {isPro ? (
                  <Link
                    href="/saved"
                    onClick={closeMobile}
                    className="flex items-center gap-3 min-h-[44px] py-3 px-2 text-gray-700 hover:text-gray-900 active:bg-gray-50 rounded-lg transition"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved Searches
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded ml-auto">PRO</span>
                  </Link>
                ) : (
                  <span
                    className="flex items-center gap-3 min-h-[44px] py-3 px-2 text-gray-400 rounded-lg cursor-not-allowed select-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved Searches
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded ml-auto">PRO</span>
                  </span>
                )}

                {/* Profile (renamed from Settings) */}
                <Link
                  href="/profile"
                  onClick={closeMobile}
                  className="flex items-center gap-3 min-h-[44px] py-3 px-2 text-gray-700 hover:text-gray-900 active:bg-gray-50 rounded-lg transition"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>

                {!isPro && (
                  <>
                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1" />
                    <Link
                      href="/pricing"
                      onClick={closeMobile}
                      className="flex items-center gap-3 min-h-[44px] py-3 px-2 text-green-600 font-medium active:bg-green-50 rounded-lg transition"
                    >
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Upgrade to Pro
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="flex items-center gap-3 min-h-[44px] py-3 px-2 text-gray-700 hover:text-gray-900 active:bg-gray-50 rounded-lg transition"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Log in
                </Link>
                <div className="px-2 py-2">
                  <Link
                    href="/login?plan=pro"
                    onClick={closeMobile}
                    className="block bg-green-600 text-white text-center px-4 py-3 rounded-lg font-medium active:bg-green-700 transition min-h-[44px]"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
