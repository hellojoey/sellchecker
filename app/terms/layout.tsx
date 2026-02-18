import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SellChecker terms of service. Read our terms and conditions for using the SellChecker platform.',
  alternates: {
    canonical: 'https://sellchecker.app/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
