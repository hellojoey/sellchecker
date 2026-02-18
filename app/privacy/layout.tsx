import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SellChecker privacy policy. Learn how we collect, use, and protect your data.',
  alternates: {
    canonical: 'https://sellchecker.app/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
