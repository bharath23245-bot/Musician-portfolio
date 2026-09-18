import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  sendBookingNotification,
  getEmailHistory,
  getDefaultNotificationEmail,
  setActiveNotificationEmail,
} from '../services/emailService';

export const notificationsRouter = Router();

// GET /api/notifications/config - Get current email notification configuration
notificationsRouter.get('/config', (req: Request, res: Response) => {
  const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  res.json({
    success: true,
    notificationEmail: getDefaultNotificationEmail(),
    smtpConfigured: hasSmtp,
    mode: hasSmtp ? 'Live SMTP Transport' : 'Integrated Virtual Dispatcher',
    smtpHost: process.env.SMTP_HOST || 'Not configured (using instant local dispatcher)',
  });
});

// POST /api/notifications/config - Update admin destination email for booking notifications
notificationsRouter.post('/config', (req: Request, res: Response) => {
  try {
    const schema = z.object({
      notificationEmail: z.string().trim().email('Please enter a valid email address'),
    });
    const parsed = schema.parse(req.body);
    setActiveNotificationEmail(parsed.notificationEmail);
    res.json({
      success: true,
      message: `Admin notification email updated to ${parsed.notificationEmail}`,
      notificationEmail: getDefaultNotificationEmail(),
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.issues[0]?.message || 'Invalid email address' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to update notification configuration' });
  }
});

// GET /api/notifications/history - Get list of recent dispatched booking email notifications
notificationsRouter.get('/history', (req: Request, res: Response) => {
  res.json({
    success: true,
    history: getEmailHistory(),
    recipient: getDefaultNotificationEmail(),
  });
});

// POST /api/notifications/test - Test dispatching an email notification
notificationsRouter.post('/test', async (req: Request, res: Response) => {
  try {
    const testRecipient = typeof req.body.recipient === 'string' && req.body.recipient.includes('@')
      ? req.body.recipient
      : getDefaultNotificationEmail();

    const result = await sendBookingNotification(
      {
        client: 'Test Customer / Concert Organizer',
        email: 'test-organizer@mumbaifestival.org',
        phone: '+91 98765 43210',
        eventType: 'Live Performance / Solo Recital',
        date: '2025-11-20',
        venue: 'NCPA Tata Theatre',
        location: 'Mumbai, Maharashtra',
        budget: '₹1,50,000 – ₹3,00,000',
        message: 'This is a test notification verifying that booking alert emails reach your inbox with customer details.',
      },
      testRecipient
    );

    res.json({
      success: result.success,
      message: result.success
        ? `Test notification successfully dispatched to ${result.recipient}`
        : `Notification failed: ${result.error}`,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to test notification';
    res.status(500).json({ success: false, error: message });
  }
});
