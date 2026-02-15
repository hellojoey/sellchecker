'use client';

import type { TopListing } from '@/lib/sellthrough';

interface CompCheckProps {
  listings: TopListing[];
  query: string;
}

export default function CompCheck({ listings, query }: CompCheckProps) {
  if (!listings || listings.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>🏷️</span> Your Competition
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {listings.length} active listings on eBay right now
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`https://www.ebay.com/sl/list?keyword=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Sell Similar &rarr;
          </a>
          <a
            href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=12`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            View all on eBay &rarr;
          </a>
        </div>
      </div>

      {/* Listings grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {listings.map((listing, idx) => (
          <a
            key={idx}
            href={listing.itemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition overflow-hidden bg-white"
          >
            {/* Image */}
            {listing.imageUrl ? (
              <div className="aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-2xl text-gray-300">📦</span>
              </div>
            )}

            {/* Info */}
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
              {listing.seller && (
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                  Seller: {listing.seller}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
