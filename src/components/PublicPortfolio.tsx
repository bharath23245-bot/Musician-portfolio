import React from 'react';
import { Track, ArtistProfile, UpcomingEvent } from '../types';
import { Play, ChevronDown, ArrowRight, Instagram } from 'lucide-react';

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
            className="text-lg sm:text-xl font-serif tracking-[0.2em] font-medium text-white hover:text-[#c8a251] transition-colors"
          >
            BHARATH KANNAN
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-widest text-[#9ea2b0]">
            <button
              onClick={() => scrollToSection('hero-section')}
              className="text-[#c8a251] hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about-section')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('services-section')}
              className="hover:text-white transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('contact-section')}
              className="hover:text-white transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              id="portfolio-book-me-header-btn"
              onClick={() => onOpenBooking('Live Performances')}
              className="px-5 sm:px-6 py-2 bg-[#c8a251] hover:bg-[#d4b059] text-[#0b0c0e] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all shadow-md active:scale-95"
            >
              BOOK ME
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Grand Pianist with Spotlights) */}
      <section
        id="hero-section"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden"
      >
        {/* Background Image with Dark Vignette Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={profile.heroImage || '/hero-bg.jpg'}
            alt={`${profile.name} portrait`}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== '/hero-bg.jpg') {
                target.src = '/hero-bg.jpg';
              }
            }}
            className="w-full h-full object-cover object-top opacity-35 scale-105 transform filter brightness-95"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/70 to-[#0b0c0e]/85" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0b0c0e]/50 to-[#0b0c0e]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-12">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif tracking-[0.08em] font-normal text-white uppercase leading-none drop-shadow-2xl">
            {profile.name || 'BHARATH KANNAN'}
          </h1>

          <p className="text-sm sm:text-base md:text-xl font-medium tracking-[0.25em] uppercase text-[#c8a251] max-w-2xl mx-auto">
            {profile.tagline || 'PIANIST | COMPOSER | PERFORMER'}
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => scrollToSection('about-section')}
          aria-label="Scroll to About section"
          className="absolute bottom-8 z-10 text-[#8e93a3] hover:text-white transition-colors animate-bounce p-2"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

     {/* 3. About Section (Portrait & Philosophy) */}
      <section
        id="about-section"
        className="pt-20 sm:pt-28 pb-10 sm:pb-12 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Atmospheric Musician Portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-xl overflow-hidden bg-[#16171b] border border-[#262832] shadow-2xl group">
              <img
                src={profile.portraitImage || '/bharath-portrait.jpg'}
                alt={`Portrait of ${profile.name}`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/bharath-portrait.jpg') {
                    target.src = '/bharath-portrait.jpg';
                  }
                }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/50 via-transparent to-transparent opacity-30"></div>
            </div>
          </div>

          {/* Right: Artist Statement & Bio */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#f2f4f8] font-normal leading-snug">
              {profile.quote}
            </h2>

            <div className="w-16 h-0.5 bg-[#c8a251]"></div>

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

              {/* Instagram Profile Navigation */}
              <div className="pt-1 flex items-center gap-3">
                <a
                  id="about-instagram-link"
                  href={profile.instagram || 'https://www.instagram.com/bharathk_0'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit Bharath Kannan Instagram Profile"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#181920] border border-[#2c2f3b] text-[#c8a251] hover:text-white hover:bg-[#232530] hover:border-[#c8a251] transition-all shadow-md group"
                  title="Instagram (@bharathk_0)"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
            AVAILABLE FOR
          </span>
        </div>

        <div className="divide-y divide-[#1e2029]">
          {/* Item 1: Live Performances */}
          <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline px-3 -mx-3 rounded-xl transition-all">
            <div className="md:col-span-4">
              <h3 className="text-2xl sm:text-3xl font-serif text-[#f2f4f8]">
                Live Performances
              </h3>
            </div>
            <div className="md:col-span-8">
              <p className="text-sm text-[#9599a8] leading-relaxed">
                Solo recitals, concerto appearances with orchestras, and private luxury events. Delivering an immersive, high-fidelity acoustic experience tailored to prestigious venues.
              </p>
            </div>
          </div>

          {/* Item 2: Studio Sessions */}
          <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline px-3 -mx-3 rounded-xl transition-all">
            <div className="md:col-span-4">
              <h3 className="text-2xl sm:text-3xl font-serif text-[#f2f4f8]">
                Studio Sessions
              </h3>
            </div>
            <div className="md:col-span-8">
              <p className="text-sm text-[#9599a8] leading-relaxed">
                Professional session playing for film scores, commercial recordings, and contemporary albums. Bringing nuanced interpretation and technical precision to your recording.
              </p>
            </div>
          </div>

          {/* Item 3: Composition */}
          <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline px-3 -mx-3 rounded-xl transition-all">
            <div className="md:col-span-4">
              <h3 className="text-2xl sm:text-3xl font-serif text-[#f2f4f8]">
                Composition
              </h3>
            </div>
            <div className="md:col-span-8">
              <p className="text-sm text-[#9599a8] leading-relaxed">
                Original scoring for visual media, bespoke commissions for ensembles, and collaborative songwriting. Crafting evocative sonic landscapes that elevate the narrative.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact / CTA Banner Section */}
      <section
        id="contact-section"
        className="relative py-28 px-6 sm:px-12 text-center overflow-hidden border-t border-[#1a1b22]"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={profile.stageImage}
            alt="Concert stage grand piano"
            className="w-full h-full object-cover opacity-20 filter brightness-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/80 to-[#0b0c0e]"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8e93a3] block font-sans">
            LET'S CREATE SOMETHING MEMORABLE.
          </span>

          <p className="text-sm sm:text-base text-[#b9bdcb] max-w-lg mx-auto leading-relaxed">
            Available for international bookings, commissions, and collaborations.
          </p>

          <div className="pt-4">
            <button
              id="cta-inquire-now-btn"
              onClick={() => onOpenBooking('Live Performances')}
              className="px-10 py-4 bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all shadow-xl active:scale-95"
            >
              INQUIRE NOW
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[#1a1b22] pt-14 pb-12 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto text-xs text-[#7a7f8e]">
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

            <div className="flex items-center gap-4">
              <span className="hover:text-white cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-white cursor-pointer transition-colors">
                Terms of Service
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#17181e] text-center text-[#555966] text-[11px]">
          <span>© 2025 BHARATH KANNAN. Pianist | Composer | Performer. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
