import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = 'February 17, 2026';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              SellChecker (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website at sellchecker.app.
              This Privacy Policy explains how we collect, use, and protect your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Account Information</h3>
            <p className="text-gray-600 leading-relaxed">
              When you create an account, we collect your email address and first name.
              Your password is securely hashed and stored by our authentication provider (Supabase).
            </p>
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Search Data</h3>
            <p className="text-gray-600 leading-relaxed">
              We store your search queries and results to provide features like search history,
              saved searches, and trending searches. This data is associated with your account.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Payment Information</h3>
            <p className="text-gray-600 leading-relaxed">
              Payment processing is handled entirely by Stripe. We do not store your credit card
              number or full payment details. We only store your Stripe customer ID and subscription
              status to manage your plan.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Automatically Collected Information</h3>
            <p className="text-gray-600 leading-relaxed">
              We use Plausible Analytics, a privacy-friendly analytics service that does not use
              cookies and does not collect personal data. It provides aggregate statistics like
              page views and referral sources without tracking individual users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>To provide and maintain the SellChecker service</li>
              <li>To process your searches and display sell-through rate data</li>
              <li>To manage your account and subscription</li>
              <li>To send transactional emails (account confirmation, password reset)</li>
              <li>To display your search history and saved searches</li>
              <li>To generate trending search data (anonymized, aggregated)</li>
              <li>To improve and optimize our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data from Third Parties</h2>
            <p className="text-gray-600 leading-relaxed">
              SellChecker retrieves publicly available listing data from eBay to calculate
              sell-through rates and pricing information. This data includes listing titles, prices,
              conditions, and images from public eBay search results. We are not affiliated with
              or endorsed by eBay Inc.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, rent, or share your personal information with third parties for
              marketing purposes. We share data only with the following service providers who
              assist in operating our service:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-2">
              <li><strong>Supabase</strong> &mdash; Database hosting and authentication</li>
              <li><strong>Stripe</strong> &mdash; Payment processing</li>
              <li><strong>Vercel</strong> &mdash; Website hosting</li>
              <li><strong>Resend</strong> &mdash; Transactional email delivery</li>
              <li><strong>Plausible</strong> &mdash; Privacy-friendly analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate security measures to protect your data, including encrypted
              connections (HTTPS/TLS), secure password hashing, and row-level security policies
              on our database to ensure users can only access their own data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              Your account data is retained as long as your account is active. Search cache data
              is automatically deleted after 24 hours. If you wish to delete your account and
              associated data, please contact us at{' '}
              <a href="mailto:hello@sellchecker.app" className="text-green-600 hover:text-green-700 underline">
                hello@sellchecker.app
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              SellChecker uses only essential cookies required for authentication and session
              management. We do not use tracking cookies, advertising cookies, or any third-party
              cookies. Our analytics provider (Plausible) is fully cookieless.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time.
              You can update your profile information from your account settings or contact us to
              request data deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              SellChecker is not intended for use by anyone under the age of 13. We do not
              knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify users of any
              material changes by updating the &quot;Last updated&quot; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:hello@sellchecker.app" className="text-green-600 hover:text-green-700 underline">
                hello@sellchecker.app
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-sm text-green-600 hover:text-green-700 font-medium">
            &larr; Back to SellChecker
          </Link>
        </div>
      </div>
    </div>
  );
}
