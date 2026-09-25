import React from 'react';
import { ViewTab } from '../types';
import { LotusIcon } from './FolkArtMotifs';
import { Volume2, VolumeX, HelpCircle, Settings, Play, BookOpen, Compass, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  soundEnabled,
  onToggleSound,
  onOpenHelp,
  onOpenSettings,
}) => {
  const navItems: { tab: ViewTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'HOME', label: 'Home', icon: <LotusIcon size={16} color="#D8401F" /> },
    { tab: 'ABOUT', label: 'About', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { tab: 'HISTORY', label: 'History', icon: <Compass className="w-3.5 h-3.5" /> },
    { tab: 'FACTS', label: 'Facts', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { tab: 'HOW_TO_PLAY', label: 'Rules', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { tab: 'TUTORIAL', label: 'Tutorial', icon: <Sparkles className="w-3.5 h-3.5 text-[#EFA90C]" /> },
    { tab: 'MODE_SELECT', label: 'Play Game', icon: <Play className="w-3.5 h-3.5 fill-current" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#EFDFB8] border-b-[3px] border-[#5C140F]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo & Telugu subtitle */}
        <button
          onClick={() => onNavigate('HOME')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#F6ECD2] border-[2px] border-[#5C140F] flex items-center justify-center transition-transform group-hover:scale-105">
            <LotusIcon size={24} color="#D8401F" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-fraunces font-extrabold text-lg sm:text-xl text-[#5C140F] tracking-tight leading-none">
                DAADI AATA
              </span>
              <span className="font-telugu text-sm sm:text-base font-bold text-[#D8401F] leading-none">
                దాడి ఆట
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#6B4E3D] uppercase tracking-wider block">
              Traditional Indian Strategy
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#F6ECD2] border-[2px] border-[#5C140F] p-1">
          {navItems.map((item) => {
            const isActive =
              currentTab === item.tab ||
              (item.tab === 'MODE_SELECT' && currentTab === 'GAME');

            return (
              <button
                key={`nav-${item.tab}`}
                onClick={() => onNavigate(item.tab)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  isActive
                    ? item.tab === 'MODE_SELECT'
                      ? 'bg-[#D8401F] text-white border-[1.5px] border-[#5C140F]'
                      : 'bg-[#5C140F] text-white'
                    : item.tab === 'MODE_SELECT'
                    ? 'bg-[#D8401F]/15 text-[#5C140F] hover:bg-[#D8401F]/30'
                    : 'text-[#2B1B12] hover:bg-[#E4D19E]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F6ECD2] hover:bg-white border-[2px] border-[#5C140F] flex items-center justify-center text-[#5C140F] transition-colors cursor-pointer"
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#5C140F]/50" />}
          </button>

          {/* Quick In-Game Rules Modal Trigger */}
          <button
            onClick={onOpenHelp}
            aria-label="How to play rules help"
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F6ECD2] hover:bg-white border-[2px] border-[#5C140F] flex items-center justify-center text-[#5C140F] font-bold text-sm cursor-pointer"
            title="Rules & Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings Trigger if available */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              aria-label="Game Settings"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F6ECD2] hover:bg-white border-[2px] border-[#5C140F] flex items-center justify-center text-[#5C140F] cursor-pointer"
              title="Game Settings & Options"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Play CTA */}
          {currentTab !== 'GAME' && (
            <button
              onClick={() => onNavigate('MODE_SELECT')}
              className="lg:hidden flex items-center gap-1 px-3 py-1.5 bg-[#D8401F] text-white border-[2px] border-[#5C140F] text-xs font-bold cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden overflow-x-auto border-t-[2px] border-[#5C140F] bg-[#F6ECD2] py-1 px-2 flex items-center gap-1.5 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={`mobile-nav-${item.tab}`}
            onClick={() => onNavigate(item.tab)}
            className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-bold border-[1.5px] border-[#5C140F] transition-colors cursor-pointer ${
              currentTab === item.tab
                ? 'bg-[#5C140F] text-white'
                : 'bg-[#E4D19E] text-[#2B1B12]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
