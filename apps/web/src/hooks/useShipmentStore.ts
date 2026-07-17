// hooks/useShipmentStore.ts

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiService, apiRequestData } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Shipment } from "@/types/shipment";

interface ShipmentError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
}

interface AWBGenerationState {
  isLoading: boolean;
  error: ShipmentError | null;
  awbStatus: 'idle' | 'generating' | 'success' | 'error';
  generatedAWB?: string;
}

export function useShipmentStore() {
  const [state, setState] = useState<AWBGenerationState>({
    isLoading: false,
    error: null,
    awbStatus: 'idle'
  });
  
  const { toast } = useToast();

  const handleApiError = (err: unknown, defaultMessage: string): ShipmentError => {
    console.error('Shipment API Error:', err);
    
    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = defaultMessage;
    let errorDetails = {};
    let retryable = false;

    if (err instanceof Error) {
      errorCode = err.message.includes('AWB') ? 'AWB_GENERATION_FAILED' : 'API_ERROR';
      errorMessage = err.message;
      errorDetails = { stack: err.stack };
      retryable = errorCode === 'AWB_GENERATION_FAILED';
    } else if (typeof err === 'string') {
      errorCode = 'VALIDATION_ERROR';
      errorMessage = err;
      retryable = true;
    }

    const shipmentError: ShipmentError = {
      code: errorCode,
      message: errorMessage,
      details: errorDetails,
      retryable
    };

    if (errorCode === 'AWB_GENERATION_FAILED') {
      toast({
        title: "AWB Generation Issue",
        description: "Shipment was created with a draft AWB. We'll assign a final number shortly.",
        variant: "default",
      });
    } else {
      toast({
        title: `Error (${errorCode})`,
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    return shipmentError;
  };

  const createNewShipment = async (shipmentData: Omit<Shipment, 'id' | 'awbNumber' | 'createdAt'>): Promise<Shipment | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, awbStatus: 'generating' }));
    
    try {
      const backendShipmentData = {
        originAddress: shipmentData.sender?.address1,
        originCompany: shipmentData.sender?.company,
        originCity: shipmentData.sender?.city,
        originCountry: shipmentData.sender?.country,
        destinationAddress: shipmentData.recipient?.address1,
        destinationCompany: shipmentData.recipient?.company,
        destinationCity: shipmentData.recipient?.city,
        destinationCountry: shipmentData.recipient?.country,
        weightKg: shipmentData.totalWeight,
        dimensionsCm: shipmentData.packageDetails ? 
          `${shipmentData.packageDetails.length}x${shipmentData.packageDetails.width}x${shipmentData.packageDetails.height}` : 
          undefined,
        serviceLevel: shipmentData.serviceType,
        notes: shipmentData.specialInstructions,
        chargesAmount: Number(shipmentData.chargesInformation?.amount || 0),
        chargesCurrency: shipmentData.chargesInformation?.currency || shipmentData.totalCurrency || 'ETB',
        paymentType: String(shipmentData.paymentType || '').toUpperCase(),
        accountNumber: shipmentData.accountNumber,
        status: 'order_received',
      };

      const { success, data, error } = await apiService.request<any>({
        method: 'POST',
        url: API_ENDPOINTS.shipments.create,
        data: backendShipmentData,
      });

      if (!success || !data) {
        throw new Error(error || 'Failed to create shipment');
      }

      const payload = (data && (data.data ?? data)) as any;

      if (!payload.reference) {
        const err = handleApiError('Server response missing AWB', 'Failed to create shipment');
        setState(prev => ({ ...prev, error: err, awbStatus: 'error', isLoading: false }));
        return null;
      }

      const awbValidation = validateAWBResponse(payload.reference);
      if (!awbValidation.isValid) {
        console.warn('Received invalid AWB format:', data.reference);
      }

      const result: Shipment = {
        id: payload.id,
        awbNumber: payload.reference,
        createdAt: payload.createdAt || new Date().toISOString(),
        sender: shipmentData.sender,
        recipient: shipmentData.recipient,
        packageType: shipmentData.packageType,
        serviceType: shipmentData.serviceType,
        packageDetails: shipmentData.packageDetails,
        commodities: shipmentData.commodities,
        options: shipmentData.options,
        specialInstructions: shipmentData.specialInstructions,
        paymentType: shipmentData.paymentType,
        accountNumber: shipmentData.accountNumber,
        chargesInformation: shipmentData.chargesInformation,
        totalWeight: shipmentData.totalWeight,
        totalValue: shipmentData.totalValue,
        totalCurrency: shipmentData.totalCurrency,
      };

      setState(prev => ({ 
        ...prev, 
        awbStatus: 'success',
        generatedAWB: payload.reference
      }));

      // Updated toast wording
      if (awbValidation.type === 'draft') {
        toast({
          title: "Shipment Created with Draft AWB",
          description: "Your shipment was created successfully. A final AWB number will be assigned shortly.",
          variant: "default",
        });
      } else if (awbValidation.type === 'final') {
        toast({
          title: "Shipment Created Successfully",
        description: `Tracking number: ${payload.reference}`,
      });
      }

      return result;
    } catch (err) {
      const shipmentError = handleApiError(err, 'Failed to create shipment');
      setState(prev => ({ 
        ...prev, 
        error: shipmentError, 
        awbStatus: 'error' 
      }));
      return null;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const retryAWBGeneration = async (shipmentId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { success, data, error } = await apiService.request<any>({
        method: 'POST',
        url: API_ENDPOINTS.shipments.retryAWB(shipmentId),
      });

      if (!success || !data) {
        throw new Error(error || 'Failed to retry AWB generation');
      }

      toast({
        title: "AWB Generation Retried",
        description: "AWB generation has been queued for retry.",
      });

      return true;
    } catch (err) {
      const shipmentError = handleApiError(err, 'Failed to retry AWB generation');
      setState(prev => ({ ...prev, error: shipmentError }));
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetError = () => setState(prev => ({ ...prev, error: null }));
  
  return {
    createNewShipment,
    retryAWBGeneration,
    isLoading: state.isLoading,
    error: state.error,
    awbStatus: state.awbStatus,
    generatedAWB: state.generatedAWB,
    resetError
  };
}

// 🔁 UPDATED: Recognize DRAFT- as temporary
const validateAWBResponse = (awb: string): { isValid: boolean; type: 'draft' | 'final' | 'invalid' } => {
  if (!awb) return { isValid: false, type: 'invalid' };
  
  if (awb.startsWith('DRAFT-')) {
    return { isValid: true, type: 'draft' };
  }
  
  // Final AWB: ANU + 10 digits = 13 characters total
  const iataRegex = /^ANU\d{10}$/;
  const isValid = iataRegex.test(awb);
  
  return { 
    isValid, 
    type: isValid ? 'final' : 'invalid' 
  };
};
