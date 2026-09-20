import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, MapPin, Mail, User, ShieldAlert, Loader2, ArrowRight, Download, Check } from 'lucide-react';
import { BookingRequest } from '../types';
import { submitBookingInquiry } from '../services/firestoreService';
import { bookingSchema } from '../schemas/validation';
import { CountryPhoneInput } from './CountryPhoneInput';
import { validatePhoneNumber } from '../data/countryPhoneData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBooking: (booking: BookingRequest) => void;
  preselectedType?: string;
  artistName?: string;
}

const POPULAR_INDIAN_VENUES = [
  { name: 'NCPA Tata Theatre', city: 'Mumbai, Maharashtra' },
  { name: 'The Grand Theatre, NMACC', city: 'Mumbai, Maharashtra' },
  { name: 'Siri Fort Auditorium', city: 'New Delhi' },
  { name: 'The Music Academy', city: 'Chennai, Tamil Nadu' },
  { name: 'Chowdiah Memorial Hall', city: 'Bengaluru, Karnataka' },
  { name: 'Prithvi Theatre', city: 'Mumbai, Maharashtra' },
  { name: 'Science City Auditorium', city: 'Kolkata, West Bengal' },
  { name: 'Ravindra Bharathi', city: 'Hyderabad, Telangana' },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmitBooking,
  preselectedType = 'Live Performances',
  artistName = 'Bharath Kannan',
}) => {
  const [client, setClient] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [eventType, setEventType] = useState(preselectedType);
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [hasDownloaded, setHasDownloaded] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setClient('');
    setEmail('');
    setPhone('');
    setCountryCode('IN');
    setEventType(preselectedType || 'Live Performances');
    setDate('');
    setVenue('');
    setLocation('');
    setBudget('');
    setMessage('');
    setValidationError('');
    setIsSubmitted(false);
    setSubmittedPhone('');
    setSubmittedId('');
    setHasDownloaded(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectVenuePreset = (presetVenue: string, presetCity: string) => {
    setVenue(presetVenue);
    setLocation(presetCity);
  };

  const handleDownloadCopy = () => {
    const targetLocation = venue || location || 'NCPA Tata Theatre, Mumbai, India';
    const finalBudget = budget.trim() ? (budget.startsWith('₹') ? budget : `₹${budget}`) : '₹1,50,000';
    const refId = submittedId || `BK-${Math.floor(100 + Math.random() * 900)}`;

    const textReceipt = `===============================================================
       ${artistName.toUpperCase()} — OFFICIAL BOOKING INQUIRY COPY
===============================================================

REFERENCE ID      : ${refId}
DATE SUBMITTED    : ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
STATUS            : Pending Review by Management

---------------------------------------------------------------
CUSTOMER & CONTACT DETAILS
---------------------------------------------------------------
Customer Name     : ${client}
Phone Number      : ${submittedPhone || phone}
Email Address     : ${email}

---------------------------------------------------------------
EVENT & PERFORMANCE SPECIFICATIONS
---------------------------------------------------------------
Engagement Type   : ${eventType}
Event Date        : ${date}
Venue / Location  : ${targetLocation}
Budget Allocation : ${finalBudget}

---------------------------------------------------------------
ACOUSTIC & EVENT NOTES
---------------------------------------------------------------
${message ? message : 'Standard concert / acoustic performance arrangements.'}

---------------------------------------------------------------
ARTIST MANAGEMENT CONTACT
---------------------------------------------------------------
Artist            : ${artistName}
Management Email  : bharath23245@gmail.com
Official Instagram: https://www.instagram.com/bharathk_0

Thank you for your proposal. A member of ${artistName}'s management team
will review your acoustic schedule, repertoire, and arrangements,
and contact you shortly.
===============================================================`;

    const blob = new Blob([textReceipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeClient = (client || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Booking_Inquiry_${safeClient}_${refId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setHasDownloaded(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Country-specific phone validation
    const phoneValidation = validatePhoneNumber(phone, countryCode);
    if (!phoneValidation.isValid) {
      setValidationError(phoneValidation.error || 'Please enter a valid phone number for the selected country.');
      return;
    }

    const internationalPhone = phoneValidation.formattedNumber;
    const targetLocation = venue || location || 'NCPA Tata Theatre, Mumbai, India';
    const finalBudget = budget.trim() ? (budget.startsWith('₹') ? budget : `₹${budget}`) : '₹1,50,000';

    // Client-side schema validation via Zod
    try {
      bookingSchema.parse({
        client,
        email,
        phone: internationalPhone,
        eventType,
        date,
        city: targetLocation,
        venue: venue || targetLocation,
        budget: finalBudget,
        requirements: message,
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err) {
        const firstErr = (err as { errors: { message: string }[] }).errors[0];
        setValidationError(firstErr.message);
        return;
      }
      setValidationError('Please complete all required fields (Customer Name, Phone Number, Email, Event Date, and Location).');
      return;
    }

    setIsSubmitting(true);
    setSubmittedPhone(internationalPhone);

    // Save directly to Firestore collection and dispatch email notification
    const result = await submitBookingInquiry({
      client,
      email,
      phone: internationalPhone,
      eventType,
      date,
      city: targetLocation,
      venue: venue || targetLocation,
      budget: finalBudget,
      requirements: message,
    });

    setIsSubmitting(false);

    if (result.success) {
      const assignedId = result.id || `BK-${Math.floor(100 + Math.random() * 900)}`;
      setSubmittedId(assignedId);
      const newBooking: BookingRequest = {
        id: assignedId,
        client,
        customerName: client,
        email,
        phone: internationalPhone,
        eventType,
        date,
        venue: venue || targetLocation,
        location: targetLocation,
        budget: finalBudget,
        message: message || 'Inquiry regarding concert booking / commission in India.',
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
        notificationSent: true,
        notificationRecipient: 'bharath23245@gmail.com',
      };

      onSubmitBooking(newBooking);
      setIsSubmitted(true);
    } else {
      setValidationError(result.error || 'Unable to transmit booking proposal. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#141518] border border-[#262830] rounded-xl p-6 sm:p-8 text-[#e1e3e6] shadow-2xl my-8">
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-[#8b909f] hover:text-white p-1.5 rounded-md hover:bg-[#1e2027] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-6 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Professional Success Pop-up Card */}
            <div className="w-16 h-16 rounded-full bg-[#c8a251]/15 border border-[#c8a251]/60 flex items-center justify-center mx-auto text-[#c8a251] shadow-lg shadow-[#c8a251]/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#c8a251] uppercase tracking-widest block">
                Booking Proposal Received
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-[#f4f4f6]">
                Submitted Successfully
              </h3>
              <p className="text-sm text-[#a4a9bc] max-w-md mx-auto leading-relaxed pt-1">
                Thank you for your proposal. Our team will contact you shortly to review your schedule, repertoire, and acoustic arrangements.
              </p>
            </div>

            {/* Structured Summary Card */}
            <div className="p-4 rounded-lg bg-[#181920] border border-[#262934] text-left text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#222530]">
                <span className="text-[11px] font-medium text-[#8f94a4] uppercase tracking-wider">
                  Submission Summary
                </span>
                <span className="px-2 py-0.5 rounded bg-[#c8a251]/20 border border-[#c8a251]/40 text-[#f5d78e] text-[10px] font-mono">
                  Pending Review
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[#9da2b2]">
                <div>
                  <span className="text-[10px] uppercase text-[#6f7382] block mb-0.5">Customer Name</span>
                  <span className="font-medium text-white text-sm block truncate">{client}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#6f7382] block mb-0.5">Phone Number</span>
                  <span className="font-medium text-white text-sm block truncate">{submittedPhone || phone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#6f7382] block mb-0.5">Event Date</span>
                  <span className="font-medium text-[#f5d78e] text-sm block truncate">{date}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#6f7382] block mb-0.5">Budget Allocation</span>
                  <span className="font-medium text-white text-sm block truncate">{budget ? (budget.startsWith('₹') ? budget : `₹${budget}`) : 'Not specified'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-[#6f7382] block mb-0.5">Event Location & Venue</span>
                  <span className="font-medium text-white text-sm block truncate">{venue || location || 'NCPA Tata Theatre, Mumbai'}</span>
                </div>
              </div>
            </div>

            {/* Action to download copy, send email, and close */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                id="download-booking-copy-btn"
                onClick={handleDownloadCopy}
                className="w-full py-3 px-4 rounded-lg bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] text-xs font-semibold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                {hasDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-[#0b0c0e]" />
                    <span>Booking Copy Downloaded! (Click to re-download)</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#0b0c0e]" />
                    <span>Download Copy of Booking (.txt)</span>
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <a
                  href={`mailto:bharath23245@gmail.com?subject=${encodeURIComponent(`Booking Inquiry from ${client} for ${date}`)}&body=${encodeURIComponent(
                    `Hello Bharath Kannan Management,\n\nBooking inquiry details:\n\n` +
                    `• Customer Name: ${client}\n` +
                    `• Phone Number: ${submittedPhone || phone}\n` +
                    `• Email: ${email}\n` +
                    `• Event Date: ${date}\n` +
                    `• Location: ${venue || location || 'India'}\n` +
                    `• Engagement Type: ${eventType}\n` +
                    `• Budget: ${budget ? (budget.startsWith('₹') ? budget : `₹${budget}`) : '₹1,50,000'}\n` +
                    `• Notes: ${message || 'None'}\n\n` +
                    `Sent from portfolio booking request.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#1e2028] hover:bg-[#282b36] border border-[#333745] text-xs font-semibold uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-[#c8a251]" />
                  <span>Open in Gmail</span>
                </a>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#1e2028] hover:bg-[#282b36] border border-[#333745] text-xs font-semibold uppercase tracking-wider text-[#a0a5b5] hover:text-white transition-colors"
                >
                  New Inquiry
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#252834] hover:bg-[#303444] border border-[#3d4254] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-[#c8a251] font-semibold">
                Artist Representation • India & International Tours
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#f3f4f7] mt-1">
                Performance & Booking Inquiry
              </h2>
              <p className="text-xs text-[#8f94a3] mt-1.5 leading-relaxed">
                Direct management inquiry for concert recitals, concerto performances, studio sessions, or film scores.
              </p>
            </div>

            {validationError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Name & Phone Number with Country Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                    Customer Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787d8d] pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bharath Kannan"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                    Customer Phone Number *
                  </label>
                  <CountryPhoneInput
                    value={phone}
                    countryCode={countryCode}
                    onChange={(formatted, raw) => {
                      setPhone(raw);
                      if (validationError) setValidationError('');
                    }}
                    onCountryChange={(code) => {
                      setCountryCode(code);
                      if (validationError) setValidationError('');
                    }}
                    hasError={Boolean(validationError && validationError.toLowerCase().includes('phone'))}
                  />
                </div>
              </div>

              {/* Customer Email & Event Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                    Customer Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787d8d] pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                    Event Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787d8d] pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Event Location / Venue */}
              <div>
                <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                  Event Location (City & Venue) *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787d8d] pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. NCPA Tata Theatre, Mumbai, Maharashtra"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Quick Venue Suggestion Chips */}
              <div className="space-y-1 pt-0.5">
                <span className="text-[10px] uppercase tracking-wider text-[#737887]">
                  Popular Auditoriums:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_INDIAN_VENUES.slice(0, 5).map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleSelectVenuePreset(v.name, v.city)}
                      className={`text-[11px] px-2.5 py-0.5 rounded border transition-colors ${
                        venue === v.name
                          ? 'border-[#c8a251] bg-[#c8a251]/20 text-[#f5d78e]'
                          : 'border-[#262832] bg-[#17181e] text-[#8e93a3] hover:border-[#404452] hover:text-white'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Engagement Type & Manual Budget Allocation in Rupees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                    Engagement Type
                  </label>
                  <div className="relative">
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Live Performances">Live Performance / Solo Recital</option>
                      <option value="Guest Conductor">Guest Conductor / Concerto</option>
                      <option value="Studio Sessions">Studio Sessions / Recording</option>
                      <option value="Score Composition">Original Film Score / Composition</option>
                      <option value="Private Salon">Private Salon Recital</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                    Budget Allocation (in ₹ Rupees) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c8a251] font-semibold text-base select-none pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. 75,000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-medium text-[#9ba0ad] mb-1.5 uppercase tracking-wider">
                  Event & Acoustic Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Piano model (e.g. Steinway Model D / Yamaha CFX), acoustical details, schedule notes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#1b1c21] border border-[#2c2f38] focus:border-[#c8a251] rounded-lg p-2.5 text-sm text-white focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] font-semibold rounded-lg tracking-wider transition-colors shadow-lg active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 text-xs uppercase"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Proposal...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Booking Proposal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
