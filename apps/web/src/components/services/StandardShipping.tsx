import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Truck, Scale, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const StandardShipping = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Standard Shipping Service</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start mb-6">
              <Truck className="h-8 w-8 text-brand mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reliable Ground Shipping</h2>
                <p className="text-gray-600">Cost-effective shipping solutions for your regular delivery needs with reliable transit times and competitive rates.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <Scale className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Flexible Weight Options</h3>
                  <p className="text-gray-600">Accommodating packages from small parcels to large freight shipments.</p>
                </div>
              </div>
              <div className="flex items-start">
                <DollarSign className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Competitive Pricing</h3>
                  <p className="text-gray-600">Affordable rates with volume discounts available for regular shippers.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-shipment">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                  Create Standard Shipment
                </Button>
              </Link>
              <Link to="/schedule-pickup">
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  Schedule Pickup
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivery Timeframes</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>2-3 business days within the same region</li>
              <li>3-5 business days for cross-regional delivery</li>
              <li>Regular pickup schedules available</li>
              <li>Full tracking and insurance coverage</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StandardShipping;