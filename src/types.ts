export type ScreenMode = 'portfolio' | 'login' | 'dashboard';

export type AdminTab = 'dashboard' | 'bookings' | 'calendar' | 'settings' | 'account';

export type BookingStatus = 'Confirmed' | 'Pending' | 'Declined' | 'Completed';

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  durationSec: number;
  audioUrl?: string;
  coverUrl: string;
  releaseDate: string;
  plays: number;
  bpm?: number;
  keySignature?: string;
  isFeatured?: boolean;
}

export interface BookingRequest {
  id: string;
  client: string; // Customer Name
  customerName?: string;
  eventType: string;
  date: string; // Event Date
  rawDate?: string;
  status: BookingStatus;
  venue: string;
  location: string; // Event Location
  email: string; // Customer Email
  phone?: string; // Customer Phone Number
  budget: string;
  message: string;
  createdAt: string;
  notificationSent?: boolean;
  notificationRecipient?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  month: string;
  day: string;
  fullDate: string;
  venue: string;
  location: string;
  ticketUrl?: string;
  time?: string;
  status: 'Upcoming' | 'Sold Out' | 'Completed';
}

export interface ArtistProfile {
  name: string;
  tagline: string;
  quote: string;
  bioParagraph1: string;
  bioParagraph2: string;
  fullBio: string;
  heroImage: string;
  portraitImage: string;
  stageImage: string;
  email: string;
  notificationEmail?: string; // Target email for immediate booking notifications
  phone: string;
  managerName: string;
  instagram: string;
  spotify: string;
  youtube: string;
}
