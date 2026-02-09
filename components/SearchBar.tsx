'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUGGESTIONS = [
  'Lululemon Define Jacket',
  'Nike Dunk Low',
  'Coach Tabby Bag',
  'Doc Martens 1460',
  'True Religion Jeans',
  'Carhartt WIP Jacket',
  'Vintage Band Tee',
  'Air Jordan 4',
];

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  size?: 'default' | 'large';
}

export default function SearchBar({ initialQuery = '', onSearch, autoFocus = false, size = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query.trim());
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    setShowSuggestions(false);
  };

  const handleSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    }
  };

  const isLarge = size === 'large';

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <svg
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${isLarge ? 'w-6 h-6' : 'w-5 h-5'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder='Try "Lululemon Define Jacket" or "Nike Dunk Low"'
            className={`w-full bg-white border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition ${
              isLarge
                ? 'pl-14 pr-32 py-5 text-lg'
                : 'pl-12 pr-28 py-3.5 text-base'
            }`}
          />
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition ${
              isLarge ? 'px-6 py-3 text-base' : 'px-5 py-2.5 text-sm'
            }`}
          >
            Check
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <p className="px-4 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Popular searches</p>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onMouseDown={() => handleSuggestion(suggestion)}
              className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
