import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search any item to check its eBay sell-through rate, pricing data, and competition. Get a BUY, MAYBE, or PASS verdict instantly.',
  alternates: {
    canonical: 'https://sellchecker.app/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
