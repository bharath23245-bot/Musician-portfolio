import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { backendStore } from '../data/store';

export const tracksRouter = Router();

const createTrackSchema = z.object({
  title: z.string().trim().min(2, 'Track title must be at least 2 characters').max(120),
  subtitle: z.string().trim().max(120).default('Solo Piano'),
  category: z.string().trim().min(2).max(60).default('Classical / Solo Piano'),
  duration: z.string().trim().min(1).max(20).default('3:45'),
  durationSec: z.number().positive().default(225),
  bpm: z.number().int().min(30).max(300).default(120),
  keySignature: z.string().trim().max(20).default('C min'),
  coverUrl: z.string().url().or(z.string().min(1)).optional(),
  audioUrl: z.string().optional(),
  isFeatured: z.boolean().default(true),
});

// GET /api/tracks - List all tracks
tracksRouter.get('/', (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const tracks = backendStore.getTracks({ category, search });
    res.json({
      success: true,
      count: tracks.length,
      data: tracks,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve tracks';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/tracks/:id - Get single track
tracksRouter.get('/:id', (req: Request, res: Response) => {
  const track = backendStore.getTrackById(req.params.id);
  if (!track) {
    return res.status(404).json({ success: false, error: 'Track not found' });
  }
  res.json({ success: true, data: track });
});

// POST /api/tracks - Add new track
tracksRouter.post('/', (req: Request, res: Response) => {
  try {
    const parsed = createTrackSchema.parse(req.body);
    const newTrack = backendStore.addTrack({
      title: parsed.title,
      subtitle: parsed.subtitle,
      category: parsed.category,
      duration: parsed.duration,
      durationSec: parsed.durationSec,
      bpm: parsed.bpm,
      keySignature: parsed.keySignature,
      plays: 0,
      releaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      coverUrl: parsed.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      audioUrl: parsed.audioUrl || '',
      isFeatured: parsed.isFeatured,
    });
    res.status(201).json({ success: true, data: newTrack });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const firstMessage = err.issues?.[0]?.message || 'Validation failed';
      return res.status(400).json({ success: false, error: firstMessage, details: err.issues });
    }
    const message = err instanceof Error ? err.message : 'Failed to create track';
    res.status(500).json({ success: false, error: message });
  }
});

// PUT /api/tracks/:id - Update track
tracksRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = backendStore.updateTrack(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update track';
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/tracks/:id - Delete track
tracksRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = backendStore.deleteTrack(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Track not found' });
  }
  res.json({ success: true, message: 'Track deleted successfully' });
});
