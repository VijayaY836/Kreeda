import React from 'react';
import { LotusIcon } from './FolkArtMotifs';
import { Play, Globe } from 'lucide-react';

type ViewKind = 'home' | 'detail' | 'lang-select' | 'play';

interface HeaderProps {
  currentView: ViewKind;
  onNavigateHome: () => void;
  gameTitle?: string;
  gameNative?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  gameTitle,
  gameNative,
}) => {
  const showGameTitle = (currentView === 'detail' || currentView === 'play') && gameTitle;

  return (
    <header className="sticky top-0 z-40 bg-[#EFDFB8] border-b-[3px] border-[#5C140F]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#F6ECD2] border-[2px] border-[#5C140F] flex items-center justify-center transition-transform group-hover:scale-105">
            <LotusIcon size={24} color="#D8401F" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-fraunces font-extrabold text-lg sm:text-xl text-[#5C140F] tracking-tight leading-none">
                KREEDA
              </span>
              <span className="font-telugu text-sm sm:text-base font-bold text-[#D9587B] leading-none">
                क्रीड़ा
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#6B4E3D] uppercase tracking-wider block">
              Ancient Games, Mapped
            </span>
          </div>
        </button>

        {/* Game title when viewing detail / playing */}
        {showGameTitle && (
          <div className="hidden md:flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1.5">
            <Play className="w-3.5 h-3.5 text-[#D8401F] fill-current" />
            <span className="font-fraunces font-bold text-sm text-[#5C140F]">
              {gameTitle}
            </span>
            {gameNative && (
              <span className="font-telugu text-xs text-[#D9587B]">{gameNative}</span>
            )}
          </div>
        )}

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6ECD2] hover:bg-white border-[2px] border-[#5C140F] text-[#5C140F] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Games</span>
          </button>
        </div>
      </div>
    </header>
  );
};
