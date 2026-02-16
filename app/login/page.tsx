'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan');
  // Prevent open redirect — only allow relative paths
  const rawRedirect = searchParams.get('redirect');
  const redirect = rawRedirect?.startsWith('/') && !rawRedirect?.startsWith('//') ? rawRedirect : null;
  const authError = searchParams.get('error');

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(plan === 'pro' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendConfirmation = useCallback(async () => {
    if (resendCooldown > 0 || !email) return;
    setResendStatus('sending');
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(
            redirect || '/search'
          )}`,
        },
      });
      if (resendError) {
        setResendStatus('error');
      } else {
        setResendStatus('sent');
        setResendCooldown(60);
      }
    } catch {
      setResendStatus('error');
    }
  }, [email, resendCooldown, redirect]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/profile`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
            },
            emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(
              plan === 'pro' ? '/pricing?plan=pro' : (redirect || '/search')
            )}`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // Detect existing user (Supabase returns empty identities to prevent email enumeration)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('An account with this email already exists. Try logging in instead.');
          setMode('login');
          setLoading(false);
          return;
        }

        // Show confirmation email screen
        setConfirmationSent(true);
        setLoading(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        // If plan=pro, redirect to checkout flow
        if (plan === 'pro') {
          const res = await fetch('/api/checkout', { method: 'POST' });
          const checkout = await res.json();
          if (checkout.url) {
            window.location.href = checkout.url;
            return;
          } else {
            // Checkout failed — redirect to pricing instead of getting stuck
            router.push('/pricing?plan=pro');
            return;
          }
        }
        router.push(redirect || '/search');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'forgot'
              ? 'Reset your password'
              : plan === 'pro'
              ? 'Start your Pro trial'
              : mode === 'signup'
              ? 'Create your account'
              : 'Log in to SellChecker'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'forgot'
              ? 'Enter your email and we\'ll send a reset link.'
              : plan === 'pro'
              ? '7 days free. Cancel anytime.'
              : mode === 'signup'
              ? 'Get started with SellChecker.'
              : 'Welcome back.'}
          </p>
        </div>

        {/* Tab toggle — hidden during forgot mode */}
        {mode !== 'forgot' && (
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${
              mode === 'signup'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Log In
          </button>
        </div>
        )}

        {(authError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-red-700">
              {error || 'Authentication failed. Please try again.'}
            </p>
          </div>
        )}

        {/* Password reset sent */}
        {resetSent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">🔑</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-sm text-gray-600">
              We sent a password reset link to <strong>{email}</strong>.
              Click it to set a new password.
            </p>
            <button
              onClick={() => { setResetSent(false); setMode('login'); setError(''); }}
              className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Back to Log In
            </button>
          </div>
        ) : confirmationSent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">✉️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-sm text-gray-600">
              We sent a confirmation link to <strong>{email}</strong>.
              Click it to verify your account, then you can log in.
            </p>

            {/* Resend confirmation email */}
            <div className="mt-5 pt-4 border-t border-green-200">
              <p className="text-xs text-gray-500 mb-2">Didn&apos;t get the email? Check spam, or:</p>
              <button
                onClick={handleResendConfirmation}
                disabled={resendCooldown > 0 || resendStatus === 'sending'}
                className="text-sm font-medium text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed transition"
              >
                {resendStatus === 'sending'
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend email (${resendCooldown}s)`
                  : 'Resend confirmation email'}
              </button>
              {resendStatus === 'sent' && resendCooldown > 0 && (
                <p className="text-xs text-green-600 mt-1.5">✓ Email sent! Check your inbox.</p>
              )}
              {resendStatus === 'error' && (
                <p className="text-xs text-red-600 mt-1.5">Failed to resend. Please try again.</p>
              )}
            </div>

            <button
              onClick={() => { setConfirmationSent(false); setMode('login'); setResendStatus('idle'); }}
              className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Go to Log In
            </button>
          </div>
        ) : mode === 'forgot' ? (

        <form onSubmit={handleForgotPassword}>
          <div className="mb-4">
            <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="resetEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-3 mt-2 transition"
          >
            Back to Log In
          </button>
        </form>

        ) : (

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                autoFocus
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); }}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
            />
          </div>

          {mode === 'signup' && (
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading
              ? (mode === 'signup' ? 'Creating account...' : 'Logging in...')
              : mode === 'signup'
              ? (plan === 'pro' ? 'Start free trial' : 'Create account')
              : 'Log in'}
          </button>
        </form>

        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">
            &larr; Back to SellChecker
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center text-gray-400">Loading...</div>
    }>
      <LoginContent />
    </Suspense>
  );
}
