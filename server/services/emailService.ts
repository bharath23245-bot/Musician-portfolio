import nodemailer from 'nodemailer';

export interface BookingNotificationPayload {
  client: string; // Customer Name
  email: string;  // Customer Email
  phone?: string; // Customer Phone Number
  eventType: string;
  date: string;   // Event Date
  venue?: string;
  location: string; // Event Location
  budget: string;
  message?: string;
  bookingId?: string;
}

export interface DispatchedEmailRecord {
  id: string;
  recipient: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventLocation: string;
  eventDate: string;
  eventType: string;
  budget: string;
  sentAt: string;
  status: 'sent' | 'simulated' | 'error';
  subject: string;
  preview: string;
}

// In-memory record of sent notification emails for admin transparency
const emailHistory: DispatchedEmailRecord[] = [];

// Target artist notification email address (mutable so admin can update dynamically)
let activeNotificationEmail = process.env.NOTIFICATION_EMAIL || 'bharath23245@gmail.com';

export function setActiveNotificationEmail(email: string) {
  if (email && email.trim().includes('@')) {
    activeNotificationEmail = email.trim();
  }
}

export function getDefaultNotificationEmail(): string {
  return activeNotificationEmail;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER || 'bharath23245@gmail.com';
  const pass = process.env.SMTP_PASS || 'Xyzmusic@123';

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  if (user && pass) {
    // Direct Gmail SMTP transport
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  // Fallback / Development transporter: stores message JSON
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

export async function sendBookingNotification(payload: BookingNotificationPayload, customRecipient?: string): Promise<{
  success: boolean;
  recipient: string;
  messageId?: string;
  record?: DispatchedEmailRecord;
  mode: 'smtp' | 'virtual';
  error?: string;
}> {
  const recipient = customRecipient || activeNotificationEmail;
  const user = process.env.SMTP_USER || 'bharath23245@gmail.com';
  const pass = process.env.SMTP_PASS || 'Xyzmusic@123';
  const isRealSmtp = Boolean((process.env.SMTP_HOST && user && pass) || (user && pass));
  const transporter = createTransporter();

  const subject = `🎶 New Booking Notification: ${payload.client} - ${payload.date} (${payload.location})`;

  const textBody = `
========================================
NEW BOOKING INQUIRY FOR BHARATH KANNAN
========================================

A new customer booking proposal has been submitted on your portfolio.

CUSTOMER DETAILS:
----------------------------------------
* Customer Name:        ${payload.client}
* Customer Phone Number: ${payload.phone || 'Not provided'}
* Customer Email:       ${payload.email}

EVENT DETAILS:
----------------------------------------
* Event Date:           ${payload.date}
* Event Location:       ${payload.location} ${payload.venue ? `(${payload.venue})` : ''}
* Engagement Type:      ${payload.eventType}
* Estimated Budget:     ${payload.budget}

CUSTOMER NOTES & REQUIREMENTS:
----------------------------------------
${payload.message || 'No additional notes provided.'}

----------------------------------------
Dispatched via Maestro Artist Management System
Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
Recipient Email: ${recipient}
========================================
`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c0e; color: #e1e3e6; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #141518; border: 1px solid #262832; border-radius: 12px; overflow: hidden; }
    .header { background: #1c1d24; border-bottom: 1px solid #2d303d; padding: 24px; text-align: left; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; color: #c8a251; letter-spacing: 0.05em; font-family: Georgia, serif; }
    .header p { margin: 0; font-size: 12px; color: #8e93a3; text-transform: uppercase; letter-spacing: 0.1em; }
    .body { padding: 24px; }
    .field-grid { display: table; width: 100%; margin-bottom: 20px; border-collapse: collapse; }
    .row { display: table-row; }
    .label { display: table-cell; width: 38%; padding: 10px 12px; font-size: 12px; color: #9ba0ad; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1f2129; }
    .value { display: table-cell; padding: 10px 12px; font-size: 14px; color: #ffffff; font-weight: 500; border-bottom: 1px solid #1f2129; }
    .highlight { color: #f5d78e; font-weight: 600; }
    .notes-box { background: #1a1b22; border: 1px solid #262934; border-radius: 8px; padding: 16px; margin-top: 16px; font-size: 13px; line-height: 1.6; color: #c5c9d6; }
    .footer { background: #0e0f12; padding: 16px 24px; border-top: 1px solid #1c1d24; text-align: center; font-size: 11px; color: #696e7e; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>New Booking Notification</h1>
      <p>Bharath Kannan • Artist Management Alert</p>
    </div>
    <div class="body">
      <div class="field-grid">
        <div class="row">
          <div class="label">Customer Name</div>
          <div class="value highlight">${payload.client}</div>
        </div>
        <div class="row">
          <div class="label">Customer Phone</div>
          <div class="value highlight">${payload.phone || 'Not provided'}</div>
        </div>
        <div class="row">
          <div class="label">Customer Email</div>
          <div class="value"><a href="mailto:${payload.email}" style="color: #c8a251; text-decoration: none;">${payload.email}</a></div>
        </div>
        <div class="row">
          <div class="label">Event Date</div>
          <div class="value highlight">${payload.date}</div>
        </div>
        <div class="row">
          <div class="label">Event Location</div>
          <div class="value highlight">${payload.location} ${payload.venue ? `<span style="color:#9ba0ad;">(${payload.venue})</span>` : ''}</div>
        </div>
        <div class="row">
          <div class="label">Engagement Type</div>
          <div class="value">${payload.eventType}</div>
        </div>
        <div class="row">
          <div class="label">Budget Tier</div>
          <div class="value">${payload.budget}</div>
        </div>
      </div>

      <div style="margin-top: 16px;">
        <span style="font-size: 11px; text-transform: uppercase; color: #8e93a3; letter-spacing: 0.05em; font-weight: 600;">Customer Message / Notes:</span>
        <div class="notes-box">
          ${payload.message ? payload.message.replace(/\n/g, '<br>') : '<em>No additional notes provided.</em>'}
        </div>
      </div>
    </div>
    <div class="footer">
      This notification was automatically dispatched to <strong>${recipient}</strong>.<br>
      Maestro Artist Representation Platform • ${new Date().toUTCString()}
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Maestro Bookings" <notifications@bharathkannan.in>`,
      to: recipient,
      replyTo: payload.email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    const record: DispatchedEmailRecord = {
      id: `EMAIL-${Date.now()}`,
      recipient,
      customerName: payload.client,
      customerPhone: payload.phone || '',
      customerEmail: payload.email,
      eventLocation: payload.location,
      eventDate: payload.date,
      eventType: payload.eventType,
      budget: payload.budget,
      sentAt: new Date().toISOString(),
      status: isRealSmtp ? 'sent' : 'simulated',
      subject,
      preview: `Customer: ${payload.client} | Phone: ${payload.phone || 'N/A'} | Date: ${payload.date} | Location: ${payload.location}`,
    };

    emailHistory.unshift(record);
    if (emailHistory.length > 50) emailHistory.pop();

    console.log(`[EMAIL NOTIFICATION] Dispatched booking alert to ${recipient}:`, {
      customer: payload.client,
      phone: payload.phone,
      location: payload.location,
      date: payload.date,
      mode: isRealSmtp ? 'SMTP' : 'VIRTUAL',
    });

    return {
      success: true,
      recipient,
      messageId: info.messageId || record.id,
      record,
      mode: isRealSmtp ? 'smtp' : 'virtual',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[EMAIL NOTIFICATION ERROR]:', errorMsg);

    const failRecord: DispatchedEmailRecord = {
      id: `EMAIL-${Date.now()}`,
      recipient,
      customerName: payload.client,
      customerPhone: payload.phone || '',
      customerEmail: payload.email,
      eventLocation: payload.location,
      eventDate: payload.date,
      eventType: payload.eventType,
      budget: payload.budget,
      sentAt: new Date().toISOString(),
      status: 'error',
      subject,
      preview: `Failed to deliver: ${errorMsg}`,
    };
    emailHistory.unshift(failRecord);

    return {
      success: false,
      recipient,
      mode: isRealSmtp ? 'smtp' : 'virtual',
      error: errorMsg,
    };
  }
}

export function getEmailHistory(): DispatchedEmailRecord[] {
  return [...emailHistory];
}
