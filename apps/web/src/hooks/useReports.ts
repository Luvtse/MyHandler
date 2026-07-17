import { useQuery, useMutation } from '@tanstack/react-query';
import { reportService, GenerateReportRequest, ReportFilters } from '@/services/reportService';

/**
 * Hook to get available report types
 */
export const useAvailableReports = () => {
  return useQuery({
    queryKey: ['available-reports'],
    queryFn: () => reportService.getAvailableReports(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get report metadata
 */
export const useReportMetadata = (reportType: string, filters?: Partial<ReportFilters>) => {
  return useQuery({
    queryKey: ['report-metadata', reportType, filters],
    queryFn: () => reportService.getReportMetadata(reportType, filters),
    enabled: !!reportType,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to generate reports
 */
export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (request: GenerateReportRequest) => reportService.generateAndDownloadReport(request),
    onSuccess: (data) => {
      console.log('Report generated successfully:', data.filename);
    },
    onError: (error) => {
      console.error('Error generating report:', error);
    },
  });
};

/**
 * Hook to generate shipment reports
 */
export const useShipmentReport = () => {
  return useMutation({
    mutationFn: (filters: ReportFilters) => reportService.getShipmentReport(filters),
    onSuccess: (data) => {
      console.log('Shipment report generated successfully:', data.filename);
    },
    onError: (error) => {
      console.error('Error generating shipment report:', error);
    },
  });
};

/**
 * Hook to generate financial reports
 */
export const useFinancialReport = () => {
  return useMutation({
    mutationFn: (filters: ReportFilters) => reportService.getFinancialReport(filters),
    onSuccess: (data) => {
      console.log('Financial report generated successfully:', data.filename);
    },
    onError: (error) => {
      console.error('Error generating financial report:', error);
    },
  });
};

/**
 * Hook to generate performance reports
 */
export const usePerformanceReport = () => {
  return useMutation({
    mutationFn: (filters: ReportFilters) => reportService.getPerformanceReport(filters),
    onSuccess: (data) => {
      console.log('Performance report generated successfully:', data.filename);
    },
    onError: (error) => {
      console.error('Error generating performance report:', error);
    },
  });
};

/**
 * Hook to generate customer reports
 */
export const useCustomerReport = () => {
  return useMutation({
    mutationFn: (filters: ReportFilters) => reportService.getCustomerReport(filters),
    onSuccess: (data) => {
      console.log('Customer report generated successfully:', data.filename);
    },
    onError: (error) => {
      console.error('Error generating customer report:', error);
    },
  });
};

/**
 * Hook to generate leave reports (HR only)
 */
export const useLeaveReport = () => {
  return useMutation({
    mutationFn: (filters: ReportFilters) => reportService.getLeaveReport(filters),
    onSuccess: (data) => {
      console.log('Leave report generated successfully:', data.filename);
    },
    onError: (error) => {
      console.error('Error generating leave report:', error);
    },
  });
};