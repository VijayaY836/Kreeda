import React from 'react';
import { ViewTab } from '../types';
import { LotusIcon } from './FolkArtMotifs';
import { Volume2, VolumeX, HelpCircle, Settings } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  onOpenSettings?: () => void;
  allGamesHref?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  soundEnabled,
  onToggleSound,
  onOpenHelp,
  onOpenSettings,
  allGamesHref = '../../../kreeda.html',
}) => {
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

          {/* ← All Games link */}
          <a
            href={allGamesHref}
            aria-label="Back to All Games"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6ECD2] hover:bg-white border-[2px] border-[#5C140F] text-[#5C140F] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer no-underline"
            title="All Games"
            style={{ textDecoration: 'none' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6"/>
            </svg>
            <span className="hidden sm:inline">All Games</span>
          </a>
        </div>
      </div>
    </header>
  );
};
