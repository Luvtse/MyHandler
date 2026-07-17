// GET /api/executive/metrics?role=cfo
export const getCfoMetrics = [
  authenticate,
  authorizeRole(['admin', 'cfo']),
  async (req: Request, res: Response) => {
    try {
      const metrics = await db.executiveMetric.findMany({
        where: { role: 'cfo' },
        orderBy: { date: 'desc' },
        take: 30,
      });

      const formatted = {
        netProfit: getLatestValue(metrics, 'net_profit'),
        cashFlow: getLatestValue(metrics, 'cash_flow'),
        // ... other metrics
      };

      res.json({ success: true, data: { metrics: formatted } });
    } catch (error) {
      logger.error('CFO: Metrics fetch failed', { error });
      res.status(500).json({ success: false, message: 'Failed to load financial data' });
    }
  }
];

// GET /api/executive/insights?role=cfo
export const getCfoInsights = [
  authenticate,
  authorizeRole(['admin', 'cfo']),
  async (req: Request, res: Response) => {
    try {
      const insights = await aiService.getFinancialInsights();
      res.json({ success: true,  { insights } });
    } catch (error) {
      res.json({ success: true, data: { insights: [] } });
    }
  }
];