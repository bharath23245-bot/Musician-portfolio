import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { backendStore } from '../data/store';
import { BookingStatus } from '../../src/types';
import { sendBookingNotification } from '../services/emailService';

export const bookingsRouter = Router();

const createBookingSchema = z.object({
  client: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Valid email is required').max(150),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  eventType: z.string().trim().min(2, 'Event type is required').max(80),
  date: z.string().trim().min(1, 'Target date is required'),
  venue: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  budget: z.string().trim().max(80).default('₹1,50,000 – ₹3,00,000'),
  message: z.string().trim().max(2000).optional(),
  requirements: z.string().trim().max(2000).optional(),
});

// GET /api/bookings - List bookings (optional filter by status)
bookingsRouter.get('/', (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const bookings = backendStore.getBookings(status);
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve bookings';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/bookings/:id - Get single booking
bookingsRouter.get('/:id', (req: Request, res: Response) => {
  const booking = backendStore.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking inquiry not found' });
  }
  res.json({ success: true, data: booking });
});

// POST /api/bookings - Submit public booking proposal
bookingsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createBookingSchema.parse(req.body);
    const loc = parsed.location || parsed.city || 'India';
    const msg = parsed.message || parsed.requirements || '';

    const newBooking = backendStore.addBooking({
      client: parsed.client,
      email: parsed.email,
      phone: parsed.phone,
      eventType: parsed.eventType,
      date: parsed.date,
      venue: parsed.venue,
      location: loc,
      budget: parsed.budget,
      message: msg,
    });

    // Send email notification with Customer Name, Phone, Location, and Date
    const emailResult = await sendBookingNotification({
      client: parsed.client,
      email: parsed.email,
      phone: parsed.phone,
      eventType: parsed.eventType,
      date: parsed.date,
      venue: parsed.venue,
      location: loc,
      budget: parsed.budget,
      message: msg,
      bookingId: newBooking.id,
    });

    res.status(201).json({
      success: true,
      message: 'Booking proposal successfully transmitted to artist representation',
      data: newBooking,
      notification: {
        sent: emailResult.success,
        recipient: emailResult.recipient,
        mode: emailResult.mode,
      },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const firstMessage = err.issues?.[0]?.message || 'Validation failed';
      return res.status(400).json({ success: false, error: firstMessage, details: err.issues });
    }
    const message = err instanceof Error ? err.message : 'Failed to submit booking inquiry';
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/bookings/:id/status - Update booking status
bookingsRouter.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['Pending', 'Confirmed', 'Declined', 'New', 'Contacted', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be Pending, Confirmed, or Declined.',
      });
    }

    const updated = backendStore.updateBookingStatus(req.params.id, status as BookingStatus);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update booking status';
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/bookings/:id - Delete booking inquiry
bookingsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = backendStore.deleteBooking(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Booking inquiry not found' });
  }
  res.json({ success: true, message: 'Booking inquiry deleted successfully' });
});
