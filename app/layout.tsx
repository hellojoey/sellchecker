import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SellChecker — Know Before You Buy',
  description: 'Instant sell-through rates for resellers. Check demand on any item in seconds. Free to use.',
  keywords: ['reselling', 'sell through rate', 'ebay', 'thrifting', 'flipping', 'reseller tools'],
  openGraph: {
    title: 'SellChecker — Know Before You Buy',
    description: 'Instant sell-through rates for resellers. Check demand on any item in seconds.',
    url: 'https://sellchecker.app',
    siteName: 'SellChecker',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SellChecker — Know Before You Buy',
    description: 'Instant sell-through rates for resellers.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
