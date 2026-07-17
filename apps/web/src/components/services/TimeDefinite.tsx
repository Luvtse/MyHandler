import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Clock, Target, AlertCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const TimeDefinite = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Time-Definite Delivery</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start mb-6">
              <Clock className="h-8 w-8 text-brand mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Guaranteed Time Delivery</h2>
                <p className="text-gray-600">Precise delivery scheduling with guaranteed arrival times to meet your specific requirements.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <Target className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Precise Timing</h3>
                  <p className="text-gray-600">Choose your preferred delivery window with guaranteed arrival.</p>
                </div>
              </div>
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-brand mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Priority Handling</h3>
                  <p className="text-gray-600">Dedicated resources to ensure on-time delivery.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-shipment">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                  Schedule Time-Definite Delivery
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  Service Information
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivery Windows</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Morning delivery (9:00 AM - 12:00 PM)</li>
                <li>Afternoon delivery (12:00 PM - 5:00 PM)</li>
                <li>Evening delivery (5:00 PM - 8:00 PM)</li>
                <li>Specific time slot booking available</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start mb-4">
                <Calendar className="h-6 w-6 text-brand mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Money-Back Guarantee</h3>
              </div>
              <p className="text-gray-600">
                If we miss your scheduled delivery window, you're eligible for a service guarantee refund.
                Our commitment to punctuality is backed by our money-back guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TimeDefinite;