import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShipmentForm } from '@/components/shipments/ShipmentForm';
import { Button } from '@/shared/ui/Button';

const CreateShipmentPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/dashboard/shipments');
  };

  const handleSuccess = (awb?: string) => {
    if (awb) {
      navigate(`/dashboard/shipments/${awb}`);
    } else {
      navigate('/dashboard/shipments');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
      <ShipmentForm mode="create" onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default CreateShipmentPage;
