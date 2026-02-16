import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'SellChecker pricing plans. Free plan with 5 daily searches. Pro plan for $10/month with unlimited SellChecks, Smart Insights, Deal Calculator, and more.',
  alternates: {
    canonical: 'https://sellchecker.app/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
