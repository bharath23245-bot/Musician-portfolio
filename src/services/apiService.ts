import { Track, BookingRequest, UpcomingEvent, ArtistProfile, BookingStatus } from '../types';

const BASE_URL = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

export const apiService = {
  // Health
  async checkHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  // Stats
  async getStats() {
    const res = await fetch(`${BASE_URL}/stats`);
    return res.json();
  },

  // Tracks
  async getTracks(params?: { category?: string; search?: string }): Promise<ApiResponse<Track[]>> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const res = await fetch(`${BASE_URL}/tracks?${query.toString()}`);
    return res.json();
  },

  async createTrack(trackData: Partial<Track>): Promise<ApiResponse<Track>> {
    const res = await fetch(`${BASE_URL}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackData),
    });
    return res.json();
  },

  async updateTrack(id: string, updates: Partial<Track>): Promise<ApiResponse<Track>> {
    const res = await fetch(`${BASE_URL}/tracks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteTrack(id: string): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch(`${BASE_URL}/tracks/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Events
  async getEvents(): Promise<ApiResponse<UpcomingEvent[]>> {
    const res = await fetch(`${BASE_URL}/events`);
    return res.json();
  },

  async createEvent(eventData: Partial<UpcomingEvent>): Promise<ApiResponse<UpcomingEvent>> {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    return res.json();
  },

  async updateEvent(id: string, updates: Partial<UpcomingEvent>): Promise<ApiResponse<UpcomingEvent>> {
    const res = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteEvent(id: string): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Profile
  async getProfile(): Promise<ApiResponse<ArtistProfile>> {
    const res = await fetch(`${BASE_URL}/profile`);
    return res.json();
  },

  async updateProfile(profileData: Partial<ArtistProfile>): Promise<ApiResponse<ArtistProfile>> {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  // Bookings
  async getBookings(status?: string): Promise<ApiResponse<BookingRequest[]>> {
    const url = status ? `${BASE_URL}/bookings?status=${encodeURIComponent(status)}` : `${BASE_URL}/bookings`;
    const res = await fetch(url);
    return res.json();
  },

  async submitBooking(bookingData: {
    client: string;
    email: string;
    phone?: string;
    eventType: string;
    date: string;
    venue?: string;
    location?: string;
    budget?: string;
    message?: string;
  }): Promise<ApiResponse<BookingRequest>> {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return res.json();
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<ApiResponse<BookingRequest>> {
    const res = await fetch(`${BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async deleteBooking(id: string): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // AI Assistance (Gemini)
  async generateProgramNotes(pieceTitle: string, composer?: string, key?: string, mood?: string) {
    const res = await fetch(`${BASE_URL}/ai/program-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pieceTitle, composer, key, mood }),
    });
    return res.json();
  },

  async refineBio(rawBio: string, tone?: string) {
    const res = await fetch(`${BASE_URL}/ai/refine-bio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawBio, tone }),
    });
    return res.json();
  },
};
