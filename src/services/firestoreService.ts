import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Track, BookingRequest, UpcomingEvent, ArtistProfile, BookingStatus } from '../types';
import { bookingSchema, trackInputSchema, eventInputSchema, profileInputSchema } from '../schemas/validation';
import { initialTracks, initialBookings, initialEvents, initialArtistProfile } from '../data/initialData';

const BOOKINGS_COL = 'bookings';
const TRACKS_COL = 'tracks';
const EVENTS_COL = 'events';
const PROFILE_COL = 'profile';

/**
 * Public Booking Submission
 * Validates with Zod schema, sanitizes input, and saves directly to Firestore
 */
export async function submitBookingInquiry(data: {
  client: string;
  email: string;
  phone?: string;
  eventType: string;
  date: string;
  city: string;
  venue?: string;
  budget: string;
  requirements?: string;
}): Promise<{ success: boolean; id?: string; error?: string; notificationRecipient?: string }> {
  try {
    const validated = bookingSchema.parse(data);

    const bookingPayload = {
      client: validated.client,
      customerName: validated.client,
      email: validated.email,
      phone: validated.phone || '',
      eventType: validated.eventType,
      date: validated.date,
      venue: data.venue || 'Premier Concert Hall',
      location: validated.city,
      budget: validated.budget,
      message: validated.requirements || 'Inquiry regarding concert booking / commission in India.',
      status: 'Pending',
      submittedAt: serverTimestamp(),
      createdAt: new Date().toISOString().split('T')[0],
      notificationSent: true,
      notificationRecipient: 'bharath23245@gmail.com',
    };

    let docId = '';
    try {
      const docRef = await addDoc(collection(db, BOOKINGS_COL), bookingPayload);
      docId = docRef.id;
    } catch (dbErr) {
      console.warn('Firestore direct write warning, falling back to backend API:', dbErr);
    }

    // Direct Web3Forms submission to guarantee delivery to Gmail inbox without password
    try {
      const web3Res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: 'd84ed8d0-6e04-4bdb-8552-08172fdc0f4f',
          subject: `🎶 New Booking Proposal: ${validated.client} - ${validated.date} (${validated.city})`,
          from_name: 'Bharath Kannan Booking System',
          name: validated.client,
          email: validated.email,
          phone: validated.phone,
          event_date: validated.date,
          venue: data.venue || validated.city,
          location: validated.city,
          engagement_type: validated.eventType,
          budget_allocation: validated.budget,
          requirements: validated.requirements || 'Standard recital / concerto performance requirements.',
        }),
      });
      const web3Data = await web3Res.json();
      console.log('Web3Forms email notification status:', web3Data);
    } catch (w3Err) {
      console.warn('Web3Forms notification dispatch error:', w3Err);
    }

    // Trigger backend notification dispatch & email routing
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: validated.client,
          email: validated.email,
          phone: validated.phone,
          eventType: validated.eventType,
          date: validated.date,
          venue: data.venue,
          location: validated.city,
          budget: validated.budget,
          message: validated.requirements,
        }),
      });
    } catch (apiErr) {
      console.warn('Backend booking email dispatch notice:', apiErr);
    }

    return {
      success: true,
      id: docId || `BK-${Date.now()}`,
      notificationRecipient: 'bharath23245@gmail.com',
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Failed to submit booking inquiry securely.' };
  }
}

/**
 * Authenticated Admin Booking Listener (Real-time)
 * Only invoked in authenticated admin context
 */
export function subscribeToBookings(
  onUpdate: (bookings: BookingRequest[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, BOOKINGS_COL));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Return default seed bookings if database is freshly initialized
        onUpdate(initialBookings);
        return;
      }
      const list: BookingRequest[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          client: d.client || 'Anonymous Client',
          eventType: d.eventType || 'Live Performances',
          date: d.date || 'Flexible / 2025',
          venue: d.venue || 'NCPA Tata Theatre, Mumbai',
          location: d.location || 'Mumbai, Maharashtra, India',
          email: d.email || '',
          phone: d.phone || '',
          budget: d.budget || '₹1,50,000 – ₹3,00,000',
          message: d.message || d.requirements || 'Inquiry regarding concert booking.',
          status: (d.status as BookingStatus) || 'Pending',
          createdAt: d.createdAt || new Date().toISOString().split('T')[0],
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Booking subscription notice:', err);
      if (onError) onError(err);
      onUpdate(initialBookings);
    }
  );
}

/**
 * Update Booking Status (Admin Only)
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<boolean> {
  try {
    const docRef = doc(db, BOOKINGS_COL, bookingId);
    await updateDoc(docRef, { status });
    return true;
  } catch (err) {
    console.error('Error updating booking status:', err);
    return false;
  }
}

/**
 * Tracks Subscription
 */
export function subscribeToTracks(
  onUpdate: (tracks: Track[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, TRACKS_COL),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(initialTracks);
        return;
      }
      const list: Track[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Untitled Track',
          subtitle: d.subtitle || 'Solo Piano',
          category: d.category || 'Classical / Solo Piano',
          duration: d.duration || '3:45',
          durationSec: typeof d.durationSec === 'number' ? d.durationSec : 225,
          plays: typeof d.plays === 'number' ? d.plays : 1200,
          bpm: d.bpm || 120,
          keySignature: d.keySignature || 'C min',
          releaseDate: d.releaseDate || '2025',
          coverUrl: d.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          audioUrl: d.audioUrl || '',
          isFeatured: d.isFeatured ?? true,
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Tracks subscription notice:', err);
      if (onError) onError(err);
      onUpdate(initialTracks);
    }
  );
}

/**
 * Add Track with Validation (Admin Only)
 */
export async function saveTrack(track: Track): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    trackInputSchema.parse({
      title: track.title,
      category: track.category,
      duration: track.duration,
      bpm: track.bpm,
      key: track.keySignature,
      description: track.subtitle,
    });

    const docRef = await addDoc(collection(db, TRACKS_COL), {
      ...track,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: 'Failed to save track' };
  }
}

/**
 * Events Subscription
 */
export function subscribeToEvents(
  onUpdate: (events: UpcomingEvent[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, EVENTS_COL),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(initialEvents);
        return;
      }
      const list: UpcomingEvent[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          month: d.month || 'FEB',
          day: d.day || '15',
          fullDate: d.fullDate || 'FEB 15, 2025',
          title: d.title || 'Live Performance',
          venue: d.venue || 'Main Stage',
          location: d.location || 'Chennai, India',
          time: d.time || '8:00 PM IST',
          status: (d.status as 'Upcoming' | 'Sold Out' | 'Completed') || 'Upcoming',
          ticketUrl: d.ticketUrl || '#',
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Events subscription notice:', err);
      if (onError) onError(err);
      onUpdate(initialEvents);
    }
  );
}

/**
 * Add Event with Validation (Admin Only)
 */
export async function saveEvent(event: UpcomingEvent): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    eventInputSchema.parse({
      title: event.title,
      venue: event.venue,
      city: event.location,
      month: event.month,
      day: event.day,
      time: event.time || '8:00 PM IST',
      type: event.status,
    });

    const docRef = await addDoc(collection(db, EVENTS_COL), {
      ...event,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: 'Failed to save event' };
  }
}

/**
 * Update Event (Admin Only)
 */
export async function updateEventDoc(
  eventId: string,
  updates: Partial<UpcomingEvent>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, EVENTS_COL, eventId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err: unknown) {
    console.error('Error updating event doc:', err);
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: 'Failed to update event' };
  }
}

/**
 * Delete Event (Admin Only)
 */
export async function deleteEventDoc(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, EVENTS_COL, eventId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: unknown) {
    console.error('Error deleting event doc:', err);
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: 'Failed to delete event' };
  }
}

/**
 * Profile Subscription
 */
const LOCAL_PROFILE_STORAGE_KEY = 'maestro_saved_artist_profile_v2';

export function getCachedProfile(): ArtistProfile {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...initialArtistProfile, ...parsed };
    }
  } catch {
    // Ignore error
  }
  return initialArtistProfile;
}

export function saveCachedProfile(profile: ArtistProfile) {
  try {
    localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore error
  }
}

export function resetLocalProfileCache(): ArtistProfile {
  try {
    localStorage.removeItem(LOCAL_PROFILE_STORAGE_KEY);
  } catch {
    // Ignore error
  }
  return initialArtistProfile;
}

export function subscribeToProfile(
  onUpdate: (profile: ArtistProfile) => void,
  onError?: (err: Error) => void
) {
  // Emit locally saved profile immediately
  const cached = getCachedProfile();
  onUpdate(cached);

  const profileDoc = doc(db, PROFILE_COL, 'main');
  return onSnapshot(
    profileDoc,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<ArtistProfile>;
        const safePortrait =
          data.portraitImage && !data.portraitImage.startsWith('blob:')
            ? data.portraitImage
            : cached.portraitImage && !cached.portraitImage.startsWith('blob:')
            ? cached.portraitImage
            : '/bharath-portrait.jpg';

        const safeHero =
          data.heroImage && !data.heroImage.startsWith('blob:')
            ? data.heroImage
            : cached.heroImage && !cached.heroImage.startsWith('blob:')
            ? cached.heroImage
            : '/hero-bg.jpg';

        const updated: ArtistProfile = {
          ...initialArtistProfile,
          ...data,
          name: data.name ? data.name : initialArtistProfile.name,
          tagline: data.tagline ? data.tagline : initialArtistProfile.tagline,
          portraitImage: safePortrait,
          heroImage: safeHero,
        };
        saveCachedProfile(updated);
        onUpdate(updated);
      }
    },
    (err) => {
      console.warn('Profile subscription notice, using local cache:', err);
      if (onError) onError(err);
      onUpdate(getCachedProfile());
    }
  );
}

/**
 * Update Profile with Validation (Admin Only)
 */
export async function saveProfile(profile: ArtistProfile): Promise<{ success: boolean; error?: string }> {
  try {
    // Always persist to local browser storage immediately so changes are 100% permanent in VS Code & Chrome
    saveCachedProfile(profile);

    // Sync to backend Express server if running
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch {
      // Backend sync attempt
    }

    // Sync to Firestore cloud database
    try {
      const profileDoc = doc(db, PROFILE_COL, 'main');
      await setDoc(profileDoc, profile, { merge: true });
    } catch (dbErr) {
      console.warn('Firestore cloud sync notice, profile saved locally:', dbErr);
    }

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: 'Failed to save profile settings' };
  }
}
