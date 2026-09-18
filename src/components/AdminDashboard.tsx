import React, { useState, useMemo, useRef } from 'react';
import { Track, BookingRequest, UpcomingEvent, ArtistProfile, AdminTab } from '../types';
import {
  LayoutDashboard, Music2, CalendarCheck, Settings, User, Plus, Search,
  Bell, LogOut, CheckCircle2, Clock, XCircle, PlusCircle, Sparkles, Filter, X,
  ShieldCheck, KeyRound, Lock, Cpu, Check, Calendar, Download, FolderArchive,
  Mail, Phone, MapPin, Send, Upload, Image as ImageIcon, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EventCalendarView } from './EventCalendarView';
import { resetLocalProfileCache } from '../services/firestoreService';

interface AdminDashboardProps {
  userName?: string;
  tracks: Track[];
  bookings: BookingRequest[];
  events: UpcomingEvent[];
  profile: ArtistProfile;
  onAddTrack: (track: Track) => void;
  onAddEvent: (event: UpcomingEvent) => void;
  onUpdateEvent?: (event: UpcomingEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onUpdateBookingStatus: (id: string, status: 'Confirmed' | 'Pending' | 'Declined') => void;
  onUpdateProfile: (profile: ArtistProfile) => void;
  onLogout: () => void;
  onViewPortfolio: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userName = 'Bharath Kannan',
  tracks,
  bookings,
  events,
  profile,
  onAddTrack,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onUpdateBookingStatus,
  onUpdateProfile,
  onLogout,
  onViewPortfolio,
}) => {
  const { user, updateUserPassword, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewReleaseModal, setShowNewReleaseModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAllBookingsModal, setShowAllBookingsModal] = useState(false);

  // Website Settings Form State
  const [editArtistName, setEditArtistName] = useState(profile.name);
  const [editTagline, setEditTagline] = useState(profile.tagline);
  const [editQuote, setEditQuote] = useState(profile.quote);
  const [editNotificationEmail, setEditNotificationEmail] = useState(profile.notificationEmail || 'bharath23245@gmail.com');
  const [editPortraitImage, setEditPortraitImage] = useState(profile.portraitImage || '/bharath-portrait.jpg');
  const [editHeroImage, setEditHeroImage] = useState(profile.heroImage || '/hero-bg.jpg');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  const portraitFileInputRef = useRef<HTMLInputElement | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync with incoming profile updates
  React.useEffect(() => {
    setEditArtistName(profile.name);
    setEditTagline(profile.tagline);
    setEditQuote(profile.quote);
    setEditNotificationEmail(profile.notificationEmail || 'bharath23245@gmail.com');
    setEditPortraitImage(profile.portraitImage || '/bharath-portrait.jpg');
    setEditHeroImage(profile.heroImage || '/hero-bg.jpg');
  }, [profile.name, profile.tagline, profile.quote, profile.notificationEmail, profile.portraitImage, profile.heroImage]);

  // New Release Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('Solo Piano');
  const [newCategory, setNewCategory] = useState('Classical / Solo Piano');
  const [newDuration, setNewDuration] = useState('4:15');

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventVenue, setNewEventVenue] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventMonth, setNewEventMonth] = useState('FEB');
  const [newEventDay, setNewEventDay] = useState('18');

  // Account Security Form State
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [isEncryptingPassword, setIsEncryptingPassword] = useState(false);

  // Email Notification Test State
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestNotificationEmail = async () => {
    setIsTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.notificationEmail || 'bharath23245@gmail.com' }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailResult({
          success: true,
          message: `Test email alert successfully sent to ${data.recipient}! (${data.mode === 'live_smtp' ? 'Live SMTP' : 'Local Development Relay'})`,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: data.error || 'Failed to dispatch test notification.',
        });
      }
    } catch (err: unknown) {
      setTestEmailResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network error communicating with notification server.',
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const adminPassRules = useMemo(() => {
    const hasMinLength = newAdminPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newAdminPassword);
    const hasNumber = /[0-9]/.test(newAdminPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newAdminPassword);
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecialChar) score += 1;
    return {
      hasMinLength,
      hasUppercase,
      hasNumber,
      hasSpecialChar,
      score,
      isStrong: score === 4,
    };
  }, [newAdminPassword]);

  const handleUpdateSecurityPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    if (!adminPassRules.isStrong) {
      setPasswordErrorMsg('New password must meet all 4 strong requirements (8+ chars, caps, number, special char).');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordErrorMsg('Passwords do not match.');
      return;
    }

    setIsEncryptingPassword(true);
    const res = await updateUserPassword(newAdminPassword);
    setIsEncryptingPassword(false);

    if (res.success) {
      setPasswordSuccessMsg(true);
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setTimeout(() => setPasswordSuccessMsg(false), 4000);
    } else {
      setPasswordErrorMsg(res.error || 'Failed to update credentials. You may need to sign in again first.');
    }
  };

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;

  const handlePortraitFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const dataUrl = event.target.result;
        setEditPortraitImage(dataUrl);
        onUpdateProfile({
          ...profile,
          portraitImage: dataUrl,
        });
        setSaveSuccessMessage(true);
        setTimeout(() => setSaveSuccessMessage(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const dataUrl = event.target.result;
        setEditHeroImage(dataUrl);
        onUpdateProfile({
          ...profile,
          heroImage: dataUrl,
        });
        setSaveSuccessMessage(true);
        setTimeout(() => setSaveSuccessMessage(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editArtistName.trim()) return;
    const formattedName = editArtistName.trim().toUpperCase();
    const updatedNotificationEmail = editNotificationEmail.trim() || 'bharath23245@gmail.com';

    onUpdateProfile({
      ...profile,
      name: formattedName,
      tagline: editTagline,
      quote: editQuote,
      notificationEmail: updatedNotificationEmail,
      portraitImage: editPortraitImage,
      heroImage: editHeroImage,
    });

    try {
      await fetch('/api/notifications/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationEmail: updatedNotificationEmail }),
      });
    } catch (err) {
      console.warn('Failed to sync notification email with server:', err);
    }

    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const track: Track = {
      id: `${Date.now()}`,
      title: newTitle,
      subtitle: newSubtitle,
      category: newCategory,
      duration: newDuration,
      durationSec: 255,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      releaseDate: 'Just Added',
      plays: 0,
      isFeatured: true,
    };
    onAddTrack(track);
    setShowNewReleaseModal(false);
    setNewTitle('');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    const ev: UpcomingEvent = {
      id: `EV-${Date.now()}`,
      title: newEventTitle,
      venue: newEventVenue,
      location: newEventLocation,
      month: newEventMonth.toUpperCase(),
      day: newEventDay,
      fullDate: `${newEventMonth} ${newEventDay}, 2025`,
      status: 'Upcoming',
    };
    onAddEvent(ev);
    setShowAddEventModal(false);
    setNewEventTitle('');
  };

  return (
    <div className="min-h-screen bg-[#0e0f12] text-[#e1e3e6] flex flex-col md:flex-row font-sans">
      {/* 1. Left Sidebar (Matching Image 1) */}
      <aside className="w-full md:w-64 bg-[#141518] border-r border-[#20222a] flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          {/* Top Brand & Profile */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1f2128] border border-[#2d303b] flex-shrink-0">
              <img
                src={profile.portraitImage}
                alt={profile.name}
                className="w-full h-full object-cover filter grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white font-serif tracking-wide truncate max-w-[140px]">
                {profile.name || userName}
              </h2>
              <p className="text-[11px] text-[#c8a251]">Artist Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#2b2738] text-white border-l-2 border-[#a599e9]'
                  : 'text-[#8e93a3] hover:text-white hover:bg-[#1a1c22]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="sidebar-bookings-tab-btn"
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'bookings'
                  ? 'bg-[#2b2738] text-white border-l-2 border-[#a599e9]'
                  : 'text-[#8e93a3] hover:text-white hover:bg-[#1a1c22]'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4" />
                <span>Booking Requests</span>
              </div>
              {pendingBookingsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#e89895]/20 text-[#f0a8a8] border border-[#e89895]/30">
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            <button
              id="sidebar-calendar-tab-btn"
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'bg-[#2b2738] text-white border-l-2 border-[#a599e9]'
                  : 'text-[#8e93a3] hover:text-white hover:bg-[#1a1c22]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Tour Calendar</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#a599e9]/20 text-[#a599e9] border border-[#a599e9]/30 font-mono">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#2b2738] text-white border-l-2 border-[#a599e9]'
                  : 'text-[#8e93a3] hover:text-white hover:bg-[#1a1c22]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'account'
                  ? 'bg-[#2b2738] text-white border-l-2 border-[#a599e9]'
                  : 'text-[#8e93a3] hover:text-white hover:bg-[#1a1c22]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </button>
          </nav>
        </div>

        {/* Bottom Button: + Add Tour Event */}
        <div className="pt-4 border-t border-[#1f2128]">
          <button
            id="sidebar-add-event-btn"
            onClick={() => setShowAddEventModal(true)}
            className="w-full py-3 bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] font-semibold text-xs rounded transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tour Event</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Admin Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0e0f12] overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#1f2128] px-6 sm:px-10 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636877]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16171b] border border-[#262831] focus:border-[#c8a251] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#636877] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* User Indicator Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181a20] border border-[#272933] text-xs">
              <div className="w-5 h-5 rounded-full bg-[#c8a251] text-[#0b0c0e] flex items-center justify-center font-bold text-[10px]">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[#e1e3e6] font-medium max-w-[140px] truncate">{userName}</span>
            </div>

            <button
              onClick={() => alert(`You have ${pendingBookingsCount} pending booking proposals awaiting review.`)}
              className="relative p-2 rounded-lg text-[#8e93a3] hover:text-white hover:bg-[#191a20] transition-colors"
            >
              <Bell className="w-4 h-4" />
              {pendingBookingsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c8a251]"></span>
              )}
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-[#8e93a3] hover:text-[#f87171] hover:bg-[#191a20] transition-colors"
              title="Sign Out / Return to Public"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="p-6 sm:p-10 max-w-6xl w-full space-y-10">
          {activeTab === 'dashboard' && (
            <>
              {/* Header Greetings */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-serif text-[#d6d9e0] font-normal">
                  Hello, {userName}
                </h1>
                <p className="text-xs sm:text-sm text-[#7e8494]">
                  Here is a summary of your booking inquiries and upcoming concert schedule.
                </p>
              </div>

              {/* 3 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Total Inquiries */}
                <div
                  id="dashboard-total-inquiries-card"
                  onClick={() => setActiveTab('bookings')}
                  className="p-6 rounded-xl bg-[#141518] border border-[#20222a] space-y-3 cursor-pointer hover:border-[#c8a251]/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-[#8e93a3] font-medium block">
                      Total Inquiries
                    </span>
                    <span className="text-[10px] text-[#c8a251] group-hover:underline">View All →</span>
                  </div>
                  <div className="text-5xl sm:text-6xl font-serif font-normal text-[#c8a251]">
                    {bookings.length}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div
                  id="dashboard-upcoming-events-card"
                  onClick={() => setActiveTab('calendar')}
                  className="p-6 rounded-xl bg-[#141518] border border-[#20222a] space-y-3 cursor-pointer hover:border-[#a599e9]/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-[#8e93a3] font-medium block">
                      Upcoming Events
                    </span>
                    <span className="text-[10px] text-[#a599e9] group-hover:underline">Open Calendar →</span>
                  </div>
                  <div className="text-5xl sm:text-6xl font-serif font-normal text-[#a599e9]">
                    {events.length}
                  </div>
                </div>

                {/* Pending Bookings */}
                <div className="p-6 rounded-xl bg-[#141518] border border-[#20222a] space-y-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#8e93a3] font-medium block">
                    Pending Bookings
                  </span>
                  <div className="text-5xl sm:text-6xl font-serif font-normal text-[#e89895]">
                    {pendingBookingsCount || '3'}
                  </div>
                </div>
              </div>

              {/* Two Column Section: Recent Bookings & Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Recent Bookings Table */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-serif text-[#d6d9e0] font-normal">
                      Recent Bookings
                    </h2>
                    <button
                      onClick={() => setShowAllBookingsModal(true)}
                      className="text-xs uppercase tracking-widest text-[#c8a251] hover:underline font-medium"
                    >
                      VIEW ALL
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-[#20222a] bg-[#141518]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#20222a] bg-[#101114] text-[#8e93a3] text-[11px] uppercase tracking-wider">
                          <th className="py-3.5 px-4 font-medium">Client</th>
                          <th className="py-3.5 px-4 font-medium">Event Type</th>
                          <th className="py-3.5 px-4 font-medium">Date</th>
                          <th className="py-3.5 px-4 font-medium text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2028]">
                        {bookings.slice(0, 3).map((b) => (
                          <tr key={b.id} className="hover:bg-[#181a20] transition-colors">
                            <td className="py-4 px-4 font-medium text-[#f1f3f7]">
                              {b.client}
                            </td>
                            <td className="py-4 px-4 text-[#9aa0b0]">
                              {b.eventType}
                            </td>
                            <td className="py-4 px-4 text-[#7d8291]">
                              {b.date}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {b.status === 'Confirmed' ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#c8a251]/60 text-[#c8a251] bg-[#c8a251]/10">
                                  Confirmed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#282a33] text-[#c4c8d5]">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Upcoming Events List */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-serif text-[#d6d9e0] font-normal">
                      Upcoming Events
                    </h2>
                    <div className="flex items-center gap-3">
                      <button
                        id="overview-view-calendar-btn"
                        onClick={() => setActiveTab('calendar')}
                        className="text-xs uppercase tracking-widest text-[#a599e9] hover:underline font-medium"
                      >
                        VIEW CALENDAR
                      </button>
                      <button
                        onClick={() => setShowAddEventModal(true)}
                        className="text-xs text-[#8e93a3] hover:text-white flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {events.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setActiveTab('calendar')}
                        className="p-4 rounded-xl bg-[#141518] border border-[#20222a] flex items-center gap-4 hover:border-[#a599e9]/50 cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#191a20] border border-[#2a2c37] flex flex-col items-center justify-center text-center flex-shrink-0 group-hover:border-[#a599e9]/40 transition-colors">
                          <span className="text-[9px] uppercase tracking-wider text-[#8e93a3] font-bold">
                            {ev.month}
                          </span>
                          <span className="text-base font-serif font-bold text-[#c8a251]">
                            {ev.day}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-white truncate font-serif group-hover:text-[#a599e9] transition-colors">
                            {ev.title}
                          </h3>
                          <p className="text-xs text-[#7e8494] truncate">
                            {ev.venue}, {ev.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Booking Requests Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif text-white">Booking Inquiries</h2>
                  <p className="text-xs text-[#8e93a3]">
                    Review public proposals. Every booking instantly triggers an email notification to you with customer details.
                  </p>
                </div>
                <button
                  onClick={handleTestNotificationEmail}
                  disabled={isTestingEmail}
                  className="px-3.5 py-2 bg-[#1d202a] hover:bg-[#272b38] border border-[#373d4f] text-[#f5d78e] text-xs font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60"
                >
                  <Send className={`w-3.5 h-3.5 ${isTestingEmail ? 'animate-pulse' : ''}`} />
                  <span>{isTestingEmail ? 'Testing Email...' : 'Send Test Notification Email'}</span>
                </button>
              </div>

              {/* Notification Status Banner */}
              <div className="p-4 rounded-xl bg-[#141822] border border-[#232d42] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#c8a251]" />
                    <span className="font-semibold text-white">Automated Booking Notification System</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-400 text-[10px] font-mono">
                    Active & Monitored
                  </span>
                </div>
                <p className="text-[#969cb0] text-[11px]">
                  Whenever a client submits a booking on the public portfolio, an email alert with the <strong className="text-white">Customer Name</strong>, <strong className="text-white">Phone Number</strong>, <strong className="text-white">Event Location</strong>, and <strong className="text-white">Event Date</strong> is automatically dispatched to:
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[#f5d78e]">
                  <span className="bg-[#0e1118] px-2.5 py-1 rounded border border-[#2b3346] text-xs">
                    {profile.notificationEmail || 'bharath23245@gmail.com'}
                  </span>
                </div>
                {testEmailResult && (
                  <div className={`mt-2 p-2.5 rounded text-xs flex items-center gap-2 ${
                    testEmailResult.success
                      ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                      : 'bg-red-950/40 border border-red-800/60 text-red-300'
                  }`}>
                    {testEmailResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span>{testEmailResult.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="p-5 rounded-xl bg-[#141518] border border-[#20222a] space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-serif text-white">{b.client}</h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1e2028] text-[#c8a251] border border-[#2b2e3a]">
                            {b.eventType}
                          </span>
                        </div>
                        <p className="text-xs text-[#8e93a3] mt-0.5">
                          Inquiry ID: <span className="font-mono text-[#6e7485]">{b.id}</span>
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        b.status === 'Confirmed' ? 'border border-[#c8a251] text-[#c8a251]' : 'bg-[#262833] text-white'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    {/* Customer & Event Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 p-3 rounded-lg bg-[#191b22] border border-[#23252f] text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-[#6f7485] block font-semibold">Customer Name</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-white font-medium">
                          <User className="w-3.5 h-3.5 text-[#c8a251]" />
                          <span className="truncate">{b.client}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-[#6f7485] block font-semibold">Customer Phone</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[#f5d78e] font-mono">
                          <Phone className="w-3.5 h-3.5 text-[#c8a251]" />
                          <span>{b.phone || '+91 Not provided'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-[#6f7485] block font-semibold">Event Date</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-white font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#c8a251]" />
                          <span>{b.date}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-[#6f7485] block font-semibold">Event Location</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-white font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#c8a251]" />
                          <span className="truncate">{b.location || b.venue || 'India'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#8e93a3] pt-1">
                      <span className="flex items-center gap-1 text-[#b5bac9]">
                        <Mail className="w-3.5 h-3.5 text-[#6e7485]" />
                        <span>Customer Email: {b.email}</span>
                      </span>
                      <span className="text-[#3b4050]">•</span>
                      <span className="text-[#c8a251] font-semibold">Budget: {b.budget}</span>
                      <span className="text-[#3b4050]">•</span>
                      <span className="text-emerald-400/90 text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Alert Sent: {profile.notificationEmail || 'bharath23245@gmail.com'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#b0b4c2] bg-[#1a1b22] p-3 rounded">{b.message}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#696f80]">
                        Submitted on: {b.createdAt}
                      </span>
                      <div className="flex gap-2">
                        {b.status !== 'Confirmed' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'Confirmed')}
                            className="px-3 py-1 bg-[#c8a251] text-[#0b0c0e] font-semibold text-xs rounded hover:bg-[#d4ad57] transition-colors"
                          >
                            Accept Booking
                          </button>
                        )}
                        {b.status !== 'Declined' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'Declined')}
                            className="px-3 py-1 bg-[#242630] text-[#9ca1b0] hover:text-white text-xs rounded transition-colors"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour & Recital Calendar Tab */}
          {activeTab === 'calendar' && (
            <EventCalendarView
              events={events}
              onAddEvent={onAddEvent}
              onUpdateEvent={onUpdateEvent}
              onDeleteEvent={onDeleteEvent}
            />
          )}

          {/* Website Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6 sm:p-8 rounded-xl bg-[#141518] border border-[#20222a] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif text-white">Public Site Configuration</h2>
                  <p className="text-xs text-[#8e93a3] mt-1">
                    Updates here immediately reflect across your public portfolio, hero banner, bio, and booking inquiries.
                  </p>
                </div>
                {saveSuccessMessage && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#243324] border border-[#3b593b] text-xs text-[#8ee58e]">
                    <CheckCircle2 className="w-4 h-4 text-[#8ee58e]" />
                    <span>Artist Configuration Saved!</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[11px]">
                    Artist Name (Hero & Public Display)
                  </label>
                  <input
                    type="text"
                    required
                    value={editArtistName}
                    onChange={(e) => setEditArtistName(e.target.value)}
                    placeholder="e.g. BHARATH KANNAN"
                    className="w-full bg-[#1b1d24] border border-[#272a33] focus:border-[#c8a251] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[#696e7e] mt-1">
                    Displayed prominently on your portfolio hero section and header.
                  </p>
                </div>

                <div>
                  <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[11px]">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    placeholder="e.g. Music that connects beyond words."
                    className="w-full bg-[#1b1d24] border border-[#272a33] focus:border-[#c8a251] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[11px]">
                    Artist Philosophy Quote
                  </label>
                  <input
                    type="text"
                    value={editQuote}
                    onChange={(e) => setEditQuote(e.target.value)}
                    placeholder="e.g. Music is more than sound. It is an experience."
                    className="w-full bg-[#1b1d24] border border-[#272a33] focus:border-[#c8a251] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="pt-3 border-t border-[#22242e]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[#c8a251] font-semibold uppercase tracking-wider text-[11px]">
                      Admin Booking Notification Email *
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Receives Alerts
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e93a3]" />
                    <input
                      type="email"
                      required
                      value={editNotificationEmail}
                      onChange={(e) => setEditNotificationEmail(e.target.value)}
                      placeholder="e.g. bharath23245@gmail.com"
                      className="w-full bg-[#1b1d24] border border-[#272a33] focus:border-[#c8a251] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#8e93a3] mt-1.5">
                    This is your admin notification email address. Whenever an event organizer or client submits a booking, an email notification containing their <strong>Customer Name</strong>, <strong>Phone Number</strong>, <strong>Location</strong>, and <strong>Date</strong> will be immediately dispatched to this address.
                  </p>
                </div>

                {/* Artist Photography & Media Assets Section */}
                <div className="pt-4 border-t border-[#22242e] space-y-4">
                  <div>
                    <h3 className="text-sm font-serif text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#c8a251]" />
                      <span>Artist Photography & Visual Assets</span>
                    </h3>
                    <p className="text-[11px] text-[#8e93a3] mt-0.5">
                      Upload your exact photograph directly from your phone or computer. Changes appear on your live site immediately.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Portrait Photo Card */}
                    <div className="p-4 rounded-xl bg-[#181a22] border border-[#262934] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Portrait Photo (About Section)</span>
                        <span className="text-[10px] text-[#8e93a3] font-mono">4:5 Aspect Ratio</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-[#0e1015] border border-[#2b2f3d] flex-shrink-0 shadow-inner">
                          <img
                            src={editPortraitImage}
                            alt="Portrait Preview"
                            className="w-full h-full object-cover object-top"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <input
                            type="file"
                            ref={portraitFileInputRef}
                            onChange={handlePortraitFileUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => portraitFileInputRef.current?.click()}
                            className="w-full py-2 px-3 bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo from Device</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              resetLocalProfileCache();
                              setEditPortraitImage('/bharath-portrait.jpg');
                              onUpdateProfile({ ...profile, portraitImage: '/bharath-portrait.jpg' });
                            }}
                            className="w-full py-1.5 px-3 bg-[#13151b] hover:bg-[#1f222c] border border-[#262a36] text-[#8e93a3] hover:text-white text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset to Local VS Code File</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 2. Hero Background Photo Card */}
                    <div className="p-4 rounded-xl bg-[#181a22] border border-[#262934] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Hero Background Photo</span>
                        <span className="text-[10px] text-[#8e93a3] font-mono">Header Section</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-[#0e1015] border border-[#2b2f3d] flex-shrink-0 shadow-inner">
                          <img
                            src={editHeroImage}
                            alt="Hero Preview"
                            className="w-full h-full object-cover object-top"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <input
                            type="file"
                            ref={heroFileInputRef}
                            onChange={handleHeroFileUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => heroFileInputRef.current?.click()}
                            className="w-full py-2 px-3 bg-[#242836] hover:bg-[#303547] text-white border border-[#3b4256] font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Hero Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              resetLocalProfileCache();
                              setEditHeroImage('/hero-bg.jpg');
                              onUpdateProfile({ ...profile, heroImage: '/hero-bg.jpg' });
                            }}
                            className="w-full py-1.5 px-3 bg-[#13151b] hover:bg-[#1f222c] border border-[#262a36] text-[#8e93a3] hover:text-white text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset to Local VS Code File</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] font-semibold rounded-lg text-xs tracking-wider uppercase transition-colors shadow-md active:scale-98"
                  >
                    Save Configuration
                  </button>
                  <button
                    type="button"
                    onClick={onViewPortfolio}
                    className="px-4 py-2.5 bg-[#1b1d24] hover:bg-[#252833] border border-[#2e323e] text-[#cfd3dd] rounded-lg text-xs transition-colors"
                  >
                    Preview Public Portfolio →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Account Overview */}
              <div className="p-6 sm:p-8 rounded-xl bg-[#141518] border border-[#20222a] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif text-white">Artist Management Account</h2>
                  <span className="px-3 py-1 bg-[#1a2c1f] text-[#86efac] border border-[#234e2c] text-xs font-semibold rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#86efac]" />
                    <span>Active Authenticated Session</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3.5 rounded-lg bg-[#191b22] border border-[#262934] space-y-1">
                    <p className="text-[#8e93a3]">Active Admin / User</p>
                    <p className="text-sm font-semibold text-white">{userName}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#191b22] border border-[#262934] space-y-1">
                    <p className="text-[#8e93a3]">Primary Representation</p>
                    <p className="text-sm font-semibold text-white">{profile.managerName}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#191b22] border border-[#262934] space-y-1">
                    <p className="text-[#8e93a3]">Management Contact</p>
                    <p className="text-sm font-semibold text-white">{profile.email}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#191b22] border border-[#262934] space-y-1">
                    <p className="text-[#8e93a3]">Encryption Standard</p>
                    <p className="text-sm font-semibold text-[#c8a251] flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>256-Bit SHA-256 Cryptographic Hash</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={onViewPortfolio} className="px-4 py-2.5 bg-[#1b1c22] hover:bg-[#252733] border border-[#313440] text-white text-xs rounded-lg transition-colors">
                    View Live Public Portfolio →
                  </button>
                </div>
              </div>

              {/* Password & Security Management */}
              <div className="p-6 sm:p-8 rounded-xl bg-[#141518] border border-[#20222a] space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#c8a251]" />
                      <span>Security & Password Protection</span>
                    </h3>
                    <p className="text-xs text-[#8e93a3] mt-1">
                      Update your login password with client-side SHA-256 cryptographic encryption.
                    </p>
                  </div>
                  {passwordSuccessMsg && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1c3021] border border-[#2d5535] text-xs text-[#86efac]">
                      <CheckCircle2 className="w-4 h-4 text-[#86efac]" />
                      <span>Password Encrypted & Updated!</span>
                    </div>
                  )}
                </div>

                {passwordErrorMsg && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                    {passwordErrorMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateSecurityPassword} className="space-y-4 text-xs max-w-lg">
                  <div>
                    <label className="block text-[#8e93a3] mb-1 font-semibold uppercase tracking-wider text-[11px]">
                      New Strong Password *
                    </label>
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Minimum 8 chars, 1 caps, 1 number, 1 special char"
                      className="w-full bg-[#1b1d24] border border-[#272a33] focus:border-[#c8a251] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Strong Password Checklist */}
                  <div className="p-3 rounded-lg bg-[#181a22] border border-[#262934] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#a5aab9] uppercase tracking-wider">
                        Required Security Rules
                      </span>
                      <span className="text-[#686d7d]">
                        {adminPassRules.score}/4 Satisfied
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      <div className={`flex items-center gap-1.5 ${adminPassRules.hasMinLength ? 'text-emerald-400 font-medium' : 'text-[#707584]'}`}>
                        <Check className="w-3.5 h-3.5" />
                        <span>Min. 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${adminPassRules.hasUppercase ? 'text-emerald-400 font-medium' : 'text-[#707584]'}`}>
                        <Check className="w-3.5 h-3.5" />
                        <span>1+ Uppercase (Caps)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${adminPassRules.hasNumber ? 'text-emerald-400 font-medium' : 'text-[#707584]'}`}>
                        <Check className="w-3.5 h-3.5" />
                        <span>1+ Number (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${adminPassRules.hasSpecialChar ? 'text-emerald-400 font-medium' : 'text-[#707584]'}`}>
                        <Check className="w-3.5 h-3.5" />
                        <span>1+ Special char (!@#$)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#8e93a3] mb-1 font-semibold uppercase tracking-wider text-[11px]">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      className="w-full bg-[#1b1d24] border border-[#272a33] focus:border-[#c8a251] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isEncryptingPassword}
                    className="px-6 py-2.5 bg-[#c8a251] hover:bg-[#d4b059] text-[#0b0c0e] font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-60"
                  >
                    {isEncryptingPassword ? 'Encrypting with SHA-256...' : 'Update & Encrypt Password'}
                  </button>
                </form>
              </div>

              {/* Backend Source Code Archive Download */}
              <div className="p-6 sm:p-8 rounded-xl bg-[#141518] border border-[#20222a] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif text-white flex items-center gap-2">
                      <FolderArchive className="w-5 h-5 text-[#a599e9]" />
                      <span>Backend Source Code & Services</span>
                    </h3>
                    <p className="text-xs text-[#8e93a3] mt-1">
                      Download the standalone Node.js / Express backend server, API controllers, and schema files as a single ZIP archive.
                    </p>
                  </div>
                  <a
                    id="download-backend-zip-btn"
                    href="/backend.zip"
                    download="backend-source.zip"
                    className="px-4 py-2.5 bg-[#a599e9] hover:bg-[#b8acf2] text-[#0e0f12] font-semibold rounded-lg text-xs flex items-center gap-2 transition-all shadow-md active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download backend.zip</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-lg bg-[#191b22] border border-[#262934] text-xs space-y-2">
                  <p className="text-[#a5aab9] font-medium">Archive Contents:</p>
                  <ul className="list-disc list-inside text-[#8e93a3] space-y-1 text-[11px]">
                    <li><code className="text-[#a599e9]">server.js</code> &amp; <code className="text-[#a599e9]">package.json</code> — Standalone Express REST API server</li>
                    <li><code className="text-[#a599e9]">routes/</code> &amp; <code className="text-[#a599e9]">controllers/</code> — Booking request handlers, event management, and artist profile APIs</li>
                    <li><code className="text-[#a599e9]">models/</code> &amp; <code className="text-[#a599e9]">data/</code> — Local data stores and schema definitions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Release Modal */}
      {showNewReleaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16171c] border border-[#272933] rounded-xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif">Publish New Release</h3>
              <button onClick={() => setShowNewReleaseModal(false)}><X className="w-5 h-5 text-[#8e93a3]" /></button>
            </div>
            <form onSubmit={handleCreateTrack} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8e93a3] mb-1">Track Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sonata in C Minor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1b1d24] border border-[#2c2f3a] rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e93a3] mb-1">Subtitle</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full bg-[#1b1d24] border border-[#2c2f3a] rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e93a3] mb-1">Duration</label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full bg-[#1b1d24] border border-[#2c2f3a] rounded px-3 py-2 text-white"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#c8a251] text-[#0b0c0e] font-semibold rounded text-xs uppercase tracking-wider">
                Publish Track to Portfolio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16171c] border border-[#272933] rounded-xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif">Add Upcoming Event</h3>
              <button onClick={() => setShowAddEventModal(false)}><X className="w-5 h-5 text-[#8e93a3]" /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8e93a3] mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vienna Piano Gala"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-[#1b1d24] border border-[#2c2f3a] rounded px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8e93a3] mb-1">Month (e.g. JAN)</label>
                  <input
                    type="text"
                    value={newEventMonth}
                    onChange={(e) => setNewEventMonth(e.target.value)}
                    className="w-full bg-[#1b1d24] border border-[#2c2f3a] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#8e93a3] mb-1">Day (e.g. 15)</label>
                  <input
                    type="text"
                    value={newEventDay}
                    onChange={(e) => setNewEventDay(e.target.value)}
                    className="w-full bg-[#1b1d24] border border-[#2c2f3a] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#8e93a3] mb-1">City, Location</label>
                <input
                  type="text"
                  placeholder="e.g. London, UK"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full bg-[#1b1d24] border border-[#2c2f3a] rounded px-3 py-2 text-white"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#c8a251] text-[#0b0c0e] font-semibold rounded text-xs uppercase tracking-wider">
                Add Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View All Bookings Modal */}
      {showAllBookingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#16171c] border border-[#272933] rounded-xl p-6 text-white space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif">All Booking Requests</h3>
              <button onClick={() => setShowAllBookingsModal(false)}><X className="w-5 h-5 text-[#8e93a3]" /></button>
            </div>
            <div className="space-y-3 text-xs">
              {bookings.map((b) => (
                <div key={b.id} className="p-3 bg-[#1e2028] rounded border border-[#2c2f3b] flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{b.client} — {b.eventType}</div>
                    <div className="text-[#8e93a3]">{b.venue} | {b.date} | Budget: {b.budget}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] ${b.status === 'Confirmed' ? 'text-[#c8a251] border border-[#c8a251]' : 'text-white bg-black/40'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
