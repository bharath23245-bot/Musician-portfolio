import { Track, BookingRequest, UpcomingEvent, ArtistProfile, BookingStatus } from '../../src/types';
import { initialArtistProfile, initialTracks, initialEvents, initialBookings } from '../../src/data/initialData';

class BackendStore {
  private profile: ArtistProfile = { ...initialArtistProfile };
  private tracks: Track[] = [...initialTracks];
  private events: UpcomingEvent[] = [...initialEvents];
  private bookings: BookingRequest[] = [...initialBookings];

  // Profile methods
  getProfile(): ArtistProfile {
    return { ...this.profile };
  }

  updateProfile(updates: Partial<ArtistProfile>): ArtistProfile {
    this.profile = { ...this.profile, ...updates };
    return { ...this.profile };
  }

  // Tracks methods
  getTracks(filter?: { category?: string; search?: string }): Track[] {
    let result = [...this.tracks];
    if (filter?.category && filter.category !== 'All') {
      result = result.filter((t) =>
        t.category.toLowerCase().includes(filter.category!.toLowerCase())
      );
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getTrackById(id: string): Track | undefined {
    return this.tracks.find((t) => t.id === id);
  }

  addTrack(track: Omit<Track, 'id'> & { id?: string }): Track {
    const newTrack: Track = {
      ...track,
      id: track.id || `track_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      plays: track.plays ?? 0,
      releaseDate: track.releaseDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    this.tracks.unshift(newTrack);
    return newTrack;
  }

  updateTrack(id: string, updates: Partial<Track>): Track | null {
    const index = this.tracks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.tracks[index] = { ...this.tracks[index], ...updates };
    return this.tracks[index];
  }

  deleteTrack(id: string): boolean {
    const initialLen = this.tracks.length;
    this.tracks = this.tracks.filter((t) => t.id !== id);
    return this.tracks.length < initialLen;
  }

  // Events methods
  getEvents(): UpcomingEvent[] {
    return [...this.events];
  }

  getEventById(id: string): UpcomingEvent | undefined {
    return this.events.find((e) => e.id === id);
  }

  addEvent(event: Omit<UpcomingEvent, 'id'> & { id?: string }): UpcomingEvent {
    const newEvent: UpcomingEvent = {
      ...event,
      id: event.id || `event_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<UpcomingEvent>): UpcomingEvent | null {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;
    this.events[index] = { ...this.events[index], ...updates };
    return this.events[index];
  }

  deleteEvent(id: string): boolean {
    const initialLen = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    return this.events.length < initialLen;
  }

  // Bookings methods
  getBookings(status?: string): BookingRequest[] {
    if (status && status !== 'All') {
      return this.bookings.filter((b) => b.status.toLowerCase() === status.toLowerCase());
    }
    return [...this.bookings];
  }

  getBookingById(id: string): BookingRequest | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  addBooking(bookingData: {
    client: string;
    email: string;
    phone?: string;
    eventType: string;
    date: string;
    venue?: string;
    location?: string;
    budget?: string;
    message?: string;
  }): BookingRequest {
    const newBooking: BookingRequest = {
      id: `BK-${Math.floor(100 + Math.random() * 900)}`,
      client: bookingData.client,
      email: bookingData.email,
      phone: bookingData.phone || '',
      eventType: bookingData.eventType,
      date: bookingData.date,
      venue: bookingData.venue || 'NCPA Tata Theatre, Mumbai',
      location: bookingData.location || 'Mumbai, India',
      budget: bookingData.budget || '₹1,50,000 – ₹3,00,000',
      message: bookingData.message || '',
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.bookings.unshift(newBooking);
    return newBooking;
  }

  updateBookingStatus(id: string, status: BookingStatus): BookingRequest | null {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return null;
    booking.status = status;
    return { ...booking };
  }

  deleteBooking(id: string): boolean {
    const initialLen = this.bookings.length;
    this.bookings = this.bookings.filter((b) => b.id !== id);
    return this.bookings.length < initialLen;
  }

  // Summary statistics
  getStats() {
    const totalPlays = this.tracks.reduce((acc, t) => acc + (t.plays || 0), 0);
    const pendingBookings = this.bookings.filter((b) => b.status === 'Pending').length;
    const confirmedBookings = this.bookings.filter((b) => b.status === 'Confirmed').length;
    return {
      totalTracks: this.tracks.length,
      totalPlays,
      upcomingShows: this.events.length,
      totalBookings: this.bookings.length,
      pendingBookings,
      confirmedBookings,
      artistName: this.profile.name,
      serverTime: new Date().toISOString(),
    };
  }
}

export const backendStore = new BackendStore();
