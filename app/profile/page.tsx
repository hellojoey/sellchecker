'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const WEIGHT_OPTIONS = [
  { value: 0, label: 'Small (under 1 lb)' },
  { value: 1, label: 'Medium (1-3 lbs)' },
  { value: 2, label: 'Large (3-5 lbs)' },
  { value: 3, label: 'Oversized (5+ lbs)' },
];

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  plan: string;
  shipping_zip: string | null;
  default_weight_category: number;
  searches_today: number;
  created_at: string;
}

interface SavedSearch {
  id: string;
  query: string;
  verdict: string;
  sell_through_rate: number;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [defaultWeight, setDefaultWeight] = useState(0);

  // Quick Access data
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  // Cross-promo waitlist
  const [waitlistJoined, setWaitlistJoined] = useState<Record<string, boolean>>({});
  const [waitlistLoading, setWaitlistLoading] = useState<Record<string, boolean>>({});

  const isPro = profile?.plan === 'pro';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setDisplayName(data.profile.display_name || '');
        setShippingZip(data.profile.shipping_zip || '');
        setDefaultWeight(data.profile.default_weight_category || 0);

        // Load saved searches for Pro users
        if (data.profile.plan === 'pro') {
          loadSavedSearches();
        }
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const res = await fetch('/api/saved');
      if (res.ok) {
        const data = await res.json();
        const searches = data.savedSearches || [];
        setSavedSearches(searches.slice(0, 3));
        setSavedCount(searches.length);
      }
    } catch {
      // Silently fail — not critical
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          shipping_zip: shippingZip,
          default_weight_category: defaultWeight,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await res.json();
      setProfile((prev) => prev ? { ...prev, ...data.profile } : prev);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const handleJoinWaitlist = async (product: string) => {
    setWaitlistLoading((prev) => ({ ...prev, [product]: true }));
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      if (res.ok) {
        setWaitlistJoined((prev) => ({ ...prev, [product]: true }));
      }
    } catch {
      // Silently fail
    } finally {
      setWaitlistLoading((prev) => ({ ...prev, [product]: false }));
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/saved');
      if (!res.ok) return;
      const data = await res.json();
      const searches = data.savedSearches || [];
      if (searches.length === 0) return;

      const headers = ['Query', 'Verdict', 'Sell-Through Rate', 'Avg Price', 'Median Price', 'Active', 'Sold (90d)', 'Saved At'];
      const rows = searches.map((s: any) => [
        `"${s.query}"`,
        s.verdict,
        `${s.sell_through_rate}%`,
        `$${s.avg_sold_price || 0}`,
        `$${s.median_sold_price || 0}`,
        s.active_count || 0,
        s.sold_count_90d || 0,
        new Date(s.created_at).toLocaleDateString(),
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sellchecker-saved-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
        <Link
          href="/login"
          className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your account, preferences, and more.</p>

      {/* ─── Section 1: Account ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Account</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <p className="text-sm text-gray-900">{profile.email}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Plan</label>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${
                isPro ? 'text-green-700' : 'text-gray-700'
              }`}>
                {isPro ? 'Pro' : 'Free'}
              </span>
              {isPro ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                  PRO
                </span>
              ) : (
                <Link href="/pricing" className="text-xs text-green-600 font-medium hover:text-green-700">
                  Upgrade
                </Link>
              )}
            </div>
          </div>
          {isPro && (
            <div>
              <button
                onClick={async () => {
                  const res = await fetch('/api/billing/portal', { method: 'POST' });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Manage billing &rarr;
              </button>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Member since</label>
            <p className="text-sm text-gray-700">
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Preferences ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Preferences</h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Display name */}
          <div>
            <label htmlFor="displayName" className="block text-xs font-medium text-gray-600 mb-1">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              placeholder="Your name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          {/* Shipping ZIP */}
          <div>
            <label htmlFor="shippingZip" className="block text-xs font-medium text-gray-600 mb-1">
              Shipping ZIP code
            </label>
            <input
              id="shippingZip"
              type="text"
              placeholder="e.g. 90210"
              value={shippingZip}
              onChange={(e) => setShippingZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
              className="w-full max-w-[200px] px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Auto-fills your ZIP in the Deal Calculator for shipping estimates</p>
          </div>

          {/* Default weight */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Default shipping weight
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDefaultWeight(opt.value)}
                  className={`text-left rounded-lg p-2.5 border-2 transition text-xs ${
                    opt.value === defaultWeight
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Pre-selects this weight in the Deal Calculator</p>
          </div>
        </div>
      </div>

      {/* Save button for preferences */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 disabled:bg-green-400 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium animate-fade-in">
            Saved!
          </span>
        )}
      </div>

      {/* ─── Section 3: Quick Access (Pro) / Upgrade Teaser (Free) ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6 relative">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Quick Access</h2>
        </div>

        {isPro ? (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Saved Searches */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-700">Saved Searches</h3>
                  <span className="text-xs font-bold text-green-600">{savedCount}</span>
                </div>
                {savedSearches.length > 0 ? (
                  <ul className="space-y-1.5 mb-3">
                    {savedSearches.map((s) => (
                      <li key={s.id} className="text-xs text-gray-600 truncate">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                          s.verdict === 'STRONG_BUY' || s.verdict === 'S_TIER' ? 'bg-emerald-500' :
                          s.verdict === 'BUY' ? 'bg-green-500' :
                          s.verdict === 'MAYBE' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {s.query}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 mb-3">No saved searches yet</p>
                )}
                <Link
                  href="/saved"
                  className="text-xs text-green-600 font-medium hover:text-green-700"
                >
                  View all &rarr;
                </Link>
              </div>

              {/* Export CSV */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Export Data</h3>
                <p className="text-xs text-gray-500 mb-3 flex-1">
                  Download all your saved searches as a CSV spreadsheet.
                </p>
                <button
                  onClick={handleExportCSV}
                  disabled={savedCount === 0}
                  className="text-xs font-semibold text-green-600 hover:text-green-700 disabled:text-gray-300 text-left flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Free user — locked overlay */
          <div className="p-6 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-40 blur-[2px] pointer-events-none select-none">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Saved Searches</h3>
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Export CSV</h3>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Link
                href="/pricing"
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Upgrade to Pro to unlock
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── Section 4: More Tools for Resellers ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">More Tools for Resellers</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* ResellerZen */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-gray-900">ResellerZen</h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                    COMING SOON
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The all-in-one business manager for resellers. Track inventory, manage listings across platforms, and grow your business.
                </p>
              </div>
              <div className="shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleJoinWaitlist('resellerzen')}
              disabled={waitlistJoined.resellerzen || waitlistLoading.resellerzen}
              className={`mt-4 text-xs font-semibold px-4 py-2 rounded-lg transition ${
                waitlistJoined.resellerzen
                  ? 'bg-blue-100 text-blue-700 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {waitlistLoading.resellerzen ? 'Joining...' :
               waitlistJoined.resellerzen ? '✓ You\'re on the list!' :
               'Get Notified'}
            </button>
          </div>

          {/* Deadpile */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-gray-900">Deadpile</h3>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                    COMING SOON
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Liquidate your dead inventory fast. Turn stale stock into cash with smart pricing and bulk listing tools.
                </p>
              </div>
              <div className="shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleJoinWaitlist('deadpile')}
              disabled={waitlistJoined.deadpile || waitlistLoading.deadpile}
              className={`mt-4 text-xs font-semibold px-4 py-2 rounded-lg transition ${
                waitlistJoined.deadpile
                  ? 'bg-orange-100 text-orange-700 cursor-default'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {waitlistLoading.deadpile ? 'Joining...' :
               waitlistJoined.deadpile ? '✓ You\'re on the list!' :
               'Get Notified'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Section 5: Account Actions ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Account Actions</h2>
        </div>
        <div className="p-6">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition disabled:text-red-300"
          >
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Need to delete your account?{' '}
            <Link href="/contact" className="text-gray-500 hover:text-gray-700 underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
