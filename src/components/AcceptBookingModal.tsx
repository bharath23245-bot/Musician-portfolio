import React, { useState } from 'react';
import { X, CheckCircle2, Mail, Clock, Calendar, MapPin, User, Copy, Check, ExternalLink, MessageCircle } from 'lucide-react';
import { BookingRequest } from '../types';

interface AcceptBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRequest | null;
  artistName?: string;
  onConfirmAccept: (bookingId: string, eventDate: string, eventTime: string) => Promise<void> | void;
}

export const AcceptBookingModal: React.FC<AcceptBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  artistName = 'Bharath Kannan',
  onConfirmAccept,
}) => {
  if (!isOpen || !booking) return null;

  // Detect time from booking notes or fallback to 7:00 PM / Evening
  const detectedTime = () => {
    if (booking.time) return booking.time;
    const msg = (booking.message || '').toLowerCase();
    const timeMatch = msg.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|hrs|hours))/i);
    if (timeMatch) return timeMatch[1].toUpperCase();
    return '07:00 PM (IST)';
  };

  const [eventDate, setEventDate] = useState(booking.date || 'Upcoming Date');
  const [eventTime, setEventTime] = useState(detectedTime());
  const [isSending, setIsSending] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Exact email message format requested
  const emailSubject = `🎵 Your Booking Has Been Accepted - ${artistName}`;
  const emailBody = `🎵 Your Booking Has Been Accepted

${artistName} has accepted your booking request for ${eventDate} at ${eventTime}.

We will contact you shortly to confirm the details.

Thank you for choosing ${artistName}`;

  const mailtoUrl = `mailto:${encodeURIComponent(booking.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Clean phone number for WhatsApp outreach
  const rawPhone = (booking.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = rawPhone
    ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(emailBody)}`
    : null;

  const handleAcceptAndNotify = async () => {
    setIsSending(true);
    try {
      // 1. Call parent handler to update Firestore status to 'Confirmed'
      await onConfirmAccept(booking.id, eventDate, eventTime);

      // 2. Dispatch to backend API / email service if running
      try {
        await fetch('/api/bookings/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            customerName: booking.client,
            customerEmail: booking.email,
            customerPhone: booking.phone,
            date: eventDate,
            time: eventTime,
            venue: booking.venue || booking.location,
            message: emailBody,
          }),
        });
      } catch (apiErr) {
        console.warn('API notification fallback:', apiErr);
      }

      // 3. Dispatch to Web3Forms service
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: 'd84ed8d0-6e04-4bdb-8552-08172fdc0f4f',
            subject: `✅ Booking Accepted Notification: ${booking.client}`,
            from_name: `${artistName} Management`,
            to_email: booking.email,
            customer_name: booking.client,
            customer_email: booking.email,
            event_date: eventDate,
            event_time: eventTime,
            status: 'ACCEPTED',
            official_message: emailBody,
          }),
        });
      } catch (w3Err) {
        console.warn('Web3Forms dispatch fallback:', w3Err);
      }

      setIsAccepted(true);
    } catch (err) {
      console.error('Error accepting booking:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetAndClose = () => {
    setIsAccepted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#131418] border border-[#272a34] rounded-2xl p-6 sm:p-8 text-[#d8dce6] shadow-2xl my-8">
        <button
          onClick={handleResetAndClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-[#8b909f] hover:text-white p-1.5 rounded-md hover:bg-[#1e2027] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAccepted ? (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-[#c8a251] text-xs uppercase tracking-widest font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#c8a251]" />
                <span>Confirm & Accept Proposal</span>
              </div>
              <h2 className="text-2xl font-serif text-white font-medium">
                Accept Booking Request
              </h2>
              <p className="text-xs text-[#8f94a4] mt-1">
                Accepting this inquiry updates its status to <strong className="text-white">Confirmed</strong> and notifies <strong className="text-white">{booking.client}</strong>.
              </p>
            </div>

            {/* Customer Summary Card */}
            <div className="p-3.5 rounded-xl bg-[#181920] border border-[#262834] text-xs grid grid-cols-2 gap-3 text-[#9da2b2]">
              <div>
                <span className="text-[10px] uppercase text-[#6f7382] block font-semibold">Customer</span>
                <span className="font-medium text-white text-sm flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-[#c8a251]" />
                  <span className="truncate">{booking.client}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#6f7382] block font-semibold">Customer Email</span>
                <span className="font-medium text-[#f5d78e] text-sm flex items-center gap-1 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#c8a251]" />
                  <span className="truncate">{booking.email}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#6f7382] block font-semibold">Venue / City</span>
                <span className="font-medium text-white flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#c8a251]" />
                  <span className="truncate">{booking.venue || booking.location || 'India'}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#6f7382] block font-semibold">Budget</span>
                <span className="font-medium text-[#c8a251] mt-0.5 block">{booking.budget}</span>
              </div>
            </div>

            {/* Editable Date and Time for Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                  Event Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787d8d] pointer-events-none" />
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. 24 November 2026"
                    className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                  Event Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787d8d] pointer-events-none" />
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="e.g. 07:00 PM (IST)"
                    className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Email Message Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#8e93a3] font-semibold">
                  Customer Email Notification Preview
                </span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-[11px] text-[#c8a251] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1014] border border-[#222530] text-xs font-mono whitespace-pre-line text-[#d1d5e3] leading-relaxed shadow-inner">
                {emailBody}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAcceptAndNotify}
                disabled={isSending}
                className="flex-1 py-3 px-4 rounded-lg bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] text-xs font-semibold uppercase tracking-wider transition-all shadow-lg active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSending ? 'Accepting & Dispatching...' : 'Accept & Notify Customer'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-3 px-4 rounded-lg bg-[#1a1b22] hover:bg-[#252833] border border-[#2f3240] text-xs text-[#d0d3df] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Success Screen */
          <div className="py-6 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest block">
                Booking Status Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-white">
                Booking Accepted!
              </h3>
              <p className="text-xs text-[#a4a9bc] max-w-md mx-auto leading-relaxed">
                The booking for <strong className="text-white">{booking.client}</strong> has been confirmed for{' '}
                <strong className="text-[#f5d78e]">{eventDate} at {eventTime}</strong>.
              </p>
            </div>

            {/* Direct Outreach Buttons */}
            <div className="p-4 rounded-xl bg-[#181920] border border-[#262834] text-left space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-[#8e93a3] font-semibold block">
                Direct Customer Outreach
              </span>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href={mailtoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open in Gmail / Email App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send on WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-lg bg-[#222530] hover:bg-[#2c303e] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
