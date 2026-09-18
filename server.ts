import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { healthRouter } from './server/routes/health';
import { tracksRouter } from './server/routes/tracks';
import { eventsRouter } from './server/routes/events';
import { profileRouter } from './server/routes/profile';
import { bookingsRouter } from './server/routes/bookings';
import { statsRouter } from './server/routes/stats';
import { aiRouter } from './server/routes/ai';
import { notificationsRouter } from './server/routes/notifications';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser Middleware
  app.use(express.json({ limit: '10mb' }));

  // Request logging in development
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // Top-Level API Directory
  app.get('/api', (req, res) => {
    res.json({
      name: 'Maestro Musician Portfolio & Artist Management Backend API',
      version: '1.0.0',
      runtime: 'Node.js + Express',
      endpoints: {
        health: '/api/health',
        stats: '/api/stats',
        tracks: '/api/tracks',
        events: '/api/events',
        profile: '/api/profile',
        bookings: '/api/bookings',
        notifications: '/api/notifications',
        ai: '/api/ai',
      },
      documentation: 'REST API powering artist discography, tour management, and booking inquiries.',
    });
  });

  // Mount API Routers
  app.use('/api/health', healthRouter);
  app.use('/api/tracks', tracksRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/ai', aiRouter);

  // Vite Middleware for SPA Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node.js Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
