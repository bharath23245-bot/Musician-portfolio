import React from 'react';
import { Track } from '../types';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, VolumeX, Music } from 'lucide-react';

interface AudioPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  artistName?: string;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onClose: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  artistName = 'Maestro',
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onClose,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
}) => {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="global-audio-player-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e0f12]/95 backdrop-blur-lg border-t border-[#202228] px-4 md:px-8 py-3.5 text-[#e5e7eb] shadow-2xl transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Album Artwork + Track Information */}
        <div className="flex items-center gap-3.5 min-w-[180px] max-w-[280px]">
          <div className="relative w-11 h-11 rounded bg-[#1b1c20] border border-[#2b2d35] overflow-hidden flex-shrink-0">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#c8a251]">
                <Music className="w-5 h-5" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#c8a251] animate-ping"></span>
              </div>
            )}
          </div>

          <div className="overflow-hidden">
            <h4 className="text-sm font-medium text-[#f3f4f6] truncate font-serif">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-[#8f94a3] truncate">
              {currentTrack.subtitle || artistName}
            </p>
          </div>
        </div>

        {/* Center: Controls + Scrubber Bar */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          {/* Main Control Buttons */}
          <div className="flex items-center gap-5">
            <button
              id="audio-prev-btn"
              onClick={onPrevTrack}
              aria-label="Previous Track"
              className="text-[#9ca3af] hover:text-[#f3f4f6] transition-colors p-1"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              id="audio-play-pause-btn"
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-9 h-9 rounded-full bg-[#1b1c22] border border-[#3b3e48] hover:border-[#c8a251] text-[#f3f4f6] hover:text-[#c8a251] flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              id="audio-next-btn"
              onClick={onNextTrack}
              aria-label="Next Track"
              className="text-[#9ca3af] hover:text-[#f3f4f6] transition-colors p-1"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="w-full flex items-center gap-2.5 text-[11px] text-[#787d8a]">
            <span className="w-8 text-right font-mono">{formatTime(currentTime)}</span>
            
            <div
              className="relative flex-1 h-1.5 bg-[#23252d] rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                onSeek(ratio * duration);
              }}
            >
              <div
                className="h-full bg-[#c8a251] rounded-full transition-all relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#f5e6c8] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"></div>
              </div>
            </div>

            <span className="w-8 font-mono">{formatTime(duration || currentTrack.durationSec)}</span>
          </div>
        </div>

        {/* Right: Volume & Close */}
        <div className="flex items-center gap-3.5 min-w-[120px] justify-end">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
              className="text-[#8f94a3] hover:text-white transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-[#24262f] accent-[#c8a251] cursor-pointer rounded-lg"
            />
          </div>

          <button
            id="audio-close-btn"
            onClick={onClose}
            aria-label="Close Audio Player"
            className="text-[#787d8a] hover:text-[#f3f4f6] p-1.5 rounded-md hover:bg-[#1f2026] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
