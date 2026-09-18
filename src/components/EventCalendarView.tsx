import React, { useState, useMemo, useEffect } from 'react';
import { UpcomingEvent } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Ticket,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  RefreshCw,
  Eye,
  CalendarCheck2,
  Building2,
  Filter
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface EventCalendarViewProps {
  events: UpcomingEvent[];
  onAddEvent: (event: UpcomingEvent) => void;
  onUpdateEvent?: (event: UpcomingEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onRefreshEvents?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBRS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to parse event date and match with calendar year, month, day
function parseEventDate(event: UpcomingEvent): { year: number; month: number; day: number } | null {
  // Check fullDate string e.g. "November 12, 2024" or "February 18, 2025" or "OCT 15, 2025"
  if (event.fullDate) {
    const parsed = new Date(event.fullDate);
    if (!isNaN(parsed.getTime())) {
      return {
        year: parsed.getFullYear(),
        month: parsed.getMonth(),
        day: parsed.getDate(),
      };
    }
  }

  // Fallback: parse month abbreviation and day
  let mIndex = MONTH_ABBRS.findIndex((m) => m === event.month?.toUpperCase());
  if (mIndex === -1) {
    mIndex = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase().startsWith(event.month?.toLowerCase() || '')
    );
  }
  const dayNum = parseInt(event.day, 10);

  // Check if year is present anywhere in fullDate
  let year = 2025;
  if (event.fullDate) {
    const yearMatch = event.fullDate.match(/\b(202[3-9]|203[0-9])\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }
  }

  if (mIndex !== -1 && !isNaN(dayNum)) {
    return { year, month: mIndex, day: dayNum };
  }

  return null;
}

export const EventCalendarView: React.FC<EventCalendarViewProps> = ({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onRefreshEvents,
}) => {
  // Calendar Navigation State
  // Default to the month of the first upcoming event if available, else current date
  const [currentDate, setCurrentDate] = useState(() => {
    if (events.length > 0) {
      const firstEv = parseEventDate(events[0]);
      if (firstEv) return new Date(firstEv.year, firstEv.month, 1);
    }
    return new Date();
  });

  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected date / event modal states
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [activeEditingEvent, setActiveEditingEvent] = useState<UpcomingEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const { daysInMonth, startingDayOfWeek, prevMonthDays } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    return {
      daysInMonth: totalDays,
      startingDayOfWeek: firstDay,
      prevMonthDays: daysInPrevMonth,
    };
  }, [year, month]);

  // Map events to day keys "YYYY-M-D"
  const eventsByDayKey = useMemo(() => {
    const map = new Map<string, UpcomingEvent[]>();
    events.forEach((ev) => {
      const parsed = parseEventDate(ev);
      if (parsed) {
        const key = `${parsed.year}-${parsed.month}-${parsed.day}`;
        const existing = map.get(key) || [];
        existing.push(ev);
        map.set(key, existing);
      }
    });
    return map;
  }, [events]);

  // Filtered events for list / agenda view
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesStatus = statusFilter === 'All' || ev.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        ev.fullDate.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [events, statusFilter, searchQuery]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshEvents) {
      onRefreshEvents();
    } else {
      try {
        await apiService.getEvents();
      } catch (err) {
        console.error('Failed to reload events:', err);
      }
    }
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage({ type: 'success', text: 'Events synchronized with backend.' });
    }, 600);
  };

  // Click on date cell
  const handleDayClick = (dayNumber: number) => {
    const key = `${year}-${month}-${dayNumber}`;
    setSelectedDateKey(key);
    const dayEvents = eventsByDayKey.get(key);
    if (dayEvents && dayEvents.length > 0) {
      // Open editor for the first event on this day
      setActiveEditingEvent(dayEvents[0]);
    } else {
      // No event on this date -> prompt to add one
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      setPrefilledDate(dateStr);
      setShowAddModal(true);
    }
  };

  // Save event edit
  const handleSaveEdit = (updatedEvent: UpcomingEvent) => {
    if (onUpdateEvent) {
      onUpdateEvent(updatedEvent);
    }
    setActiveEditingEvent(null);
    setToastMessage({ type: 'success', text: `"${updatedEvent.title}" updated successfully.` });
  };

  // Delete event
  const handleDelete = (eventId: string, title: string) => {
    if (onDeleteEvent) {
      onDeleteEvent(eventId);
    }
    setDeleteConfirmId(null);
    setActiveEditingEvent(null);
    setToastMessage({ type: 'success', text: `Event "${title}" has been deleted.` });
  };

  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div id="event-calendar-container" className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium border shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === 'success'
              ? 'bg-[#152319] border-[#2d5939] text-[#7ee79d]'
              : 'bg-[#2b1819] border-[#6b2c2f] text-[#f28b82]'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#7ee79d] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#f28b82] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-80 text-current"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#141518] border border-[#20222a]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#a599e9]/10 border border-[#a599e9]/20 flex items-center justify-center text-[#a599e9]">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-white font-normal flex items-center gap-2">
                Tour & Recital Calendar
              </h2>
              <p className="text-xs text-[#8e93a3] mt-0.5">
                Click any calendar date or event card to view, edit, or remove scheduled performances.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-[#1b1d24] p-1 rounded-lg border border-[#262833] flex items-center text-xs">
            <button
              id="calendar-view-mode-btn"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#a599e9] text-[#0e0f12] shadow-sm'
                  : 'text-[#8e93a3] hover:text-white'
              }`}
            >
              Calendar Grid
            </button>
            <button
              id="agenda-view-mode-btn"
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'agenda'
                  ? 'bg-[#a599e9] text-[#0e0f12] shadow-sm'
                  : 'text-[#8e93a3] hover:text-white'
              }`}
            >
              Schedule List ({events.length})
            </button>
          </div>

          {/* Sync / Refresh */}
          <button
            id="refresh-calendar-events-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh events from server"
            className="p-2 bg-[#1b1d24] hover:bg-[#252833] border border-[#262833] text-[#a599e9] rounded-lg text-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Event Button */}
          <button
            id="add-event-toolbar-btn"
            onClick={() => {
              setPrefilledDate(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#686d7e] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {['All', 'Upcoming', 'Sold Out', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[#2b2738] text-[#a599e9] border border-[#a599e9]/40'
                  : 'bg-[#141518] text-[#8e93a3] hover:text-white border border-[#20222a]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#636877]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue, city, piece..."
            className="w-full bg-[#141518] border border-[#20222a] focus:border-[#a599e9] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#636877] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#636877] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main View: Calendar or Agenda */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid Card (8 cols) */}
          <div className="lg:col-span-8 rounded-xl bg-[#141518] border border-[#20222a] overflow-hidden shadow-xl">
            {/* Month & Year Navigation Header */}
            <div className="p-4 sm:p-5 border-b border-[#20222a] bg-[#101114] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  id="calendar-prev-month-btn"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-[#181a20] hover:bg-[#232630] border border-[#262933] text-[#c4c8d5] hover:text-white transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="calendar-next-month-btn"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-[#181a20] hover:bg-[#232630] border border-[#262933] text-[#c4c8d5] hover:text-white transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-base sm:text-lg font-serif text-white font-medium ml-2">
                  {MONTH_NAMES[month]} {year}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="calendar-today-btn"
                  onClick={handleGoToToday}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#181a20] hover:bg-[#232630] border border-[#262933] text-[#a599e9] transition-colors"
                >
                  Current Month
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 border-b border-[#20222a] bg-[#121317] text-center text-[11px] uppercase tracking-wider font-medium text-[#737887] py-2.5">
              {WEEKDAYS.map((w) => (
                <div key={w} className="px-1">
                  {w}
                </div>
              ))}
            </div>

            {/* Day Cells Matrix */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#1c1e26] bg-[#141518]">
              {/* Previous Month Inactive Days */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => {
                const prevDayNum = prevMonthDays - startingDayOfWeek + i + 1;
                return (
                  <div
                    key={`prev-${i}`}
                    className="min-h-[85px] sm:min-h-[105px] p-2 bg-[#0e0f13]/40 text-[#404452] select-none"
                  >
                    <span className="text-xs font-medium">{prevDayNum}</span>
                  </div>
                );
              })}

              {/* Current Month Active Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${month}-${dayNum}`;
                const dayEvents = eventsByDayKey.get(dateKey) || [];
                const isToday = isCurrentMonthToday && today.getDate() === dayNum;
                const isSelected = selectedDateKey === dateKey;

                return (
                  <div
                    key={`day-${dayNum}`}
                    id={`calendar-day-${dayNum}`}
                    onClick={() => handleDayClick(dayNum)}
                    className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 cursor-pointer transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-[#222030] ring-1 ring-inset ring-[#a599e9]'
                        : dayEvents.length > 0
                        ? 'bg-[#16181f] hover:bg-[#1d1f29]'
                        : 'hover:bg-[#181a21]'
                    }`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          isToday
                            ? 'bg-[#a599e9] text-[#0e0f12] font-bold shadow-sm'
                            : 'text-[#c2c6d4] group-hover:text-white'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#a599e9]/20 text-[#a599e9] border border-[#a599e9]/30">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Event indicators / chips inside cell */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <button
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEditingEvent(ev);
                          }}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate block font-medium transition-all ${
                            ev.status === 'Sold Out'
                              ? 'bg-[#e89895]/20 text-[#f29a96] border border-[#e89895]/30'
                              : ev.status === 'Completed'
                              ? 'bg-[#20222a] text-[#8e93a3] border border-[#2b2e3a]'
                              : 'bg-[#a599e9]/15 text-[#cec7f7] border border-[#a599e9]/30 hover:bg-[#a599e9]/30'
                          }`}
                          title={`${ev.title} (${ev.venue}, ${ev.location})`}
                        >
                          {ev.title}
                        </button>
                      ))}

                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-[#8e93a3] block px-1">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Empty Day Hover Hint */}
                    {dayEvents.length === 0 && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#696f80] flex items-center gap-0.5 pt-1">
                        <Plus className="w-2.5 h-2.5" />
                        <span>Schedule</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Trailing Next Month Days to Complete 7-column Grid */}
              {(() => {
                const totalCells = startingDayOfWeek + daysInMonth;
                const remainingCells = (7 - (totalCells % 7)) % 7;
                return Array.from({ length: remainingCells }).map((_, i) => (
                  <div
                    key={`next-${i}`}
                    className="min-h-[85px] sm:min-h-[105px] p-2 bg-[#0e0f13]/40 text-[#404452] select-none"
                  >
                    <span className="text-xs font-medium">{i + 1}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Right Sidebar: Selected Day & Month Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Stats Panel */}
            <div className="p-5 rounded-xl bg-[#141518] border border-[#20222a] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif text-white font-medium">Month Summary</h3>
                <span className="text-[11px] text-[#a599e9] font-mono">
                  {MONTH_ABBRS[month]} {year}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-lg bg-[#1a1c22] border border-[#262832]">
                  <span className="text-lg font-serif font-bold text-white block">
                    {
                      events.filter((e) => {
                        const p = parseEventDate(e);
                        return p && p.year === year && p.month === month;
                      }).length
                    }
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#737887]">Total</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1c22] border border-[#262832]">
                  <span className="text-lg font-serif font-bold text-[#a599e9] block">
                    {
                      events.filter((e) => {
                        const p = parseEventDate(e);
                        return p && p.year === year && p.month === month && e.status === 'Upcoming';
                      }).length
                    }
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#737887]">Upcoming</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1c22] border border-[#262832]">
                  <span className="text-lg font-serif font-bold text-[#e89895] block">
                    {
                      events.filter((e) => {
                        const p = parseEventDate(e);
                        return p && p.year === year && p.month === month && e.status === 'Sold Out';
                      }).length
                    }
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#737887]">Sold Out</span>
                </div>
              </div>
            </div>

            {/* Upcoming Performances Agenda on Selected Month */}
            <div className="p-5 rounded-xl bg-[#141518] border border-[#20222a] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif text-white font-medium">
                  Performances in {MONTH_NAMES[month]}
                </h3>
                <span className="text-[11px] text-[#737887]">
                  {
                    events.filter((e) => {
                      const p = parseEventDate(e);
                      return p && p.year === year && p.month === month;
                    }).length
                  }{' '}
                  shows
                </span>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {events
                  .filter((e) => {
                    const p = parseEventDate(e);
                    return p && p.year === year && p.month === month;
                  })
                  .map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setActiveEditingEvent(ev)}
                      className="p-3.5 rounded-lg bg-[#191b22] border border-[#232631] hover:border-[#a599e9]/50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#a599e9] font-medium">
                            {ev.month} {ev.day} • {ev.time || '8:00 PM'}
                          </span>
                          <h4 className="text-xs font-serif text-white font-medium mt-0.5 group-hover:text-[#a599e9] transition-colors line-clamp-1">
                            {ev.title}
                          </h4>
                          <p className="text-[11px] text-[#8e93a3] flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3 h-3 text-[#646877] shrink-0" />
                            <span>{ev.venue}, {ev.location}</span>
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap shrink-0 ${
                            ev.status === 'Sold Out'
                              ? 'bg-[#e89895]/20 text-[#f29a96]'
                              : ev.status === 'Completed'
                              ? 'bg-[#262833] text-[#8e93a3]'
                              : 'bg-[#a599e9]/15 text-[#a599e9]'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>

                      {/* Quick Edit / Delete row on hover */}
                      <div className="mt-2.5 pt-2 border-t border-[#232530] flex items-center justify-between text-[11px] text-[#8e93a3]">
                        <span className="flex items-center gap-1 text-[#a599e9] hover:underline">
                          <Edit2 className="w-3 h-3" /> Click to Edit
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(ev.id);
                          }}
                          className="text-[#e89895] hover:text-[#f27470] flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                {events.filter((e) => {
                  const p = parseEventDate(e);
                  return p && p.year === year && p.month === month;
                }).length === 0 && (
                  <div className="text-center py-8 text-xs text-[#6e7485] space-y-2">
                    <CalendarIcon className="w-8 h-8 mx-auto opacity-30 text-[#a599e9]" />
                    <p>No performances scheduled for {MONTH_NAMES[month]} {year}.</p>
                    <button
                      onClick={() => {
                        const pre = `${year}-${String(month + 1).padStart(2, '0')}-15`;
                        setPrefilledDate(pre);
                        setShowAddModal(true);
                      }}
                      className="text-xs text-[#a599e9] hover:underline font-medium inline-block"
                    >
                      + Schedule an event for this month
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 4. Alternative Agenda / Schedule List View */
        <div className="rounded-xl bg-[#141518] border border-[#20222a] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#20222a] bg-[#101114] flex items-center justify-between">
            <h3 className="text-sm font-serif text-white font-medium">
              Complete Tour Schedule & Masterclasses ({filteredEvents.length} matches)
            </h3>
            <span className="text-xs text-[#8e93a3]">
              Showing {statusFilter} events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#20222a] bg-[#121317] text-[#787d8d] text-[11px] uppercase tracking-wider font-medium">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Performance Title</th>
                  <th className="py-3 px-4">Venue & City</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d2028]">
                {filteredEvents.map((ev) => (
                  <tr
                    key={ev.id}
                    onClick={() => setActiveEditingEvent(ev)}
                    className="hover:bg-[#181a21] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-10 text-center py-1 rounded bg-[#1f212a] border border-[#292c38]">
                          <span className="text-[10px] font-mono text-[#a599e9] font-bold block leading-none">
                            {ev.month}
                          </span>
                          <span className="text-sm font-serif font-bold text-white block mt-0.5 leading-none">
                            {ev.day}
                          </span>
                        </div>
                        <span className="text-xs text-[#9ea3b3] hidden sm:inline">
                          {ev.fullDate}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-white max-w-xs truncate">
                      {ev.title}
                    </td>
                    <td className="py-4 px-4 text-[#8e93a3]">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#5e6373] shrink-0" />
                        <span>{ev.venue}, {ev.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#8e93a3] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#5e6373]" />
                        <span>{ev.time || '8:00 PM IST'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          ev.status === 'Sold Out'
                            ? 'bg-[#e89895]/20 text-[#f29a96] border border-[#e89895]/30'
                            : ev.status === 'Completed'
                            ? 'bg-[#20222a] text-[#8e93a3] border border-[#2b2e3a]'
                            : 'bg-[#a599e9]/15 text-[#cec7f7] border border-[#a599e9]/30'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveEditingEvent(ev)}
                          className="p-1.5 rounded hover:bg-[#252833] text-[#a599e9] transition-colors"
                          title="Edit event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(ev.id)}
                          className="p-1.5 rounded hover:bg-[#2e1d20] text-[#e89895] transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#707585]">
                      No events matching "{searchQuery || statusFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Edit Event Modal (Triggered by clicking event card or date cell) */}
      {activeEditingEvent && (
        <EditEventModal
          event={activeEditingEvent}
          isOpen={true}
          onClose={() => setActiveEditingEvent(null)}
          onSave={handleSaveEdit}
          onDelete={(id) => handleDelete(id, activeEditingEvent.title)}
        />
      )}

      {/* 6. Add New Event Modal */}
      {showAddModal && (
        <AddEventModal
          isOpen={showAddModal}
          initialDate={prefilledDate}
          onClose={() => setShowAddModal(false)}
          onAdd={(newEvent) => {
            onAddEvent(newEvent);
            setShowAddModal(false);
            setToastMessage({ type: 'success', text: `Event "${newEvent.title}" scheduled successfully!` });
          }}
        />
      )}

      {/* 7. Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-[#16171b] border border-[#2b2e38] p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-[#3d1a1d] text-[#e89895] flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-serif text-white font-medium">Delete Event?</h3>
              <p className="text-xs text-[#8e93a3]">
                Are you sure you want to permanently remove this concert from the tour calendar? This will also update the public portfolio.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-[#20222a] hover:bg-[#2a2d38] text-[#c4c8d5] rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const ev = events.find((e) => e.id === deleteConfirmId);
                  handleDelete(deleteConfirmId, ev?.title || 'Concert');
                }}
                className="flex-1 py-2.5 bg-[#e89895] hover:bg-[#f27470] text-[#0b0c0e] font-semibold rounded-lg text-xs transition-colors shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// Modal Component: Edit Event Directly from Calendar UI
// =========================================================================
interface EditEventModalProps {
  event: UpcomingEvent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UpcomingEvent) => void;
  onDelete: (id: string) => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(event.title);
  const [venue, setVenue] = useState(event.venue);
  const [location, setLocation] = useState(event.location);
  const [month, setMonth] = useState(event.month);
  const [day, setDay] = useState(event.day);
  const [fullDate, setFullDate] = useState(event.fullDate);
  const [time, setTime] = useState(event.time || '8:00 PM IST');
  const [status, setStatus] = useState<'Upcoming' | 'Sold Out' | 'Completed'>(event.status);
  const [ticketUrl, setTicketUrl] = useState(event.ticketUrl || '#');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim() || !location.trim()) return;

    onSave({
      ...event,
      title: title.trim(),
      venue: venue.trim(),
      location: location.trim(),
      month: month.trim().toUpperCase(),
      day: day.trim(),
      fullDate: fullDate.trim() || `${month.toUpperCase()} ${day}, 2025`,
      time: time.trim(),
      status,
      ticketUrl: ticketUrl.trim() || '#',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-xl bg-[#141518] border border-[#20222a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#20222a] bg-[#101114] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#a599e9]/10 border border-[#a599e9]/20 flex items-center justify-center text-[#a599e9]">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif text-white font-medium">Edit Event Details</h3>
              <p className="text-[11px] text-[#8e93a3]">Modify performance details or delete from calendar.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e93a3] hover:text-white hover:bg-[#1f2129] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Title */}
          <div>
            <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
              Performance Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Symphony Hall Solo Recital: Rachmaninoff & Original Works"
              className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Venue & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Concert Venue *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. NCPA, Tata Theatre"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                City / Country *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, India"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Month, Day & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Month (3 letters)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={month}
                onChange={(e) => setMonth(e.target.value.toUpperCase())}
                placeholder="e.g. NOV"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Day (1-31)
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="e.g. 12"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Concert Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 7:30 PM IST"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Full Date String & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Full Display Date
              </label>
              <input
                type="text"
                value={fullDate}
                onChange={(e) => setFullDate(e.target.value)}
                placeholder="e.g. November 12, 2024"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Ticket / Show Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Upcoming' | 'Sold Out' | 'Completed')}
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              >
                <option value="Upcoming">Upcoming (Active Tickets)</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Ticket URL */}
          <div>
            <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
              Box Office / Ticket URL
            </label>
            <input
              type="text"
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
              placeholder="e.g. https://in.bookmyshow.com/..."
              className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#a599e9] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#20222a] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              className="px-3.5 py-2 rounded-lg bg-[#2e1d20] hover:bg-[#3d2024] text-[#e89895] border border-[#6b2c2f] font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Event</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1b1d24] hover:bg-[#252833] text-[#8e93a3] rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#a599e9] hover:bg-[#b8acf2] text-[#0e0f12] font-semibold rounded-lg text-xs transition-colors shadow-md active:scale-98"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// Modal Component: Schedule New Event for a Calendar Date
// =========================================================================
interface AddEventModalProps {
  isOpen: boolean;
  initialDate: string | null;
  onClose: () => void;
  onAdd: (event: UpcomingEvent) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  initialDate,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('8:00 PM IST');
  const [status, setStatus] = useState<'Upcoming' | 'Sold Out' | 'Completed'>('Upcoming');
  const [ticketUrl, setTicketUrl] = useState('#');

  // Parse initial date (e.g. "2025-02-18")
  const [month, setMonth] = useState(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) return MONTH_ABBRS[d.getMonth()];
    }
    return 'FEB';
  });

  const [day, setDay] = useState(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) return String(d.getDate());
    }
    return '18';
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim() || !location.trim()) return;

    const fullDate = `${month} ${day}, 2025`;

    const newEvent: UpcomingEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      venue: venue.trim(),
      location: location.trim(),
      month: month.trim().toUpperCase(),
      day: day.trim(),
      fullDate,
      time: time.trim(),
      status,
      ticketUrl: ticketUrl.trim() || '#',
    };

    onAdd(newEvent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-xl bg-[#141518] border border-[#20222a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#20222a] bg-[#101114] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c8a251]/10 border border-[#c8a251]/20 flex items-center justify-center text-[#c8a251]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif text-white font-medium">Schedule New Performance</h3>
              <p className="text-[11px] text-[#8e93a3]">Add a recital, gala, or tour date to the official calendar.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e93a3] hover:text-white hover:bg-[#1f2129] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autumn Piano Quintet: Chopin & Brahms"
              className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#c8a251] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Concert Venue *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Royal Opera House"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#c8a251] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                City / Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, India"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#c8a251] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Month (3 letters)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={month}
                onChange={(e) => setMonth(e.target.value.toUpperCase())}
                placeholder="FEB"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#c8a251] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Day (1-31)
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="18"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#c8a251] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="8:00 PM IST"
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#c8a251] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Ticket Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Upcoming' | 'Sold Out' | 'Completed')}
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#c8a251] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              >
                <option value="Upcoming">Upcoming (Active Tickets)</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-[#8e93a3] font-medium mb-1 uppercase tracking-wider text-[10px]">
                Box Office Link
              </label>
              <input
                type="text"
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#1b1d24] border border-[#262832] focus:border-[#c8a251] rounded-lg px-3.5 py-2 text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#20222a] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1b1d24] hover:bg-[#252833] text-[#8e93a3] rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#c8a251] hover:bg-[#d6b25f] text-[#0b0c0e] font-semibold rounded-lg text-xs transition-colors shadow-md active:scale-98"
            >
              Add to Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
