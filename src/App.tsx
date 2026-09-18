import React, { useState, useEffect } from 'react';
import { ScreenMode, Track, BookingRequest, UpcomingEvent, ArtistProfile } from './types';
import { initialArtistProfile, initialTracks, initialEvents } from './data/initialData';
import { audioEngine } from './utils/audioEngine';
import { NavigationSwitcher } from './components/NavigationSwitcher';
import { PublicPortfolio } from './components/PublicPortfolio';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { BookingModal } from './components/BookingModal';
import { BioModal } from './components/BioModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeToTracks,
  subscribeToEvents,
  subscribeToProfile,
  subscribeToBookings,
  saveTrack,
  saveEvent,
  updateEventDoc,
  deleteEventDoc,
  saveProfile,
  updateBookingStatus,
  getCachedProfile,
} from './services/firestoreService';

const appMode = (import.meta.env.VITE_APP_MODE || '').toLowerCase();
const separateAdminUrl = import.meta.env.VITE_ADMIN_URL || '';
const separatePublicUrl = import.meta.env.VITE_PUBLIC_URL || '';

const AppContent: React.FC = () => {
  const { user, userName } = useAuth();

  // Determine initial screen based on VITE_APP_MODE or URL
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>(() => {
    if (appMode === 'portfolio' || appMode === 'public') return 'portfolio';
    if (appMode === 'admin') return 'login';
    return 'portfolio';
  });
  const [profile, setProfile] = useState<ArtistProfile>(getCachedProfile);
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [events, setEvents] = useState<UpcomingEvent[]>(initialEvents);
  
  // Private booking data: only populated when authenticated as admin
  const [bookings, setBookings] = useState<BookingRequest[]>([]);

  // Check URL path, search parameters, and hash on mount (for unified mode)
  useEffect(() => {
    if (appMode === 'portfolio' || appMode === 'public') {
      setCurrentScreen('portfolio');
      return;
    }
    if (appMode === 'admin') {
      setCurrentScreen(user ? 'dashboard' : 'login');
      return;
    }

    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();

      if (
        path === '/admin' ||
        path === '/login' ||
        path === '/dashboard' ||
        params.get('admin') === 'true' ||
        params.get('admin') === 'login' ||
        hash === '#admin' ||
        hash === '#login' ||
        hash === '#dashboard'
      ) {
        setCurrentScreen(user ? 'dashboard' : 'login');
      }
    }
  }, [user]);

  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showPlayer, setShowPlayer] = useState(false);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState('Live Performances');
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  // Subscribe to Public Collections (Tracks, Events, Profile) from Firestore
  useEffect(() => {
    const unsubTracks = subscribeToTracks((updatedTracks) => {
      setTracks(updatedTracks);
    });

    const unsubEvents = subscribeToEvents((updatedEvents) => {
      setEvents(updatedEvents);
    });

    const unsubProfile = subscribeToProfile((updatedProfile) => {
      setProfile(updatedProfile);
    });

    return () => {
      unsubTracks();
      unsubEvents();
      unsubProfile();
    };
  }, []);

  // Secure Private Data Isolation: Only subscribe to Bookings if user is authenticated
  useEffect(() => {
    if (!user) {
      // Clear private PII from memory when not authenticated
      setBookings([]);
      return;
    }

    const unsubBookings = subscribeToBookings((updatedBookings) => {
      setBookings(updatedBookings);
    });

    return () => {
      unsubBookings();
    };
  }, [user]);

  // Route Guard: prevent unauthenticated access to dashboard
  useEffect(() => {
    if (currentScreen === 'dashboard' && !user) {
      setCurrentScreen('login');
    }
  }, [currentScreen, user]);

  // Audio Engine time & end callbacks
  useEffect(() => {
    audioEngine.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    });

    audioEngine.onEnded(() => {
      handleNextTrack();
    });
  }, [tracks, currentTrack]);

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      setCurrentTrack(track);
      setShowPlayer(true);
      setIsPlaying(true);
      audioEngine.play(track.id, track.durationSec, 0);
    }
  };

  const handleTogglePlay = () => {
    if (!currentTrack) {
      if (tracks.length > 0) handlePlayTrack(tracks[0]);
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioEngine.play(currentTrack.id, currentTrack.durationSec, currentTime);
    }
  };

  const handlePrevTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(tracks[prevIndex]);
  };

  const handleNextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlayTrack(tracks[nextIndex]);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    audioEngine.seek(time);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleOpenBooking = (type: string = 'Live Performances') => {
    setBookingType(type);
    setIsBookingModalOpen(true);
  };

  const handleAddBooking = (newBooking: BookingRequest) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleAddTrack = async (newTrack: Track) => {
    setTracks((prev) => [newTrack, ...prev]);
    await saveTrack(newTrack);
  };

  const handleAddEvent = async (newEvent: UpcomingEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    await saveEvent(newEvent);
  };

  const handleUpdateEvent = async (updatedEvent: UpcomingEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    await updateEventDoc(updatedEvent.id, updatedEvent);
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await deleteEventDoc(id);
  };

  const handleUpdateBookingStatus = async (id: string, status: 'Confirmed' | 'Pending' | 'Declined') => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    await updateBookingStatus(id, status);
  };

  const handleUpdateProfile = async (updatedProfile: ArtistProfile) => {
    setProfile(updatedProfile);
    await saveProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#e1e3e6] flex flex-col selection:bg-[#c8a251] selection:text-[#0b0c0e]">
      {/* 1. Global Navigation Switcher: Only displayed when logged in or in Admin screen */}
      {appMode !== 'portfolio' && appMode !== 'public' && (user || currentScreen !== 'portfolio') && (
        <NavigationSwitcher
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          isPlaying={isPlaying}
          currentTrackTitle={currentTrack?.title}
        />
      )}

      {/* 2. Main Screen Render */}
      <div className="flex-1">
        {currentScreen === 'portfolio' && (
          <PublicPortfolio
            profile={profile}
            tracks={tracks}
            events={events}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onOpenBooking={handleOpenBooking}
            onOpenBio={() => setIsBioModalOpen(true)}
            onNavigateToLogin={() => {
              if (separateAdminUrl) {
                window.open(separateAdminUrl, '_blank');
              } else {
                setCurrentScreen('login');
              }
            }}
          />
        )}

        {currentScreen === 'login' && (
          <AdminLogin
            onLoginSuccess={(name) => {
              if (name && name.trim()) {
                const trimmedName = name.trim();
                setProfile((prev) => {
                  const previousName = prev.name;
                  const replaceRegex = new RegExp(previousName, 'gi');
                  const updated = {
                    ...prev,
                    name: trimmedName.toUpperCase(),
                    bioParagraph1: prev.bioParagraph1.replace(replaceRegex, trimmedName).replace(/Elias Thorne/gi, trimmedName),
                    bioParagraph2: prev.bioParagraph2.replace(replaceRegex, trimmedName).replace(/Elias Thorne/gi, trimmedName),
                    fullBio: prev.fullBio.replace(replaceRegex, trimmedName).replace(/Elias Thorne/gi, trimmedName),
                  };
                  saveProfile(updated);
                  return updated;
                });
              }
              setCurrentScreen('dashboard');
            }}
            onBackToPortfolio={() => {
              if (separatePublicUrl) {
                window.location.href = separatePublicUrl;
              } else {
                setCurrentScreen('portfolio');
              }
            }}
          />
        )}

        {currentScreen === 'dashboard' && user && (
          <AdminDashboard
            userName={userName}
            tracks={tracks}
            bookings={bookings}
            events={events}
            profile={profile}
            onAddTrack={handleAddTrack}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateProfile={handleUpdateProfile}
            onLogout={() => {
              if (separatePublicUrl) {
                window.location.href = separatePublicUrl;
              } else {
                setCurrentScreen('portfolio');
              }
            }}
            onViewPortfolio={() => {
              if (separatePublicUrl) {
                window.open(separatePublicUrl, '_blank');
              } else {
                setCurrentScreen('portfolio');
              }
            }}
          />
        )}
      </div>

      {/* 3. Global Audio Player Bar */}
      {showPlayer && currentScreen === 'portfolio' && (
        <AudioPlayerBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          artistName={profile.name}
          onTogglePlay={handleTogglePlay}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onClose={() => {
            setShowPlayer(false);
            if (isPlaying) handleTogglePlay();
          }}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />
      )}

      {/* 4. Booking & Inquiries Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmitBooking={handleAddBooking}
        preselectedType={bookingType}
        artistName={profile.name}
      />

      {/* 5. Artist Biography Modal */}
      <BioModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        profile={profile}
        onBookMe={() => handleOpenBooking('Live Performances')}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
