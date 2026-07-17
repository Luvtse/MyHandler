import { Request, Response } from 'express';
import { getRegionalMetricsService } from './executive.service';
import { logger } from '../utils/logger';

const VALID_REGIONS = ['addis_ababa', 'dire_dawa', 'hawassa', 'mekelle', 'bahir_dar'] as const;
export type ValidRegion = typeof VALID_REGIONS[number];

export const getRegionalMetricsHandler = async (req: Request, res: Response) => {
  const { region } = req.params;

  if (!VALID_REGIONS.includes(region as ValidRegion)) {
    return res.status(400).json({ success: false, message: 'Invalid region' });
  }

  try {
    const data = await getRegionalMetricsService(region as ValidRegion);
    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Regional: Metrics fetch failed', { error, region });
    return res.status(500).json({
      success: false,
      message: 'Failed to load regional data',
    });
  }
};