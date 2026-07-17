// src/types/account.types.ts

// Enums
export type QuotationStatus = 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type ApprovalLevel = 'manager' | 'director' | 'finance';
export type ServiceType = 'express' | 'standard' | 'international' | 'warehousing';

// Client
export interface Client {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'at_risk' | 'inactive';
  serviceLevel: 'standard' | 'express' | 'premium';
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  address: string;
  notes: string | null;
  assignedFleet: number;
  approvalThreshold: number | null; // e.g., 500000
  createdAt: string;
  updatedAt: string;
}

// Quotation Line Item
export interface QuotationLineItem {
  id: string;
  serviceType: ServiceType;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Quotation
export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  validUntil: string;
  notes: string | null;
  status: QuotationStatus;
  version: number;
  parentId: string | null;
  subtotal: number;
  tax: number;
  total: number;
  createdBy: string;
  preparedBy: string;
  createdAt: string;
  updatedAt: string;
  lineItems: QuotationLineItem[];
}

export interface QuotationWithClient extends Quotation {
  client: {
    name: string;
    address: string;
    contactName: string;
    contactEmail: string;
  };
}

// Approval
export interface QuotationApproval {
  id: string;
  quotationId: string;
  level: ApprovalLevel;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comments: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
}

// Renewal
export interface Renewal {
  id: string;
  clientId: string;
  clientName: string;
  currentContractValue: number;
  proposedValue: number;
  renewalDate: string;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  ownerId: string;
  ownerName: string;
  lastContact: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Analytics
export interface AccountAnalyticsSnapshot {
  id: string;
  clientId: string;
  month: string; // "2026-01"
  totalSpend: number;
  shipmentCount: number;
  avgSatisfaction: number;
  supportTickets: number;
  renewalProbability: number;
  createdAt: string;
}

export interface AccountMetrics {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  totalMonthlyRevenue: number;
  avgSatisfaction: number;
  renewalRate: number;
}

// API Responses
export interface GetQuotationResponse {
  success: boolean;
  data: { quotation: QuotationWithClient };
}

export interface GetApprovalsResponse {
  success: boolean;
  data: { approvals: QuotationApproval[] };
}

export interface GetAnalyticsResponse {
  success: boolean;
  data: { snapshots: AccountAnalyticsSnapshot[]; metrics: AccountMetrics };
}

export interface CreateQuotationDto {
  clientId: string;
  lineItems: {
    serviceType: ServiceType;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  validUntil: string;
  notes?: string;
}