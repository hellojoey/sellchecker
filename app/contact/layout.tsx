import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & FAQ',
  description: 'Get in touch with the SellChecker team. Find answers to frequently asked questions about sell-through rates, pricing, and features.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
