import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Globe, FileText, Shield, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

const International = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">International Shipping</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start mb-6">
              <Globe className="h-8 w-8 text-brand mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Global Logistics Solutions</h2>
                <p className="text-gray-600">Comprehensive international shipping services with customs handling and worldwide delivery expertise.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <FileText className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Customs Expertise</h3>
                  <p className="text-gray-600">Professional customs clearance and documentation handling.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Map className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Global Coverage</h3>
                  <p className="text-gray-600">Delivery services to over 200 countries and territories.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-shipment">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                  Ship Internationally
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  Get Quote
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Door-to-door delivery worldwide</li>
                <li>Customs clearance assistance</li>
                <li>International tracking</li>
                <li>Insurance coverage</li>
                <li>Multiple service speeds available</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Documentation Support</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Commercial invoice preparation</li>
                <li>Export documentation</li>
                <li>Certificate of origin</li>
                <li>Dangerous goods declaration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default International;