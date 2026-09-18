import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShipmentForm } from '@/components/shipments/ShipmentForm';
import { Button } from '@/shared/ui/Button';

const ResumeDraft: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const draftId = searchParams.get('draftId') || undefined;

  const handleBack = () => {
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
        <Button variant="outline" onClick={handleBack}>
          Cancel
        </Button>
      </div>
      <ShipmentForm 
        mode="resume-draft" 
        awb={draftId} 
        onSuccess={handleSuccess} 
        onCancel={handleBack} 
      />
    </div>
  );
};

export default ResumeDraft;
