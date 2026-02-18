'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SUBJECTS = [
  { value: '', label: 'Select a topic...' },
  { value: 'general', label: 'General Question' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'billing', label: 'Billing' },
];

const FAQ_ITEMS = [
  {
    q: 'What is sell-through rate and why does it matter?',
    a: 'Sell-through rate (STR) measures what percentage of listed items actually sell within a time period. A high STR means the item is in demand and sells quickly — meaning less time sitting on inventory. SellChecker calculates this using real eBay sold data so you can make smarter sourcing decisions.',
  },
  {
    q: 'How accurate is the data?',
    a: 'SellChecker combines the official eBay Browse API for active listing data with real sold listing data scraped from eBay\'s public search results. Data is cached for 24 hours to stay fresh. While no tool is 100% perfect, our hybrid approach gives you the most reliable picture available.',
  },
  {
    q: 'What\'s the difference between Free and Pro?',
    a: 'Free users get 5 searches per day with full verdict results. Pro unlocks unlimited searches, saved searches with history, the Deal Calculator for profit estimates, Comp Check for visual price comparisons, CSV export, and the STR Slider for what-if scenarios.',
  },
  {
    q: 'Can I cancel my Pro subscription anytime?',
    a: 'Absolutely. You can cancel from your Profile page under billing management. Your Pro features stay active through the end of your current billing period. No questions asked.',
  },
  {
    q: 'How do I get the most out of SellChecker?',
    a: 'Be specific with your searches — include brand, model, size, and condition. For example, "Nike SB Dunk Jarritos Size 10" will give you much more targeted results than just "Nike shoes". The more specific your query, the more accurate your sell-through rate.',
  },
  {
    q: 'Is SellChecker affiliated with eBay?',
    a: 'No. SellChecker is an independent tool that uses eBay\'s public APIs and data to help resellers make better sourcing decisions. We are not affiliated with, endorsed by, or connected to eBay Inc.',
  },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll to FAQ if URL has #faq
  useEffect(() => {
    if (window.location.hash === '#faq') {
      setTimeout(() => {
        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('sent');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-600">
          Have a question, found a bug, or want to request a feature? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Send us a message</h2>
        </div>

        {status === 'sent' ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Message sent!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Thanks for reaching out. We&apos;ll get back to you as soon as we can.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="text-sm text-green-600 font-medium hover:text-green-700"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="contact-name" className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="contact-email" className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="contact-subject" className="block text-xs font-medium text-gray-600 mb-1">
                Subject
              </label>
              <select
                id="contact-subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value} disabled={!s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="block text-xs font-medium text-gray-600 mb-1">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
              />
            </div>

            {/* Error */}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 disabled:bg-green-400 transition"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>

      {/* FAQ Section */}
      <div id="faq" className="scroll-mt-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-600">Quick answers to common questions about SellChecker.</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
              >
                <span className="text-sm font-semibold text-gray-900">{item.q}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick contact fallback */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400">
          You can also reach us directly at{' '}
          <a href="mailto:hello@sellchecker.app" className="text-gray-500 hover:text-gray-700 underline">
            hello@sellchecker.app
          </a>
        </p>
      </div>
    </div>
  );
}
