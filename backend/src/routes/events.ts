import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { backendStore } from '../data/store.js';

export const eventsRouter = Router();

const createEventSchema = z.object({
  title: z.string().trim().min(2, 'Event title must be at least 2 characters').max(120),
  venue: z.string().trim().min(2, 'Venue is required').max(150),
  location: z.string().trim().min(2, 'Location/City is required').max(100),
  month: z.string().trim().max(10).default('OCT'),
  day: z.string().trim().max(10).default('15'),
  fullDate: z.string().trim().optional(),
  time: z.string().trim().max(50).default('8:00 PM IST'),
  status: z.enum(['Upcoming', 'Sold Out', 'Completed']).default('Upcoming'),
  ticketUrl: z.string().optional().default('#'),
});

// GET /api/events - List all upcoming events
eventsRouter.get('/', (req: Request, res: Response) => {
  try {
    const events = backendStore.getEvents();
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve events';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/events/:id - Get single event
eventsRouter.get('/:id', (req: Request, res: Response) => {
  const event = backendStore.getEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }
  res.json({ success: true, data: event });
});

// POST /api/events - Create new event
eventsRouter.post('/', (req: Request, res: Response) => {
  try {
    const parsed = createEventSchema.parse(req.body);
    const fullDate = parsed.fullDate || `${parsed.month} ${parsed.day}, 2025`;
    const newEvent = backendStore.addEvent({
      title: parsed.title,
      venue: parsed.venue,
      location: parsed.location,
      month: parsed.month,
      day: parsed.day,
      fullDate,
      time: parsed.time,
      status: parsed.status,
      ticketUrl: parsed.ticketUrl,
    });
    res.status(201).json({ success: true, data: newEvent });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const firstMessage = err.issues?.[0]?.message || 'Validation failed';
      return res.status(400).json({ success: false, error: firstMessage, details: err.issues });
    }
    const message = err instanceof Error ? err.message : 'Failed to create event';
    res.status(500).json({ success: false, error: message });
  }
});

// PUT /api/events/:id - Update event
eventsRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = backendStore.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update event';
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/events/:id - Delete event
eventsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = backendStore.deleteEvent(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }
  res.json({ success: true, message: 'Event deleted successfully' });
});
