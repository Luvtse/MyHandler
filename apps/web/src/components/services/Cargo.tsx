import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Package, Scale, Truck, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cargo = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Cargo Services</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start mb-6">
              <Package className="h-8 w-8 text-brand mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Full Load & Partial Load Solutions</h2>
                <p className="text-gray-600">Comprehensive cargo shipping services for businesses of all sizes, with flexible options for both full container loads (FCL) and less than container loads (LCL).</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <Scale className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Flexible Capacity</h3>
                  <p className="text-gray-600">From small parcels to full container loads, we accommodate all cargo sizes.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Truck className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multimodal Transport</h3>
                  <p className="text-gray-600">Seamless integration of road, rail, and sea transportation.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-shipment">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                  Book Cargo Service
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cargo Types</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>General cargo</li>
                <li>Heavy machinery</li>
                <li>Bulk materials</li>
                <li>Perishable goods</li>
                <li>Hazardous materials (with proper certification)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start mb-4">
                <Warehouse className="h-6 w-6 text-brand mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Value-Added Services</h3>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Cargo insurance</li>
                <li>Custom packaging solutions</li>
                <li>Real-time tracking</li>
                <li>Documentation handling</li>
                <li>Customs clearance assistance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cargo;