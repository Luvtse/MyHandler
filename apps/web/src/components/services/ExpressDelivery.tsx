import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Package, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExpressDelivery = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Express Delivery Service</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start mb-6">
              <Package className="h-8 w-8 text-brand mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Same-Day & Next-Day Delivery</h2>
                <p className="text-gray-600">When time is critical, our express delivery service ensures your packages reach their destination quickly and safely.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Fast Delivery Times</h3>
                  <p className="text-gray-600">Same-day delivery within city limits and next-day delivery for nearby regions.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Secure Handling</h3>
                  <p className="text-gray-600">Priority handling with extra care for your time-sensitive packages.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-shipment">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                  Create Express Shipment
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Coverage</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Same-day delivery within 50km radius</li>
              <li>Next-day delivery within 200km radius</li>
              <li>Priority handling and real-time tracking</li>
              <li>Dedicated customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExpressDelivery;