/**
 * AI Insights Service
 * TypeScript port of the Python insight scripts in /modules/ai/.
 * Computes real-time anomalies and recommendations from live Prisma data.
 */
import prisma from '../utils/prisma';

export interface Insight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  source: 'finance' | 'operations' | 'marketing' | 'clients' | 'fleet';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(value: number, total: number): number {
  return total === 0 ? 0 : Math.round((value / total) * 1000) / 10;
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

// ─── CEO: Cross-functional insights ──────────────────────────────────────────

export async function getCeoInsights(): Promise<Insight[]> {
  const insights: Insight[] = [];
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [
    ytdRevenue,
    prevYearRevenue,
    totalDelivered,
    totalShipments,
    recentClients,
    prevClients,
  ] = await Promise.all([
    prisma.shipment.aggregate({
      where: { createdAt: { gte: yearStart } },
      _sum: { chargesAmount: true },
    }),
    prisma.shipment.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear() - 1, 0, 1),
          lt: yearStart,
        },
      },
      _sum: { chargesAmount: true },
    }),
    prisma.shipment.count({
      where: {
        status: { in: ['DELIVERED_SUCCESSFULLY', 'DELIVERY_CONFIRMED', 'SIGNATURE_OBTAINED'] as any[] },
        createdAt: { gte: yearStart },
      },
    }),
    prisma.shipment.count({
      where: { createdAt: { gte: yearStart }, status: { not: 'CANCELLED' as any } },
    }),
    prisma.shipment.findMany({
      where: { createdAt: { gte: daysAgo(90) } },
      distinct: ['userId'],
      select: { userId: true },
    }),
    prisma.shipment.findMany({
      where: { createdAt: { gte: daysAgo(180), lt: daysAgo(90) } },
      distinct: ['userId'],
      select: { userId: true },
    }),
  ]);

  const revenue = ytdRevenue._sum.chargesAmount ?? 0;
  const lastRevenue = prevYearRevenue._sum.chargesAmount ?? 1;
  const growth = pct(revenue - lastRevenue, lastRevenue);
  const onTimeRate = pct(totalDelivered, totalShipments);
  const prevClientIds = new Set(prevClients.map(c => c.userId));
  const retainedCount = recentClients.filter(c => prevClientIds.has(c.userId)).length;
  const retention = pct(retainedCount, prevClientIds.size || 1);

  if (growth < 10 && onTimeRate < 93) {
    insights.push({
      id: 'ceo-ins-01',
      title: 'Revenue Growth at Risk',
      message: `YTD growth is ${growth.toFixed(1)}% (target: ≥12%) while on-time delivery is ${onTimeRate.toFixed(1)}%. Operations delays are likely suppressing revenue.`,
      confidence: 0.91,
      severity: 'medium',
      recommendation: 'Review top delivery bottlenecks and prioritise hub capacity expansion.',
      source: 'operations',
    });
  }

  if (retention < 85) {
    const atRisk = prevClients.length - retainedCount;
    insights.push({
      id: 'ceo-ins-02',
      title: 'Client Retention Below Target',
      message: `${atRisk} client(s) active 90 days ago have not shipped recently. Retention is ${retention.toFixed(1)}% (target: ≥90%).`,
      confidence: 0.87,
      severity: 'medium',
      recommendation: 'Assign Account Managers for proactive check-ins with dormant clients.',
      source: 'clients',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'ceo-ins-ok',
      title: 'All Strategic KPIs On Track',
      message: `Revenue growth at ${growth.toFixed(1)}%, on-time delivery at ${onTimeRate.toFixed(1)}%, retention at ${retention.toFixed(1)}%.`,
      confidence: 0.95,
      severity: 'low',
      recommendation: 'Continue monitoring quarterly milestones.',
      source: 'operations',
    });
  }

  return insights;
}

// ─── CFO: Financial insights ──────────────────────────────────────────────────

export async function getCfoInsights(): Promise<Insight[]> {
  const insights: Insight[] = [];
  const thirtyDaysAgo = daysAgo(30);
  const sixtyDaysAgo = daysAgo(60);

  const [invoicesOverdue, recentRevenue, prevRevenue] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: 'OVERDUE' },
      select: { totalAmount: true },
    }),
    prisma.shipment.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { chargesAmount: true },
    }),
    prisma.shipment.aggregate({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { chargesAmount: true },
    }),
  ]);

  const overdueAmount = invoicesOverdue.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0,
  );
  const recentRev = recentRevenue._sum.chargesAmount ?? 0;
  const prevRev = prevRevenue._sum.chargesAmount ?? 1;
  const momChange = pct(recentRev - prevRev, prevRev);

  if (overdueAmount > 0) {
    insights.push({
      id: 'cfo-ins-01',
      title: 'Overdue Invoices Detected',
      message: `${invoicesOverdue.length} invoice(s) are overdue, totalling ETB ${overdueAmount.toLocaleString()}.`,
      confidence: 0.96,
      severity: overdueAmount > 500_000 ? 'high' : 'medium',
      recommendation: 'Follow up with clients on overdue balances. Consider escalating accounts >60 days.',
      source: 'finance',
    });
  }

  if (momChange < -15) {
    insights.push({
      id: 'cfo-ins-02',
      title: 'Cash Flow Decline Detected',
      message: `Revenue dropped ${Math.abs(momChange).toFixed(1)}% month-over-month (ETB ${recentRev.toLocaleString()} vs ETB ${prevRev.toLocaleString()}).`,
      confidence: 0.89,
      severity: 'high',
      recommendation: 'Investigate shipment volume decline and review top accounts.',
      source: 'finance',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'cfo-ins-ok',
      title: 'Financial Position Healthy',
      message: `No overdue invoices detected. MoM revenue change: ${momChange.toFixed(1)}%.`,
      confidence: 0.93,
      severity: 'low',
      recommendation: 'Maintain current invoicing cadence.',
      source: 'finance',
    });
  }

  return insights;
}

// ─── COO: Operational insights ────────────────────────────────────────────────

export async function getCooInsights(): Promise<Insight[]> {
  const insights: Insight[] = [];

  const [totalVehicles, idleVehicles, stockoutItems, delayedShipments, totalActive] =
    await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'idle' as any } }),
      prisma.inventoryItem.count({ where: { quantity: 0 } }),
      prisma.shipment.count({
        where: {
          status: {
            in: [
              'CLEARANCE_DELAY',
              'AWAITING_CLEARANCE',
              'SHIPMENT_ON_HOLD',
              'WEATHER_DELAY',
              'TRANSPORTATION_DELAY',
            ] as any[],
          },
        },
      }),
      prisma.shipment.count({
        where: {
          status: {
            notIn: ['DELIVERED_SUCCESSFULLY', 'DELIVERY_CONFIRMED', 'CANCELLED', 'RETURNED_TO_SENDER', 'LOST_EXCEPTION', 'SIGNATURE_OBTAINED'] as any[],
          },
        },
      }),
    ]);

  const idleRate = pct(idleVehicles, totalVehicles || 1);

  if (idleRate > 25) {
    insights.push({
      id: 'coo-ins-01',
      title: 'High Fleet Idle Rate',
      message: `${idleVehicles} of ${totalVehicles} vehicles are idle (${idleRate.toFixed(1)}% idle rate). Capacity may be underutilised.`,
      confidence: 0.89,
      severity: idleRate > 40 ? 'high' : 'medium',
      recommendation: 'Rebalance fleet allocation across hubs or open capacity to partner carriers.',
      source: 'fleet',
    });
  }

  if (stockoutItems > 0) {
    insights.push({
      id: 'coo-ins-02',
      title: 'Warehouse Stockouts Detected',
      message: `${stockoutItems} inventory SKU(s) at zero quantity. This may delay fulfilment.`,
      confidence: 0.94,
      severity: stockoutItems > 5 ? 'high' : 'medium',
      recommendation: 'Trigger replenishment orders for zero-stock items immediately.',
      source: 'operations',
    });
  }

  if (delayedShipments > 0 && totalActive > 0) {
    const delayRate = pct(delayedShipments, totalActive);
    insights.push({
      id: 'coo-ins-03',
      title: 'Shipment Delays Detected',
      message: `${delayedShipments} shipment(s) currently in a delay status (${delayRate.toFixed(1)}% of active pipeline).`,
      confidence: 0.92,
      severity: delayRate > 10 ? 'high' : 'medium',
      recommendation: 'Review held shipments and reroute high-priority ones via alternative channels.',
      source: 'operations',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'coo-ins-ok',
      title: 'Operations Running Smoothly',
      message: 'No critical operational anomalies detected.',
      confidence: 0.9,
      severity: 'low',
      recommendation: 'Continue daily KPI monitoring.',
      source: 'operations',
    });
  }

  return insights;
}

// ─── CMO: Marketing insights ──────────────────────────────────────────────────

export async function getCmoInsights(): Promise<Insight[]> {
  const insights: Insight[] = [];

  const [totalQuotations, wonQuotations, activeClients, totalClients] =
    await Promise.all([
      prisma.quotation.count(),
      prisma.quotation.count({ where: { status: 'accepted' as any } }),
      prisma.client.count({ where: { status: 'active' } }),
      prisma.client.count(),
    ]);

  const conversionRate = pct(wonQuotations, totalQuotations || 1);
  const clientActiveRate = pct(activeClients, totalClients || 1);

  if (conversionRate < 15) {
    insights.push({
      id: 'cmo-ins-01',
      title: 'Low Quotation Conversion Rate',
      message: `Only ${conversionRate.toFixed(1)}% of ${totalQuotations} quotations converted to won deals (target: ≥15%).`,
      confidence: 0.88,
      severity: conversionRate < 8 ? 'high' : 'medium',
      recommendation: 'Review lost quotations for pricing and response-time patterns. Consider follow-up automation.',
      source: 'marketing',
    });
  }

  if (clientActiveRate < 70) {
    insights.push({
      id: 'cmo-ins-02',
      title: 'Client Churn Risk Elevated',
      message: `${totalClients - activeClients} client(s) are inactive (${(100 - clientActiveRate).toFixed(1)}% inactive rate).`,
      confidence: 0.85,
      severity: 'medium',
      recommendation: 'Launch re-engagement campaigns targeting dormant accounts.',
      source: 'clients',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'cmo-ins-ok',
      title: 'Marketing Pipeline Healthy',
      message: `Conversion rate: ${conversionRate.toFixed(1)}%. Active client rate: ${clientActiveRate.toFixed(1)}%.`,
      confidence: 0.9,
      severity: 'low',
      recommendation: 'Scale top-performing acquisition channels.',
      source: 'marketing',
    });
  }

  return insights;
}
