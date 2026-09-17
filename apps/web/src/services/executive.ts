/**
 * Executive Dashboard Service
 * Fetches real-time C-suite metrics from the WORIYA EXPRESS API.
 */
import { apiService } from '@/lib/api/client';

const BASE = '/executive';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExecutiveInsight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  source: 'finance' | 'operations' | 'marketing' | 'clients' | 'fleet';
}

export interface StrategicGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'off_track';
}

// ─── CEO ──────────────────────────────────────────────────────────────────────

export interface CeoMetrics {
  revenue: number;
  ytdGrowth: number;
  customerRetention: number;
  netPromoterScore: number | null;
  onTimeDelivery: number;
  operatingMargin: number | null;
  totalClients: number;
  activeShipments: number;
}

export interface CeoData {
  metrics: CeoMetrics;
  goals: StrategicGoal[];
  insights: ExecutiveInsight[];
  revenueChart: Array<{ month: string; revenue: number }>;
}

export async function getCeoData(): Promise<CeoData> {
  const res = await apiService.request<{ data: CeoData }>({ method: 'GET', url: `${BASE}/ceo` });
  if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load CEO data');
  return (res.data as any).data;
}

// ─── CFO ──────────────────────────────────────────────────────────────────────

export interface CfoMetrics {
  revenue: number;
  ytdGrowth: number;
  netProfit: number;
  cashFlow: number;
  operatingMargin: number | null;
  burnRate: null;
  runway: null;
  roiFleet: null;
  roiMarketing: null;
  roiTech: null;
  overdueInvoices: number;
  overdueAmount: number;
}

export interface CfoData {
  metrics: CfoMetrics;
  invoiceSummary: Array<{ status: string; _count: { id: number }; _sum: { totalAmount: number } }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  insights: ExecutiveInsight[];
}

export async function getCfoData(): Promise<CfoData> {
  const res = await apiService.request<{ data: CfoData }>({ method: 'GET', url: `${BASE}/cfo` });
  if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load CFO data');
  return (res.data as any).data;
}

// ─── COO ──────────────────────────────────────────────────────────────────────

export interface CooMetrics {
  onTimeDeliveryRate: number;
  avgFulfillmentTime: number;
  shipmentsProcessed: number;
  activeVehicles: number;
  idleVehicles: number;
  fleetUtilization: number;
  inventoryTurnover: number;
  costPerShipment: null;
  customsClearanceTime: null;
  delayedShipments: number;
  stockoutItems: number;
}

export interface CooData {
  metrics: CooMetrics;
  fulfillmentTrend: Array<{ day: string; time: number }>;
  insights: ExecutiveInsight[];
}

export async function getCooData(): Promise<CooData> {
  const res = await apiService.request<{ data: CooData }>({ method: 'GET', url: `${BASE}/coo` });
  if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load COO data');
  return (res.data as any).data;
}

// ─── CMO ──────────────────────────────────────────────────────────────────────

export interface CmoMetrics {
  totalLeads: number;
  conversionRate: number;
  costPerAcquisition: null;
  roi: null;
  emailOpenRate: null;
  socialEngagement: null;
  websiteTraffic: null;
  retentionRate: number;
  wonDeals: number;
  pendingDeals: number;
  lostDeals: number;
  activeClients: number;
  totalClients: number;
  marketingSourcedRevenue: number;
}

export interface CmoData {
  metrics: CmoMetrics;
  funnelData: Array<{ name: string; value: number }>;
  atRiskClients: Array<{ id: string; name: string; status: string; updatedAt: string }>;
  recentAcquisitions: Array<any>;
  insights: ExecutiveInsight[];
}

export async function getCmoData(): Promise<CmoData> {
  const res = await apiService.request<{ data: CmoData }>({ method: 'GET', url: `${BASE}/cmo` });
  if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load CMO data');
  return (res.data as any).data;
}
