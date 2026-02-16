import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Searches',
  description: 'View your saved SellChecker searches, recent search history, and portfolio summary with profit tracking.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
