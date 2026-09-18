import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health.js';
import { tracksRouter } from './routes/tracks.js';
import { eventsRouter } from './routes/events.js';
import { profileRouter } from './routes/profile.js';
import { bookingsRouter } from './routes/bookings.js';
import { statsRouter } from './routes/stats.js';
import { aiRouter } from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Cross-Origin Resource Sharing (CORS) Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Index Directory
app.get('/', (req, res) => {
  res.json({
    name: 'Maestro Musician Portfolio & Artist Management Backend API',
    version: '1.0.0',
    runtime: 'Node.js + Express + TypeScript',
    status: 'online',
    endpoints: {
      root: '/',
      health: '/api/health',
      stats: '/api/stats',
      tracks: '/api/tracks',
      events: '/api/events',
      profile: '/api/profile',
      bookings: '/api/bookings',
      ai: '/api/ai',
    },
    documentation: 'See README.md for endpoint schemas and sample requests.',
  });
});

app.get('/api', (req, res) => {
  res.redirect('/');
});

// Mount Routes
app.use('/api/health', healthRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/events', eventsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/ai', aiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🎵 Maestro Musician Portfolio Backend API`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

export default app;
