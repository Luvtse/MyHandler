// src/modules/executive/executive.service.ts
import { PrismaClient } from '@prisma/client';
import { CmoIntegratedResponse } from './../../../../types/executive';

const db = new PrismaClient();

// Reuse or import this from shared utils if it exists
const formatMetrics = (metrics: any[]) => metrics; // placeholder—replace with real formatter

export const fetchCmoIntegratedData = async (): Promise<CmoIntegratedResponse> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000);

  const [marketingMetrics, campaigns, wonClients, atRiskClients] = await Promise.all([
    db.executiveMetric.findMany({ where: { role: 'cmo' } }),
    
    db.marketingCampaign.findMany({
      where: { date: { gte: thirtyDaysAgo } }
    }),

    db.client.findMany({
      where: {
        status: 'active',
        leadSource: { not: null },
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        quotations: {
          where: { status: 'accepted' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    }),

    db.client.findMany({
      where: {
        OR: [
          { status: 'at_risk' },
          { contractExpiry: { lte: new Date(Date.now() + 30 * 86400 * 1000) } }
        ]
      }
    })
  ]);

  return {
    metrics: formatMetrics(marketingMetrics),
    campaigns,
    wonClients: wonClients.map(c => ({
      id: c.id,
      clientName: c.name,
      sourceChannel: c.leadSource!,
      quotationValue: c.quotations[0]?.total || 0,
      status: 'won' as const,
      accountManager: c.accountManagerName || '—',
      createdAt: c.createdAt.toISOString(),
    })),
    atRiskClients: atRiskClients.map(c => ({
      id: c.id,
      name: c.name,
      reason: c.status === 'at_risk' ? 'low_satisfaction' : 'contract_expiring',
      lastContact: c.lastInteraction || c.updatedAt?.toISOString() || new Date().toISOString(),
      accountManager: c.accountManagerName || '—',
    })),
  };
};