import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Scale, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start mb-8">
            <FileText className="h-10 w-10 text-brand mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
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
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <AlertCircle className="h-6 w-6 text-yellow-400 mr-3" />
                <p className="text-yellow-700">
                  Please read these terms and conditions carefully before using our services.
                  By using our services, you agree to be bound by these terms.
                </p>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Service Agreement</h2>
              <p className="text-gray-600 mb-4">
                These terms and conditions govern the use of logistics and shipping services provided by WORIYA EXPRESS.
                By using our services, you enter into a binding agreement with us subject to these terms.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Service availability and coverage areas</li>
                <li>Shipping restrictions and prohibited items</li>
                <li>Service level agreements and delivery times</li>
                <li>Payment terms and billing procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Liability and Insurance</h2>
              <div className="flex items-start mb-4">
                <Shield className="h-6 w-6 text-brand mr-3 mt-1" />
                <div className="text-gray-600">
                  <p className="mb-4">
                    Our liability for loss or damage is limited as specified in our shipping insurance policy.
                    Additional insurance coverage may be purchased for valuable items.
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Standard liability coverage limits</li>
                    <li>Additional insurance options</li>
                    <li>Claims process and requirements</li>
                    <li>Exclusions and limitations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Privacy and Data Protection</h2>
              <div className="flex items-start mb-4">
                <Scale className="h-6 w-6 text-brand mr-3 mt-1" />
                <div className="text-gray-600">
                  <p className="mb-4">
                    We are committed to protecting your privacy and handling your data in accordance with applicable laws.
                    For detailed information, please refer to our Privacy Policy.
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Data collection and usage</li>
                    <li>Information security measures</li>
                    <li>Third-party data sharing</li>
                    <li>User rights and access</li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Need Clarification?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our terms and conditions, please don't hesitate to contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/support">
                  <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  Download Full Terms (PDF)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;