import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Shield, Lock, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start mb-8">
            <Shield className="h-10 w-10 text-brand mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Collection</h2>
              <p className="text-gray-600 mb-4">
                We collect information necessary to provide logistics and delivery services, including contact details,
                shipment information, and usage data. We do not collect sensitive personal data unless required and with consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Use of Information</h2>
              <p className="text-gray-600 mb-4">
                Your information is used to operate, maintain, and improve our services, process shipments, communicate updates,
                and comply with legal obligations. We may use aggregated analytics to enhance user experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-600 mb-4">
                We retain your information only as long as necessary for the purposes described and as required by law.
                When no longer needed, data is securely deleted or anonymized.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <div className="flex items-start mb-4">
                <Lock className="h-6 w-6 text-brand mr-3 mt-1" />
                <div className="text-gray-600">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Access, update, or delete your personal information</li>
                    <li>Object to or restrict certain processing activities</li>
                    <li>Request data portability</li>
                    <li>Withdraw consent where applicable</li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Our Privacy Team</h2>
              <p className="text-gray-600 mb-4">
                For privacy-related questions or requests, reach out to our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/support">
                  <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  <FileText className="h-4 w-4 mr-2" /> Download Policy (PDF)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default PrivacyPolicy