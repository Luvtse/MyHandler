import { apiService } from '@/lib/api/client';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api/endpoints';
import { normalizeStatusId } from '@/lib/tracking-utils';

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  userId?: string;
  status?: string;
  serviceType?: string;
  format: 'excel' | 'csv' | 'pdf';
}

export interface ReportMetadata {
  totalRecords: number;
  dateRange: {
    min: string | null;
    max: string | null;
  };
  generatedAt: string;
}

export interface AvailableReport {
  id: string;
  name: string;
  description: string;
  availableFormats: string[];
  filters: string[];
}

export interface GenerateReportRequest {
  reportType: 'shipments' | 'financial' | 'performance' | 'customers' | 'leaves';
  format: 'excel' | 'csv' | 'pdf';
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  userId?: string;
  status?: string;
  serviceType?: string;
}

class ReportService {
  /**
   * Generate and download report
   */
  async generateReport(request: GenerateReportRequest): Promise<Blob> {
    const { success, data, error } = await apiService.request<Blob>({
      url: API_ENDPOINTS.reports.GENERATE,
      method: 'POST',
      data: request,
      responseType: 'blob',
    });
    if (!success || !data) throw new Error(error || 'Failed to generate report');
    return data as Blob;
  }

  /**
   * Get available report types
   */
  async getAvailableReports(): Promise<AvailableReport[]> {
    const { success, data, error } = await apiService.request<{ data: AvailableReport[] }>({
      url: API_ENDPOINTS.reports.AVAILABLE,
      method: 'GET',
    });
    if (!success || !data) throw new Error(error || 'Failed to get available reports');
    return (data as any).data as AvailableReport[];
  }

  /**
   * Get report metadata (counts, date ranges, etc.)
   */
  async getReportMetadata(reportType: string, filters?: Partial<ReportFilters>): Promise<ReportMetadata> {
    const params = new URLSearchParams();
    params.append('reportType', reportType);
    
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);

    const { success, data, error } = await apiService.request<{ data: ReportMetadata }>({
      url: `${API_ENDPOINTS.reports.METADATA}?${params.toString()}`,
      method: 'GET',
    });
    if (!success || !data) throw new Error(error || 'Failed to get report metadata');
    return (data as any).data as ReportMetadata;
  }

  /**
   * Download report file
   */
  downloadReport(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate report and download automatically
   */
  async generateAndDownloadReport(request: GenerateReportRequest) {
    try {
      const blob = await this.generateReport(request);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${request.reportType}-report-${timestamp}.${request.format === 'excel' ? 'xlsx' : request.format}`;
      this.downloadReport(blob, filename);
      return { success: true, filename };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get shipment report with filters
   */
  async getShipmentReport(filters: ReportFilters) {
    return this.generateAndDownloadReport({
      reportType: 'shipments',
      ...filters,
      status: normalizeStatusId(filters.status),
    });
  }

  /**
   * Get financial report with filters
   */
  async getFinancialReport(filters: ReportFilters) {
    return this.generateAndDownloadReport({
      reportType: 'financial',
      ...filters,
      status: normalizeStatusId(filters.status),
    });
  }

  /**
   * Get performance report with filters
   */
  async getPerformanceReport(filters: ReportFilters) {
    return this.generateAndDownloadReport({
      reportType: 'performance',
      ...filters,
    });
  }

  /**
   * Get customer report with filters
   */
  async getCustomerReport(filters: ReportFilters) {
    return this.generateAndDownloadReport({
      reportType: 'customers',
      ...filters,
    });
  }

  /**
   * Get leave report with filters (HR only)
   */
  async getLeaveReport(filters: ReportFilters) {
    return this.generateAndDownloadReport({
      reportType: 'leaves',
      ...filters,
    });
  }
}

export const reportService = new ReportService();
