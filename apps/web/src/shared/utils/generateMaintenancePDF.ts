// @/dashboard/fleet/utils/generateMaintenancePDF.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { VehicleWithMaintenance, MaintenanceRecord } from '@/types/fleet';

export const generateMaintenancePDF = (vehicle: VehicleWithMaintenance) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(`Maintenance Record: ${vehicle.plateNumber || vehicle.licensePlate}`, 14, 20);
  doc.setFontSize(12);
  doc.text(`VIN: ${vehicle.vin} • Make: ${vehicle.make} ${vehicle.model}`, 14, 30);
  doc.text(`As of: ${new Date().toLocaleDateString()}`, 14, 36);
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 42, 196, 42);
  
  // Maintenance History Table
  const tableData = (vehicle.maintenanceHistory || []).map((record: MaintenanceRecord) => [
    record.completedAt || record.scheduledAt,
    record.type.replace(/_/g, ' '),
    record.mileageAtService.toLocaleString(),
    record.cost ? `ETB ${record.cost.toLocaleString()}` : 'N/A',
    record.performedByName || 'N/A',
    record.notes || '',
  ]);
  
  (doc as any).autoTable({
    startY: 50,
    head: [['Date', 'Service Type', 'Mileage (km)', 'Cost (ETB)', 'Mechanic', 'Notes']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: {
      5: { cellWidth: 60 }, // Notes column wider
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Confidential – DeliverEase Fleet Management', 14, doc.internal.pageSize.height - 10);
  }
  
  return doc;
};