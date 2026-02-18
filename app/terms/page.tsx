import Link from 'next/link';

export default function TermsPage() {
  const lastUpdated = 'February 17, 2026';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using SellChecker at sellchecker.app (&quot;the Service&quot;), you agree
              to be bound by these Terms of Service. If you do not agree to these terms, please
              do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              SellChecker is a research tool that provides sell-through rate data, pricing
              information, and market insights for eBay listings. The Service helps resellers
              make informed buying decisions by analyzing publicly available marketplace data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>You must provide a valid email address to create an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 13 years old to use the Service</li>
              <li>One account per person; sharing accounts is not permitted</li>
              <li>You are responsible for all activity that occurs under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Free and Pro Plans</h2>
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Free Plan</h3>
            <p className="text-gray-600 leading-relaxed">
              Free accounts are limited to 5 searches per day. Additional features such as
              advanced tools, unlimited searches, and saved searches are available through the
              Pro plan.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Pro Plan</h3>
            <p className="text-gray-600 leading-relaxed">
              The Pro plan is a monthly subscription at $10/month, which includes a 7-day free
              trial. You can cancel at any time through your billing portal. Upon cancellation,
              you retain Pro access until the end of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payment and Billing</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Payments are processed securely by Stripe</li>
              <li>Subscriptions renew automatically each month unless cancelled</li>
              <li>You may cancel your subscription at any time via the billing portal</li>
              <li>Refunds are handled on a case-by-case basis; contact us for any billing issues</li>
              <li>We reserve the right to change pricing with 30 days&apos; advance notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              You agree not to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Use automated tools, bots, or scripts to access the Service beyond normal usage</li>
              <li>Resell, redistribute, or commercially exploit SellChecker data without permission</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Circumvent usage limits or rate limiting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Accuracy</h2>
            <p className="text-gray-600 leading-relaxed">
              SellChecker provides data and insights based on publicly available information from
              eBay. While we strive for accuracy, we do not guarantee that the data is complete,
              current, or error-free. Sell-through rates, pricing data, and market insights are
              estimates and should be used as one of many factors in your buying decisions.
              SellChecker is a research tool, not financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The SellChecker name, logo, and all original content, features, and functionality
              of the Service are owned by SellChecker and are protected by applicable intellectual
              property laws. You may not copy, modify, or distribute any part of the Service
              without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed">
              SellChecker uses data from eBay&apos;s public marketplace. We are not affiliated with,
              endorsed by, or sponsored by eBay Inc. eBay and its logos are trademarks of eBay Inc.
              Our use of eBay data is subject to eBay&apos;s terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              SellChecker is provided &quot;as is&quot; without warranties of any kind. To the fullest
              extent permitted by law, we shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to loss of
              profits, data, or business opportunities, arising from your use of the Service.
              Our total liability shall not exceed the amount you paid us in the 12 months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Account Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these
              Terms of Service. You may delete your account at any time by contacting us.
              Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms of Service from time to time. We will notify users of
              material changes by updating the &quot;Last updated&quot; date. Continued use of the
              Service after changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
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
