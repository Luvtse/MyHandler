import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShipmentForm } from '@/components/shipments/ShipmentForm';
import { Button } from '@/shared/ui/Button';

const ViewShipment: React.FC = () => {
  const { awb } = useParams<{ awb: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard/shipments');
  };

  const handleEdit = () => {
    navigate(`/dashboard/shipments/${awb}/edit`);
  };

  if (!awb) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>AWB number not provided</p>
        <button 
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          Back to Shipments
        </Button>
        <Button onClick={handleEdit}>
          Edit Shipment
        </Button>
      </div>
      <ShipmentForm mode="view" awb={awb} />
    </div>
  );
};

export default ViewShipment;
