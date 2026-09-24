import React from 'react';
import { ViewTab } from '../types';
import { LotusIcon } from './FolkArtMotifs';
import { ArrowLeft, BarChart3, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  hasPlan: boolean;
  onNavigate: (tab: ViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, hasPlan, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#EFDFB8] border-b-[3px] border-[#5C140F]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <a
            href="../../kreeda.html"
            className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#6B4E3D] hover:text-[#D8401F] uppercase tracking-wider"
            title="Back to KREEDA"
          >
            <ArrowLeft className="w-3 h-3" /> KREEDA
          </a>
          <button onClick={() => onNavigate('HOME')} className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#F6ECD2] border-2 border-[#5C140F] flex items-center justify-center transition-transform group-hover:scale-105">
              <LotusIcon size={22} color="#D9587B" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-fraunces font-extrabold text-base sm:text-xl text-[#5C140F] tracking-tight leading-none">
                  PHYSICAL WELLBEING
                </span>
                <span className="font-telugu text-sm sm:text-base font-bold text-[#D9587B] leading-none hidden sm:inline">
                  శారీరిక
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#6B4E3D] uppercase tracking-wider block">
                Yoga &middot; Vyayam &middot; Dhyana
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('PROGRESS')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-[#5C140F] cursor-pointer transition-colors ${
              currentTab === 'PROGRESS' ? 'bg-[#5C140F] text-white' : 'bg-[#F6ECD2] text-[#5C140F] hover:bg-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Progress
          </button>
          <button
            onClick={() => onNavigate(hasPlan ? 'PLAN_OVERVIEW' : 'PLAN_BUILDER')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-[#5C140F] cursor-pointer transition-colors ${
              currentTab === 'PLAN_OVERVIEW' || currentTab === 'PLAN_BUILDER' ? 'bg-[#D8401F] text-white' : 'bg-[#D8401F]/90 text-white hover:bg-[#D8401F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> {hasPlan ? 'My Plan' : 'Build My Plan'}
          </button>
        </div>
      </div>
    </header>
  );
};
