
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Package, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-br from-brand-50 to-white py-16 md:py-24">
      <div className="logistics-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Fast & Reliable <span className="text-brand">Logistics</span> Services
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Fast. Reliable. Affordable. Delivering your packages safely and on time, every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-shipment" className="w-full sm:w-auto">
                <Button className="w-full bg-brand hover:bg-brand-600 text-lg py-6">
                  <Package className="mr-2 h-5 w-5" />
                  Create Shipment
                </Button>
              </Link>
              <Link to="/schedule-pickup" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-brand text-brand hover:bg-brand-50 text-lg py-6">
                  <Truck className="mr-2 h-5 w-5" />
                  Schedule Pickup
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Track Your Shipment</h2>
              <p className="text-gray-600">Enter your tracking number to get the latest status</p>
            </div>
            <div className="space-y-4">
              <Input 
                type="text" 
                placeholder="Enter tracking number" 
                className="border-gray-300 focus:ring-brand focus:border-brand" 
              />
              <Link to="/tracking">
                <Button className="w-full bg-brand hover:bg-brand-600">
                  <Search className="mr-2 h-5 w-5" />
                  Track Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
