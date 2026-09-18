import { Router, Request, Response } from 'express';
import { backendStore } from '../data/store.js';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  const stats = backendStore.getStats();
  res.json({
    status: 'ok',
    service: 'Maestro Musician Portfolio Backend API',
    runtime: 'Node.js (Express + TypeScript)',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      tracksEndpoint: '/api/tracks',
      eventsEndpoint: '/api/events',
      profileEndpoint: '/api/profile',
      bookingsEndpoint: '/api/bookings',
      statsEndpoint: '/api/stats',
      aiEndpoint: '/api/ai',
    },
    metrics: stats,
  });
});
