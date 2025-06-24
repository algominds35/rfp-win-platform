export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using RFP Win Platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Service Description</h2>
            <p className="text-gray-700 mb-4">
              RFP Win Platform is an AI-powered service that helps users analyze RFP documents and generate professional proposals. 
              The service includes document analysis, proposal generation, and related features.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Usage Limits</h2>
            <p className="text-gray-700 mb-4">
              Your usage is limited based on your subscription plan:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Basic Plan: 25 RFP analyses per month</li>
              <li>Professional Plan: 250 RFP analyses per month</li>
              <li>Enterprise Plan: 5,000 RFP analyses per month</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Payment Terms</h2>
            <p className="text-gray-700 mb-4">
              Subscription fees are billed monthly in advance. All fees are non-refundable except as required by law. 
              We reserve the right to change our pricing with 30 days notice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your use complies with applicable laws</li>
              <li>Not sharing your account with others</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The service and its original content, features, and functionality are owned by RFP Win Platform and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              RFP Win Platform shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us at legal@rfpwinplatform.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 