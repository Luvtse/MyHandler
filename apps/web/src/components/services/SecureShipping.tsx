import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Camera, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecureShipping = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Secure Shipping Service</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start mb-6">
              <Shield className="h-8 w-8 text-brand mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Enhanced Security Shipping</h2>
                <p className="text-gray-600">Maximum protection for high-value items and sensitive documents with advanced security measures.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <Lock className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Tamper-Proof Packaging</h3>
                  <p className="text-gray-600">Special security seals and reinforced packaging materials.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Camera className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Video Surveillance</h3>
                  <p className="text-gray-600">24/7 monitoring throughout the shipping journey.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-shipment">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                  Create Secure Shipment
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  Security Consultation
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>GPS tracking and real-time monitoring</li>
                <li>Signature verification at pickup and delivery</li>
                <li>Secure storage facilities</li>
                <li>Insurance coverage up to $100,000</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start mb-4">
                <UserCheck className="h-6 w-6 text-brand mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Verified Personnel</h3>
              </div>
              <p className="text-gray-600">
                All personnel handling secure shipments undergo thorough background checks and regular security training.
                Your valuable items are always in trusted hands.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SecureShipping;