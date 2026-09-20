import React, { useState } from 'react';
import { Track, ArtistProfile, UpcomingEvent } from '../types';
import { Play, ChevronDown, ArrowRight, Instagram } from 'lucide-react';
import { LegalModal } from './LegalModal';

interface PublicPortfolioProps {
  profile: ArtistProfile;
  tracks: Track[];
  events: UpcomingEvent[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onOpenBooking: (type?: string) => void;
  onOpenBio: () => void;
  onNavigateToLogin: () => void;
}

export const PublicPortfolio: React.FC<PublicPortfolioProps> = ({
  profile,
  tracks,
  events,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onOpenBooking,
  onOpenBio,
  onNavigateToLogin,
}) => {
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const handleOpenLegal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-w-full bg-[#0b0c0e] text-[#e1e3e6] font-sans pb-28">
      {/* 1. Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#0b0c0e]/80 backdrop-blur-md border-b border-[#1c1d22]/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero-section');
            }}
            className="text-base sm:text-lg tracking-[0.25em] font-serif font-normal text-[#f5f5f7] hover:text-[#c8a251] transition-colors uppercase"
          >
            {profile.name}
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-[0.2em] text-[#9ca3af]">
            <button
              onClick={() => scrollToSection('about-section')}
              className="hover:text-[#c8a251] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('services-section')}
              className="hover:text-[#c8a251] transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('discography-section')}
              className="hover:text-[#c8a251] transition-colors cursor-pointer"
            >
              Discography
            </button>
            <button
              onClick={() => scrollToSection('concerts-section')}
              className="hover:text-[#c8a251] transition-colors cursor-pointer"
            >
              Concerts
            </button>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenBooking('Live Performances')}
              className="px-5 py-2.5 rounded-full bg-[#181920] border border-[#2b2d37] hover:border-[#c8a251] text-[#c8a251] hover:text-white text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            >
              Book Inquiries
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Minimalist & Cinematic) */}
      <section
        id="hero-section"
        className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 pt-28 pb-16 overflow-hidden"
      >
        {/* Subtle Background Lighting Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#c8a251]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto z-10 space-y-6">
          <div className="inline-block mb-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#c8a251] font-semibold border-b border-[#c8a251]/30 pb-1">
              {profile.tagline}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-light tracking-[0.12em] text-[#f4f4f6] uppercase leading-tight">
            {profile.name}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#9da2b4] max-w-2xl mx-auto font-light leading-relaxed">
            {profile.quote}
          </p>

          {/* Hero CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (tracks.length > 0) {
                  onPlayTrack(tracks[0]);
                } else {
                  scrollToSection('discography-section');
                }
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#c8a251] hover:bg-[#d4b05e] text-[#0b0c0e] text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c8a251]/10 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen to Repertoire</span>
            </button>

            <button
              onClick={() => onOpenBooking('Live Performances')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-transparent hover:bg-white/5 border border-[#2e313c] hover:border-[#9da2b4] text-[#d6d8e1] text-xs uppercase tracking-[0.2em] transition-all cursor-pointer"
            >
              Request Booking
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          onClick={() => scrollToSection('about-section')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#6f7382] hover:text-[#c8a251] transition-colors cursor-pointer"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* 3. About Section (Portrait & Philosophy) */}
      <section
        id="about-section"
        className="pt-20 sm:pt-28 pb-10 sm:pb-12 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Atmospheric Musician Portrait */}
          <div className="lg:col-span-5 relative group">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#16171d] border border-[#262833] relative shadow-2xl">
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c8a251] block mb-1">
                  Pianist & Composer
                </span>
                <p className="text-xs text-[#a0a5b5] italic font-serif">
                  "Resonating through timeless acoustic purity."
                </p>
              </div>
            </div>
          </div>

          {/* Right: Artist Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#c8a251] font-semibold">
                The Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-white mt-2 leading-tight">
                An Architecture of Pure Resonance & Emotion
              </h2>
            </div>

            <div className="space-y-4 text-[#a3a7b6] text-sm sm:text-base leading-relaxed">
              <p>{profile.bioParagraph1}</p>
              <p>{profile.bioParagraph2}</p>
            </div>

            <div className="pt-2 space-y-4">
              <div>
                <button
                  id="read-full-bio-btn"
                  onClick={onOpenBio}
                  className="text-xs uppercase tracking-[0.2em] text-[#e5e7eb] hover:text-[#c8a251] font-semibold border-b border-[#4b4e5b] hover:border-[#c8a251] pb-1 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>READ FULL BIOGRAPHY</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Instagram Profile Navigation - Prominent Enriched Button */}
              <div className="pt-2 flex items-center gap-3">
                <a
                  id="about-instagram-link"
                  href={profile.instagram || 'https://www.instagram.com/bharathk_0'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit Bharath Kannan Instagram Profile"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#181920] border-2 border-[#2c2f3b] text-[#c8a251] hover:text-white hover:bg-[#232530] hover:border-[#c8a251] transition-all shadow-lg group cursor-pointer active:scale-95"
                  title="Follow on Instagram (@bharathk_0)"
                >
                  <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href={profile.instagram || 'https://www.instagram.com/bharathk_0'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#a5a9ba] hover:text-[#c8a251] font-mono tracking-wider transition-colors"
                >
                  @bharathk_0
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Available For / Services Section */}
      <section
        id="services-section"
        className="pt-10 sm:pt-12 pb-20 sm:pb-24 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto border-t border-[#1a1b22]"
      >
        <div className="mb-10">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#c8a251] font-semibold">
            Engagements
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-white mt-1">
            Available For
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profile.services.map((service, index) => (
            <div
              key={index}
              className="p-8 rounded-xl bg-[#121317] border border-[#21232c] hover:border-[#c8a251]/50 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-xs font-mono text-[#c8a251] opacity-70">
                  0{index + 1}
                </span>
                <h3 className="text-xl font-serif text-[#f2f3f6] group-hover:text-[#c8a251] transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-[#8f94a4] leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onOpenBooking(service.title)}
                  className="text-xs uppercase tracking-wider text-[#c8a251] hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Inquire Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Discography / Audio Showcase Section */}
      <section
        id="discography-section"
        className="py-24 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto border-t border-[#1a1b22]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#c8a251] font-semibold">
              Selected Repertoire
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white mt-1">
              Discography & Recordings
            </h2>
          </div>
          <p className="text-xs text-[#878c9c] max-w-md">
            Stream acoustic recordings composed and performed on concert grand pianos.
          </p>
        </div>

        <div className="space-y-3">
          {tracks.map((track, idx) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`p-4 sm:p-5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                  currentTrack?.id === track.id
                    ? 'bg-[#181920] border-[#c8a251]/60 shadow-md'
                    : 'bg-[#121317] border-[#1f2029] hover:border-[#2e313e] hover:bg-[#15161d]'
                }`}
              >
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <span className="font-mono text-xs text-[#636877] w-6 text-center">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <button
                    aria-label={`Play ${track.title}`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                      isThisTrackPlaying
                        ? 'bg-[#c8a251] text-[#0b0c0e]'
                        : 'bg-[#1c1e26] text-[#c8a251] group-hover:bg-[#c8a251] group-hover:text-[#0b0c0e]'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm sm:text-base font-serif font-medium truncate ${
                        currentTrack?.id === track.id
                          ? 'text-[#c8a251]'
                          : 'text-[#eceef2] group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-[#7e8392] truncate mt-0.5">
                      {track.album || 'Solo Concert Piano'} • {track.year || '2024'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#868b9a]">
                  <span>{track.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Upcoming Concerts & Tour Dates */}
      <section
        id="concerts-section"
        className="py-24 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto border-t border-[#1a1b22]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#c8a251] font-semibold">
              Live Appearances
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white mt-1">
              Concert Itinerary
            </h2>
          </div>
          <button
            onClick={() => onOpenBooking('Live Performances')}
            className="text-xs text-[#c8a251] hover:text-white uppercase tracking-widest inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Propose Concert Date</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-6 rounded-xl bg-[#121317] border border-[#1f2029] hover:border-[#2b2e3a] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#c8a251]">
                  {event.date}
                </span>
                <h3 className="text-lg font-serif text-[#f2f3f6]">
                  {event.city} • {event.venue}
                </h3>
                <p className="text-xs text-[#7d8291]">
                  {event.program}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {event.ticketUrl ? (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2 rounded-lg bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
                  >
                    Book Tickets
                  </a>
                ) : (
                  <button
                    onClick={() => onOpenBooking(event.program)}
                    className="px-5 py-2 rounded-lg bg-[#1a1b22] hover:bg-[#252833] border border-[#2f3240] text-xs text-[#d0d3df] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Inquire Event
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-20 border-t border-[#1a1b22] pt-14 pb-12 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
          <div>
            <h4 className="text-xl font-serif tracking-[0.2em] text-white font-normal mb-2">
              BHARATH KANNAN
            </h4>
            <p className="text-xs text-[#878c9c] max-w-sm">
              Pianist & Music Composer. Crafting immersive acoustic and cinematic musical experiences.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-center">
            <div className="flex items-center gap-3">
              <a
                href={profile.instagram || 'https://www.instagram.com/bharathk_0'}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16171d] border border-[#272933] text-[#c8a251] hover:text-white hover:border-[#c8a251] transition-all"
                title="Instagram (@bharathk_0)"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span className="font-medium text-[11px]">Instagram</span>
              </a>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                id="footer-privacy-btn"
                onClick={() => handleOpenLegal('privacy')}
                className="text-[#878c9c] hover:text-[#c8a251] cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-[#323542]">•</span>
              <button
                type="button"
                id="footer-terms-btn"
                onClick={() => handleOpenLegal('terms')}
                className="text-[#878c9c] hover:text-[#c8a251] cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#17181e] text-center text-[#555966] text-[11px]">
          <span>© 2026 BHARATH KANNAN. Pianist | Composer | Performer. All rights reserved.</span>
        </div>
      </footer>

      {/* 6. Legal / Privacy & Terms Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalTab}
        artistName={profile.name}
      />
    </div>
  );
};
