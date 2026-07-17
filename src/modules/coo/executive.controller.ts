// GET /api/executive/metrics?role=coo
export const getCooMetrics = [
  authenticate,
  authorizeRole(['admin', 'coo', 'regional_manager']),
  async (req: Request, res: Response) => {
    try {
      const today = new Date();
      const metrics = await db.executiveMetric.findMany({
        where: {
          role: 'coo',
          date: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
        },
        orderBy: { date: 'desc' },
        take: 30, // last 30 days
      });

      // Transform to COO-specific structure
      const formatted = {
        onTimeDeliveryRate: getLatestValue(metrics, 'on_time_delivery_rate'),
        avgFulfillmentTime: getLatestValue(metrics, 'avg_fulfillment_time'),
        // ... other metrics
      };

      res.json({ success: true, data: { metrics: formatted } });
    } catch (error) {
      logger.error('COO: Metrics fetch failed', { error });
      res.status(500).json({ success: false, message: 'Failed to load metrics' });
    }
  }
];

// GET /api/executive/insights?role=coo
export const getCooInsights = [
  authenticate,
  authorizeRole(['admin', 'coo']),
  async (req: Request, res: Response) => {
    try {
      // Call AI service
      const insights = await aiService.getOperationalInsights();
      res.json({ success: true, data: { insights } });
    } catch (error) {
      // Fallback: return empty insights
      res.json({ success: true, data: { insights: [] } });
    }
  }
];