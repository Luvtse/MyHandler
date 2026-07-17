import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Warehouse, Box, BarChart, Scan, Truck, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

const Warehousing = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Warehousing Solutions</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start mb-6">
              <Warehouse className="h-8 w-8 text-brand mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">State-of-the-Art Facilities</h2>
                <p className="text-gray-600">Modern warehousing facilities with advanced inventory management systems and secure storage solutions for all your business needs.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start">
                <Box className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Storage Solutions</h3>
                  <p className="text-gray-600">Climate-controlled storage with 24/7 security monitoring.</p>
                </div>
              </div>
              <div className="flex items-start">
                <BarChart className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Inventory Management</h3>
                  <p className="text-gray-600">Real-time tracking and automated inventory control.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Scan className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Order Fulfillment</h3>
                  <p className="text-gray-600">Efficient pick, pack, and ship services.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                  Request Consultation
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Facility Features</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <Box className="h-5 w-5 text-brand mr-2" />
                  Temperature-controlled storage
                </li>
                <li className="flex items-center">
                  <Box className="h-5 w-5 text-brand mr-2" />
                  High-security systems
                </li>
                <li className="flex items-center">
                  <Box className="h-5 w-5 text-brand mr-2" />
                  Fire protection systems
                </li>
                <li className="flex items-center">
                  <Box className="h-5 w-5 text-brand mr-2" />
                  Loading docks and equipment
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Value-Added Services</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <Truck className="h-5 w-5 text-brand mr-2" />
                  Cross-docking services
                </li>
                <li className="flex items-center">
                  <ClipboardList className="h-5 w-5 text-brand mr-2" />
                  Quality inspection
                </li>
                <li className="flex items-center">
                  <Box className="h-5 w-5 text-brand mr-2" />
                  Kitting and assembly
                </li>
                <li className="flex items-center">
                  <Box className="h-5 w-5 text-brand mr-2" />
                  Returns processing
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Warehouse Network</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-brand mb-2">15+</div>
                <div className="text-gray-600">Strategic Locations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand mb-2">1M+</div>
                <div className="text-gray-600">Square Feet</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand mb-2">99.9%</div>
                <div className="text-gray-600">Inventory Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Warehousing;