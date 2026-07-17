import { db } from '../db/client';
import { aiService } from '../services/ai.service';
import { formatCeoMetrics } from './executive.utils'; // or keep formatter here if trivial

export const getCeoMetricsService = async () => {
  const [metrics, goals, insights] = await Promise.all([
    db.executiveMetric.findMany({
      where: { role: { in: ['ceo', 'cfo', 'coo', 'cmo'] } },
      orderBy: { date: 'desc' },
      take: 100,
    }),
    db.strategicGoal.findMany(),
    aiService.getCrossFunctionalInsights(),
  ]);

  return {
    metrics: formatCeoMetrics(metrics),
    goals,
    insights,
  };
};