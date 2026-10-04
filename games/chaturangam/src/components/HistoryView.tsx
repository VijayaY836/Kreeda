import React from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { EraTimeline } from './EraTimeline';
import { WorldMap } from './WorldMap';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

interface HistoryViewProps {
  onNavigate: (tab: ViewTab) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-fraunces text-[#5C140F] mb-2">History</h1>
        <p className="max-w-xl mx-auto text-sm text-[#6B4E3D]">
          One lineage, one board, three names across fifteen hundred years.
        </p>
      </div>

      <div className="mb-8">
        <EraTimeline compact />
      </div>

      <FolkArtFrame bg="bg-[#F6ECD2]" className="mb-6">
        <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
          Most ancient games spread quietly, leaving historians to guess at their routes. Chaturangam is an
          exception: its journey from Gupta-era India, through Persia, into Europe, and out to the whole world is
          one of the best-documented migrations of any board game in history — and you can play every stop on
          that line, right here.
        </p>
        <p className="text-sm text-[#2B1B12] leading-relaxed">
          No complete rulebook survives from Gupta India, so the Chaturangam rules here follow the standard
          scholarly reconstruction — the same one Shatranj used a century later, the closest thing historians
          have to direct evidence.
        </p>
      </FolkArtFrame>

      <FolkArtFrame bg="bg-[#F6ECD2]" className="mb-8">
        <h2 className="font-fraunces text-lg font-bold text-[#5C140F] mb-1">Where the game travelled</h2>
        <p className="text-xs text-[#6B4E3D] mb-4">Drag to pan, scroll or pinch to zoom, tap any pin for its story.</p>
        <WorldMap />
      </FolkArtFrame>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => onNavigate('TUTORIAL')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0E5C58] hover:bg-[#094340] text-white border-2 border-[#5C140F] text-xs font-bold uppercase cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#EFA90C]" />
          Learn the Pieces &amp; Rules
        </button>
        <button
          onClick={() => onNavigate('MODE_SELECT')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D8401F] hover:bg-[#B83215] text-white border-2 border-[#5C140F] text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Play Now
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
