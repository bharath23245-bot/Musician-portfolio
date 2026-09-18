import React from 'react';
import { ScreenMode } from '../types';
import { Globe, Lock, LayoutDashboard, Music2, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationSwitcherProps {
  currentScreen: ScreenMode;
  onScreenChange: (screen: ScreenMode) => void;
  isPlaying: boolean;
  currentTrackTitle?: string;
}

export const NavigationSwitcher: React.FC<NavigationSwitcherProps> = ({
  currentScreen,
  onScreenChange,
  isPlaying,
  currentTrackTitle,
}) => {
  const { user, userName, signOut } = useAuth();

  const handleDashboardClick = () => {
    if (!user) {
      // Route protection: redirect to login if unauthenticated
      onScreenChange('login');
    } else {
      onScreenChange('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f1013]/95 backdrop-blur-md border-b border-[#22242a] px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: App Screen Selector Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1b1c20] border border-[#2b2d35] text-[#d6d9e0]">
            <Sparkles className="w-3.5 h-3.5 text-[#c8a251]" />
            <span className="font-semibold tracking-wider text-[11px] text-[#c8a251]">BHARATH KANNAN</span>
            <span className="text-[#6d717e]">|</span>
            <span className="text-[#a0a4b0] hidden sm:inline">Portal:</span>
          </div>

          {/* Portal tabs: easy switcher between Public Portfolio and Admin Portal */}
          <nav className="flex items-center p-0.5 rounded-lg bg-[#141518] border border-[#24262c]">
            <button
              id="switch-to-portfolio-btn"
              onClick={() => onScreenChange('portfolio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                currentScreen === 'portfolio'
                  ? 'bg-[#c8a251] text-[#0b0c0e] shadow-sm font-semibold'
                  : 'text-[#9ba0ad] hover:text-white hover:bg-[#1f2026]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Portfolio</span>
            </button>

            <button
              id="switch-to-admin-btn"
              onClick={handleDashboardClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                currentScreen === 'dashboard' || currentScreen === 'login'
                  ? 'bg-[#c8a251] text-[#0b0c0e] shadow-sm font-semibold'
                  : 'text-[#9ba0ad] hover:text-white hover:bg-[#1f2026]'
              }`}
            >
              {user ? (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Authenticated" />
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </>
              )}
            </button>
          </nav>
        </div>

        {/* Right: Audio Indicator & Auth Status */}
        <div className="flex items-center gap-3">
          {isPlaying && currentTrackTitle && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1b1c20] border border-[#c8a251]/30 text-[#c8a251]">
              <Music2 className="w-3.5 h-3.5 animate-pulse" />
              <span className="truncate max-w-[140px] text-[11px] font-medium">{currentTrackTitle}</span>
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-0.5 h-full bg-[#c8a251] animate-bounce"></span>
                <span className="w-0.5 h-2/3 bg-[#c8a251] animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-0.5 h-4/5 bg-[#c8a251] animate-bounce [animation-delay:0.3s]"></span>
              </span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#272933]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#c5c9d6]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium hidden sm:inline">{userName}</span>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  onScreenChange('portfolio');
                }}
                className="px-2 py-1 rounded bg-[#1c1d24] hover:bg-red-950/50 hover:text-red-300 text-[#8e93a3] border border-[#2b2d38] flex items-center gap-1 text-[11px] transition-colors"
                title="Secure Sign Out"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-[#717684] hidden lg:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c8a251]" />
              <span>Firebase Security Enforced</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
