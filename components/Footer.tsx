import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">SellChecker</span>
            </div>
            <p className="text-sm text-gray-500">
              Know before you buy. Instant sell-through rates for resellers.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/search" className="hover:text-gray-900 transition">Search</Link></li>
              <li><Link href="/pricing" className="hover:text-gray-900 transition">Pricing</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gray-900 transition">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/contact" className="hover:text-gray-900 transition">Contact</Link></li>
              <li><Link href="/contact#faq" className="hover:text-gray-900 transition">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-gray-900 transition">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-900 transition">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-400 text-center">
          &copy; {new Date().getFullYear()} SellChecker. Not affiliated with eBay Inc.
        </div>
      </div>
    </footer>
  );
}
