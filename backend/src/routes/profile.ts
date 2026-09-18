import { Router, Request, Response } from 'express';
import { backendStore } from '../data/store.js';

export const profileRouter = Router();

// GET /api/profile - Get current artist profile
profileRouter.get('/', (req: Request, res: Response) => {
  try {
    const profile = backendStore.getProfile();
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve profile';
    res.status(500).json({ success: false, error: message });
  }
});

// PUT /api/profile - Update artist profile
profileRouter.put('/', (req: Request, res: Response) => {
  try {
    const updated = backendStore.updateProfile(req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    res.status(500).json({ success: false, error: message });
  }
});
