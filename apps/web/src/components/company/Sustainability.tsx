import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Leaf, Recycle, Battery, Sun, Wind, TreePine } from 'lucide-react';

const Sustainability = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start mb-8">
            <Leaf className="h-10 w-10 text-brand mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Sustainability</h1>
              <p className="text-xl text-gray-600">
                Our commitment to environmental stewardship and sustainable logistics solutions.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <Recycle className="h-8 w-8 text-brand mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Green Initiatives</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Eco-friendly packaging materials</li>
                <li>• Waste reduction programs</li>
                <li>• Recycling facilities at all locations</li>
                <li>• Sustainable supply chain practices</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <Battery className="h-8 w-8 text-brand mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Electric Fleet</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Growing electric vehicle fleet</li>
                <li>• Charging infrastructure development</li>
                <li>• Reduced carbon emissions</li>
                <li>• Smart route optimization</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Environmental Goals</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Sun className="h-6 w-6 text-brand mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Carbon Neutral by 2030</h3>
                  <p className="text-gray-600">Committed to achieving carbon neutrality across all operations through renewable energy adoption and offset programs.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Wind className="h-6 w-6 text-brand mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">100% Renewable Energy</h3>
                  <p className="text-gray-600">Transitioning all facilities to renewable energy sources and implementing energy-efficient technologies.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reforestation Program</h2>
            <div className="flex items-start">
              <TreePine className="h-6 w-6 text-brand mr-4 mt-1" />
              <div>
                <p className="text-gray-600 mb-6">
                  For every 1000 shipments, we plant a tree through our partnership with global reforestation initiatives.
                  Join us in making a positive impact on the environment while meeting your logistics needs.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-4xl font-bold text-brand mb-2">50,000+</div>
                  <div className="text-gray-600">Trees planted to date</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-brand hover:bg-brand-600">
              Download Sustainability Report
            </Button>
            <Button variant="outline" className="border-brand text-brand hover:bg-brand-50">
              Partner With Us
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Sustainability;