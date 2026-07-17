
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface TrackingFormProps {
  onSubmit: (trackingNumber: string) => void;
}

const TrackingForm = ({ onSubmit }: TrackingFormProps) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }
    
    if (trackingNumber.trim().length < 13) {
      setError('Tracking number must be at least 13 characters');
      return;
    }
    
    setError('');
    onSubmit(trackingNumber);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Track Your Shipment</h2>
      <p className="text-gray-600 mb-6">
        Enter your tracking number to get detailed information about your package status and location.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number (e.g., ANU0000000000)"
            className={`pr-12 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        
        <Button type="submit" className="mt-4 w-full bg-brand hover:bg-brand-600">
          <Search className="mr-2 h-5 w-5" />
          Track Package
        </Button>
      </form>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Need help?</h3>
        <p className="text-gray-600 text-sm">
          Tracking number can be found in your shipping confirmation email or receipt. 
          If you're having trouble, please <a href="/support" className="text-brand hover:underline">contact our support team</a>.
        </p>
      </div>
    </div>
  );
};

export default TrackingForm;
