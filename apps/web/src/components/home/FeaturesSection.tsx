
import React from 'react';
import { MapPin, Package, Shield, Clock } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="logistics-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose AHUNUNU</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            We combine cutting-edge technology with exceptional service to provide the best logistics experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center flex flex-col items-center">
            <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-brand" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">
              Monitor your shipments in real-time with accurate GPS tracking and status updates.
            </p>
          </div>
          
          <div className="text-center flex flex-col items-center">
            <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-brand" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Network</h3>
            <p className="text-gray-600">
              Our extensive network ensures your packages reach virtually any destination worldwide.
            </p>
          </div>
          
          <div className="text-center flex flex-col items-center">
            <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-brand" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Handling</h3>
            <p className="text-gray-600">
              Advanced security measures protect your packages throughout the entire journey.
            </p>
          </div>
          
          <div className="text-center flex flex-col items-center">
            <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-brand" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reliable Service</h3>
            <p className="text-gray-600">
              Count on our proven track record for consistent, on-time delivery performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
