'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [defaultWeight, setDefaultWeight] = useState(0);

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
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading settings...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-600 mb-4">Please log in to view your settings.</p>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your account and default preferences.</p>

      {/* Account info */}
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
                profile.plan === 'pro' ? 'text-green-700' : 'text-gray-700'
              }`}>
                {profile.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
              {profile.plan !== 'pro' && (
                <Link href="/pricing" className="text-xs text-green-600 font-medium hover:text-green-700">
                  Upgrade
                </Link>
              )}
              {profile.plan === 'pro' && (
                <Link href="/api/billing/portal" className="text-xs text-gray-500 hover:text-gray-700">
                  Manage billing
                </Link>
              )}
            </div>
          </div>
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

      {/* Preferences */}
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
            <p className="text-xs text-gray-400 mt-1">Used for more accurate shipping estimates</p>
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

      {/* Save */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
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
    </div>
  );
}
