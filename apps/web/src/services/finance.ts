import { apiService, apiRequestData } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  awbNumber?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  paidAmount?: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  notes?: string;
  terms?: string;
  currency?: string;
}

export interface UpdateInvoiceRequest {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paidAmount?: number;
  notes?: string;
  terms?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference: string;
  paidAt: string;
  notes?: string;
  createdAt: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  paidAt: string;
  notes?: string;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  bankAccount?: string;
  mobileNumber?: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayoutRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  bankAccount?: string;
  mobileNumber?: string;
  description: string;
}

export interface UpdatePayoutStatusRequest {
  status: 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
  rejectionReason?: string;
  notes?: string;
}

export interface FinanceMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  overdueInvoices: number;
  pendingPayouts: number;
  totalCustomers: number;
  averageInvoiceValue: number;
}

export interface AgingReportItem {
  customerId: string;
  customerName: string;
  current: number;
  thirtyDays: number;
  sixtyDays: number;
  ninetyDays: number;
  total: number;
}

export interface RevenueAnalytics {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

class FinanceService {
  // Invoice Management
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return apiService.request<{ 
      data: Invoice[]; 
      total: number; 
      page: number; 
      limit: number;
      totalPages: number;
    }>({
      url: API_ENDPOINTS.finance.INVOICES,
      method: 'GET',
      params
    });
  }

  async getInvoice(id: string) {
    return await apiRequestData<Invoice>({
      url: `${API_ENDPOINTS.finance.INVOICES}/${id}`,
      method: 'GET'
    });
  }

  async createInvoice(data: CreateInvoiceRequest) {
    return await apiRequestData<Invoice>({
      url: API_ENDPOINTS.finance.INVOICES,
      method: 'POST',
      data
    });
  }

  async updateInvoice(id: string, data: UpdateInvoiceRequest) {
    return await apiRequestData<Invoice>({
      url: `${API_ENDPOINTS.finance.INVOICES}/${id}`,
      method: 'PATCH',
      data
    });
  }

  async deleteInvoice(id: string) {
    return apiService.request<{ success: boolean }>({
      url: `${API_ENDPOINTS.finance.INVOICES}/${id}`,
      method: 'DELETE'
    });
  }

  async sendInvoice(id: string) {
    return apiService.request<{ success: boolean; message: string }>({
      url: `${API_ENDPOINTS.finance.INVOICES}/${id}/send`,
      method: 'POST'
    });
  }

  // Payment Management
  async getPayments(params?: {
    page?: number;
    limit?: number;
    invoiceId?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return apiService.request<{
      data: PaymentRecord[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>({
      url: API_ENDPOINTS.finance.PAYMENTS,
      method: 'GET',
      params
    });
  }

  async recordPayment(data: CreatePaymentRequest) {
    return await apiRequestData<PaymentRecord>({
      url: API_ENDPOINTS.finance.PAYMENTS,
      method: 'POST',
      data
    });
  }

  // Payout Request Management
  async getPayoutRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) {
    return apiService.request<{
      data: PayoutRequest[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>({
      url: API_ENDPOINTS.finance.PAYOUT_REQUESTS,
      method: 'GET',
      params
    });
  }

  async getPayoutRequest(id: string) {
    return await apiRequestData<PayoutRequest>({
      url: `${API_ENDPOINTS.finance.PAYOUT_REQUESTS}/${id}`,
      method: 'GET'
    });
  }

  async createPayoutRequest(data: CreatePayoutRequest) {
    return await apiRequestData<PayoutRequest>({
      url: API_ENDPOINTS.finance.PAYOUT_REQUESTS,
      method: 'POST',
      data
    });
  }

  async updatePayoutRequestStatus(id: string, data: UpdatePayoutStatusRequest) {
    return await apiRequestData<PayoutRequest>({
      url: `${API_ENDPOINTS.finance.PAYOUT_REQUESTS}/${id}/status`,
      method: 'PATCH',
      data
    });
  }

  async deletePayoutRequest(id: string) {
    return apiService.request<{ success: boolean }>({
      url: `${API_ENDPOINTS.finance.PAYOUT_REQUESTS}/${id}`,
      method: 'DELETE'
    });
  }

  // Analytics and Reports
  async getFinanceMetrics() {
    try {
      return await apiRequestData<FinanceMetrics>({
        url: `${API_ENDPOINTS.finance.ANALYTICS}/metrics`,
        method: 'GET'
      });
    } catch {
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        overdueInvoices: 0,
        pendingPayouts: 0,
        totalCustomers: 0,
        averageInvoiceValue: 0,
      };
    }
  }

  async getRevenueAnalytics(params?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      return await apiRequestData<RevenueAnalytics[]>({
        url: `${API_ENDPOINTS.finance.ANALYTICS}/revenue`,
        method: 'GET',
        params
      });
    } catch {
      return [
        { month: 'Jan', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Feb', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Mar', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Apr', revenue: 0, expenses: 0, profit: 0 },
        { month: 'May', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Jun', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Jul', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Aug', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Sep', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Oct', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Nov', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Dec', revenue: 0, expenses: 0, profit: 0 },
      ];
    }
  }

  async getAgingReport() {
    return await apiRequestData<AgingReportItem[]>({
      url: `${API_ENDPOINTS.finance.REPORTS}/aging`,
      method: 'GET'
    });
  }

  async getPaymentMethodStats(params?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    return await apiRequestData<PaymentMethodStats[]>({
      url: `${API_ENDPOINTS.finance.ANALYTICS}/payment-methods`,
      method: 'GET',
      params
    });
  }

  // Utility Methods
  async exportInvoices(format: 'csv' | 'pdf', params?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    customerId?: string;
  }) {
    return apiService.request<Blob>({
      url: `${API_ENDPOINTS.finance.INVOICES}/export`,
      method: 'GET',
      params: { ...params, format },
      responseType: 'blob'
    });
  }

  async exportAgingReport(format: 'csv' | 'pdf') {
    return apiService.request<Blob>({
      url: `${API_ENDPOINTS.finance.REPORTS}/aging/export`,
      method: 'GET',
      params: { format },
      responseType: 'blob'
    });
  }
}

export const financeService = new FinanceService();
