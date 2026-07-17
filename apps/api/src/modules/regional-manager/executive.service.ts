import { db } from '../db/client';
import { aiService } from '../services/ai.service';
import { formatRegionalMetrics } from './executive.utils'; // or inline if trivial

export const getRegionalMetricsService = async (region: string) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [metrics, insights] = await Promise.all([
    db.executiveMetric.findMany({
      where: {
        region,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    aiService.getRegionalInsights(region),
  ]);

  return {
    region,
    metrics: formatRegionalMetrics(metrics),
    insights,
  };
};