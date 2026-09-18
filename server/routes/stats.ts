import { Router, Request, Response } from 'express';
import { backendStore } from '../data/store';

export const statsRouter = Router();

// GET /api/stats - Global portfolio statistics
statsRouter.get('/', (req: Request, res: Response) => {
  try {
    const stats = backendStore.getStats();
    res.json({ success: true, data: stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve stats';
    res.status(500).json({ success: false, error: message });
  }
});
