// src/types/executive.types.ts

// COO-Specific Metrics
export interface OperationalMetrics {
  onTimeDeliveryRate: number;      // 0-100
  avgFulfillmentTime: number;      // hours
  shipmentsProcessed: number;
  activeVehicles: number;
  fleetUtilization: number;        // 0-100
  inventoryTurnover: number;
  costPerShipment: number;         // ETB
  customsClearanceTime: number;    // hours
}

// AI Insights
export interface OperationalInsight {
  id: string;
  title: string;
  message: string;
  confidence: number; // 0.0 - 1.0
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

// API Responses
export interface GetCooMetricsResponse {
  success: boolean;
  data: { metrics: OperationalMetrics };
}

export interface GetCooInsightsResponse {
  success: boolean;
  data: { insights: OperationalInsight[] };
}

// CFO

export interface FinancialMetrics {
  netProfit: number;
  cashFlow: number;
  revenue: number;
  operatingMargin: number;
  burnRate: number;
  runway: number;
  roiFleet: number;
  roiMarketing: number;
  roiTech: number;
  ytdGrowth: number;
}

export interface FinancialInsight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface GetCfoMetricsResponse {
  success: boolean;
  data: { metrics: FinancialMetrics };
}

export interface GetCfoInsightsResponse {
  success: boolean;
  data: { insights: FinancialInsight[] };
}

// CMO

// Shared between CMO and Account Manager
export interface ClientAcquisition {
  id: string;
  clientName: string;
  sourceChannel: string;
  quotationValue: number;
  status: 'won' | 'pending' | 'lost';
  accountManager: string;
  createdAt: string;
}

export interface AtRiskClient {
  id: string;
  name: string;
  reason: 'low_satisfaction' | 'contract_expiring' | 'high_tickets';
  lastContact: string;
  accountManager: string;
}

// API Response
export interface GetCmoIntegratedResponse {
  success: boolean;
  data: {
    metrics: MarketingMetrics[];
    campaigns: CampaignPerformance[];
    wonClients: ClientAcquisition[];
    atRiskClients: AtRiskClient[];
  };
}

export interface MarketingMetrics {
  totalLeads: number;
  conversionRate: number;
  costPerAcquisition: number;
  roi: number;
  emailOpenRate: number;
  socialEngagement: number;
  websiteTraffic: number;
  retentionRate: number;
}

export interface CampaignPerformance {
  id: string;
  name: string;
  channel: 'email' | 'social' | 'search' | string; // Use string for flexibility
  spend: number;
  leads: number;
  conversions: number;
  roi: number;
  cac: number; // Cost Per Acquisition
}

// Optional: For your funnel data
export interface FunnelData {
  value: number;
  name: string;
}

// CEO

// Add to existing file
export interface StrategicMetrics {
  revenue: number;
  ytdGrowth: number;
  customerRetention: number;
  netPromoterScore: number;
  onTimeDelivery: number;
  operatingMargin: number;
  totalClients: number;
  activeShipments: number;
}

export interface StrategicInsight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  source: 'finance' | 'operations' | 'marketing' | 'clients';
}

export interface StrategicGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'off_track';
}

export interface GetCeoMetricsResponse {
  success: boolean;
  data:
   {
    metrics: StrategicMetrics;
    goals: StrategicGoal[];
    insights: StrategicInsight[];
  };
}

// REGIONAL MANAGER

// Add to existing file
export interface RegionalMetrics {
  region: string;
  shipments: number;
  revenue: number;
  activeClients: number;
  fleetUtilization: number;
  onTimeDelivery: number;
  avgFulfillmentTime: number;
  costPerShipment: number;
  clientRetention: number;
}

export interface RegionalInsight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface GetRegionalMetricsResponse {
  success: boolean;
  data:
   {
    metrics: RegionalMetrics;
    insights: RegionalInsight[];
    region: string;
  };
}
