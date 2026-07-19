
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
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
        <Search className="h-6 w-6 text-brand" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Track Your Shipment</h2>
      <p className="text-gray-500 mb-6 leading-relaxed text-sm">
        Enter your tracking number to get detailed information about your package status and location.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g., ANU0000000000"
            className={`h-11 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            aria-invalid={!!error}
          />
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
        </div>

        <Button type="submit" className="mt-4 w-full h-11 bg-brand hover:bg-brand-600 font-semibold">
          <Search className="mr-2 h-5 w-5" />
          Track Package
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">Need help?</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your tracking number can be found in your shipping confirmation email or receipt.
          If you&apos;re having trouble, please <a href="/support" className="text-brand font-medium hover:underline">contact our support team</a>.
        </p>
      </div>
    </div>
  );
};

export default TrackingForm;
