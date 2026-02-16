import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

const SITE_URL = 'https://sellchecker.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SellChecker — Know Before You Buy',
    template: '%s | SellChecker',
  },
  description: 'Instant sell-through rates for resellers. Check demand, pricing, and competition on any eBay item in seconds. Free to use.',
  keywords: ['reselling', 'sell through rate', 'ebay', 'thrifting', 'flipping', 'reseller tools', 'sell through rate calculator', 'ebay sell through rate', 'reseller calculator'],
  authors: [{ name: 'SellChecker' }],
  creator: 'SellChecker',
  openGraph: {
    title: 'SellChecker — Know Before You Buy',
    description: 'Instant sell-through rates for resellers. Check demand on any item in seconds.',
    url: SITE_URL,
    siteName: 'SellChecker',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SellChecker — Know Before You Buy',
    description: 'Instant sell-through rates for resellers.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
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
        <PwaInstallPrompt />
        {/* Plausible Analytics — privacy-friendly, no cookies, GDPR compliant */}
        <Script
          defer
          data-domain="sellchecker.app"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
