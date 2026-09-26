import React from 'react';
import { ViewTab } from '../types';
import { ArrowLeft, BarChart3, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  hasPlan: boolean;
  onNavigate: (tab: ViewTab) => void;
}

const pill = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border cursor-pointer transition-colors';

export const Header: React.FC<HeaderProps> = ({ currentTab, hasPlan, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F1E8D2]/95 backdrop-blur border-b border-[#C7A467]/60">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <a
            href="../../kreeda-home.html"
            className={`${pill} hidden sm:inline-flex bg-[#FBF3E2]/90 border-[#2A241E]/15 text-[#2A241E] hover:border-[#C7A467]`}
            title="Back to KREEDA"
          >
            <ArrowLeft className="w-3.5 h-3.5 opacity-70" /> Home
          </a>
          <button onClick={() => onNavigate('HOME')} className="text-left cursor-pointer focus:outline-none group">
            <span className="font-fraunces font-semibold text-lg sm:text-2xl text-[#1F3B2E] leading-none group-hover:text-[#C4881F] transition-colors">
              Physical Wellbeing
            </span>
            <span className="font-telugu text-sm text-[#5C5142] ml-2 hidden sm:inline">శారీరిక</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('PROGRESS')}
            className={`${pill} hidden sm:inline-flex ${
              currentTab === 'PROGRESS'
                ? 'bg-[#1F3B2E] text-[#FBF3E2] border-[#C7A467]'
                : 'bg-[#FBF3E2]/90 border-[#2A241E]/15 text-[#2A241E] hover:border-[#C7A467]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Progress
          </button>
          <button
            onClick={() => onNavigate(hasPlan ? 'PLAN_OVERVIEW' : 'PLAN_BUILDER')}
            className={`${pill} bg-[#1F3B2E] text-[#FBF3E2] border-[#C7A467] hover:brightness-110`}
          >
            <Sparkles className="w-3.5 h-3.5" /> {hasPlan ? 'My Plan' : 'Build My Plan'}
          </button>
        </div>
      </div>
    </header>
  );
};
