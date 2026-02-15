'use client';

import type { TopListing } from '@/lib/sellthrough';

interface CompCheckTeaserProps {
  listings: TopListing[];
  query: string;
  onSearchTitle: (title: string) => void;
}

export default function CompCheckTeaser({ listings, query, onSearchTitle }: CompCheckTeaserProps) {
  if (!listings || listings.length === 0) return null;

  const visibleListing = listings[0];
  const blurredListings = listings.slice(1, 6);

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>🏷️</span> Your Competition
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">PRO</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {listings.length} active listing{listings.length !== 1 ? 's' : ''} on eBay right now
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
      <div className="p-4 relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* First listing — fully visible with actions */}
          <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            {visibleListing.imageUrl ? (
              <a href={visibleListing.itemUrl} target="_blank" rel="noopener noreferrer" className="block">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={visibleListing.imageUrl}
                    alt={visibleListing.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </div>
              </a>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-2xl text-gray-300">📦</span>
              </div>
            )}
            <div className="p-2.5">
              <a href={visibleListing.itemUrl} target="_blank" rel="noopener noreferrer">
                <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-tight mb-1.5 hover:text-green-600 transition">
                  {visibleListing.title}
                </p>
              </a>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">
                  ${visibleListing.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  {visibleListing.condition === 'New' || visibleListing.condition === 'Brand New'
                    ? 'New'
                    : visibleListing.condition?.includes('Pre')
                    ? 'Used'
                    : visibleListing.condition?.length > 12
                    ? visibleListing.condition.slice(0, 10) + '…'
                    : visibleListing.condition || 'N/A'}
                </span>
              </div>
              {/* Per-listing actions (visible for free users too) */}
              <div className="mt-2 pt-2 border-t border-gray-50 flex flex-col gap-1">
                <a
                  href={`https://www.ebay.com/sl/list?keyword=${encodeURIComponent(visibleListing.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Sell Similar &rarr;
                </a>
                <button
                  onClick={() => onSearchTitle(visibleListing.title)}
                  className="text-[10px] text-green-600 hover:underline text-left"
                >
                  Search this title
                </button>
              </div>
            </div>
          </div>

          {/* Remaining listings — blurred */}
          {blurredListings.map((listing, idx) => (
            <div key={idx} className="relative">
              <div className="blur-[6px] pointer-events-none select-none">
                <ListingCard listing={listing} />
              </div>
            </div>
          ))}
        </div>

        {/* Lock overlay on blurred area */}
        {blurredListings.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ left: '33.33%' }}>
            <div className="absolute inset-0 bg-white/40 rounded-lg" />
            <a
              href="/pricing"
              className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-white border border-green-200 px-4 py-2 rounded-full shadow-sm hover:bg-green-50 transition"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              See all {listings.length} competitors with Pro
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: TopListing }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
      {listing.imageUrl ? (
        <div className="aspect-square bg-gray-50 overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <span className="text-2xl text-gray-300">📦</span>
        </div>
      )}
      <div className="p-2.5">
        <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-tight mb-1.5">
          {listing.title}
        </p>
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
      </div>
    </div>
  );
}
