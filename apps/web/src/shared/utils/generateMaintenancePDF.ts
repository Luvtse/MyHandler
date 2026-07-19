// jsPDF unavailable in this environment — stub implementation
import { VehicleWithMaintenance } from '@/types/fleet';

export const generateMaintenancePDF = (vehicle: VehicleWithMaintenance): void => {
  console.warn('PDF generation is not available in this environment.');
  alert('PDF generation is not available. Please use the export feature from the server.');
};
