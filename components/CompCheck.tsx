'use client';

import { useState } from 'react';
import type { TopListing } from '@/lib/sellthrough';

interface CompCheckProps {
  listings: TopListing[];
  query: string;
  excludedIndices: Set<number>;
  onToggleExclude: (index: number) => void;
  onSearchTitle: (title: string) => void;
}

export default function CompCheck({ listings, query, excludedIndices, onToggleExclude, onSearchTitle }: CompCheckProps) {
  const [visibleCount, setVisibleCount] = useState(6);

  if (!listings || listings.length === 0) return null;

  const visibleListings = listings.slice(0, visibleCount);
  const hasMore = listings.length > visibleCount;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 sm:px-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>🏷️</span> Your Competition
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {listings.length} active listing{listings.length !== 1 ? 's' : ''} on eBay right now
            {excludedIndices.size > 0 && (
              <span className="text-amber-500 ml-1">({excludedIndices.size} excluded)</span>
            )}
          </p>
        </div>
        <a
          href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=12`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-600 hover:text-green-700 font-medium"
        >
          View all on eBay &rarr;
        </a>
      </div>

      {/* Listings grid */}
      <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {visibleListings.map((listing, idx) => {
          const isExcluded = excludedIndices.has(idx);
          return (
            <div
              key={idx}
              className={`rounded-xl border overflow-hidden bg-white transition ${
                isExcluded
                  ? 'border-red-200 opacity-40'
                  : 'border-gray-100 hover:border-green-200 hover:shadow-md'
              }`}
            >
              {/* Image — clickable to eBay listing */}
              <a href={listing.itemUrl} target="_blank" rel="noopener noreferrer" className="block">
                {listing.imageUrl ? (
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl text-gray-300">📦</span>
                  </div>
                )}
              </a>

              {/* Info */}
              <div className="p-2 sm:p-2.5">
                <a href={listing.itemUrl} target="_blank" rel="noopener noreferrer">
                  <p className={`text-xs text-gray-700 font-medium line-clamp-2 leading-snug mb-1.5 hover:text-green-600 transition ${isExcluded ? 'line-through' : ''}`}>
                    {listing.title}
                  </p>
                </a>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    ${listing.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                    {listing.condition === 'New' || listing.condition === 'Brand New'
                      ? 'New'
                      : listing.condition?.includes('Pre')
                      ? 'Used'
                      : listing.condition?.length > 12
                      ? listing.condition.slice(0, 10) + '…'
                      : listing.condition || 'N/A'}
                  </span>
                </div>
                {listing.seller && (
                  <p className="text-[10px] text-gray-400 mt-1 truncate">
                    Seller: {listing.seller}
                  </p>
                )}

                {/* Per-listing actions */}
                <div className="mt-2 pt-2 border-t border-gray-50 flex flex-col gap-0.5">
                  <a
                    href={`https://www.ebay.com/sl/list?keyword=${encodeURIComponent(listing.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline py-1 min-h-[36px] flex items-center"
                  >
                    Sell Similar &rarr;
                  </a>
                  <button
                    onClick={() => onSearchTitle(listing.title)}
                    className="text-xs text-green-600 hover:underline text-left py-1 min-h-[36px] flex items-center"
                  >
                    Search this title
                  </button>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer min-h-[36px] py-1">
                    <input
                      type="checkbox"
                      checked={isExcluded}
                      onChange={() => onToggleExclude(idx)}
                      className="w-4 h-4 accent-red-500 rounded"
                    />
                    Exclude from calc
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more button */}
      {hasMore && (
        <div className="px-4 pb-4 flex justify-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="text-sm text-green-600 font-medium hover:text-green-700 hover:underline transition py-3 px-4 min-h-[44px]"
          >
            Show 6 more ({listings.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
