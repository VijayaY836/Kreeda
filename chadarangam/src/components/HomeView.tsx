import React from 'react';
import { Variant, ViewTab } from '../types';
import { KolamCorner } from './FolkArtMotifs';
import { KingsClash } from './KingsClash';
import { PieceIcon } from './PieceIcon';
import { CHAT_BACK, CHESS_BACK, LET } from '../utils/chessEngine';
import { VARIANT_INFO } from '../utils/pieceArt';
import { PieceLetter } from '../types';
import { BookOpen, Sparkles, ArrowRight, Swords } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: ViewTab) => void;
  onPickVariant: (variant: Variant) => void;
}

const SIDE_COPY: Record<Variant, { blurb: string; accent: string; accentDark: string }> = {
  chaturanga: {
    blurb: 'Infantry, cavalry, elephants and chariots — no queen, no castling.',
    accent: '#D8401F',
    accentDark: '#B83215',
  },
  chess: {
    blurb: 'The same board, 1,500 years on — the Mantri and Gaja grew into a queen and bishop.',
    accent: '#0E5C58',
    accentDark: '#094340',
  },
};

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onPickVariant }) => {
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col justify-center py-2 px-4">
      {/* Hero */}
      <div className="text-center mb-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-fraunces text-[#5C140F] tracking-tight leading-none mb-1">
          CHATURANGAM
        </h1>
        <div className="font-telugu text-base sm:text-lg font-bold text-[#D9587B] mb-2">
          చతురంగం
        </div>

        <KingsClash compact />
      </div>

      {/* One Board, Two Games — split portal panel */}
      <div className="relative bg-[#F6ECD2] border-4 border-[#5C140F] mb-2.5">
        <KolamCorner position="top-left" size={18} className="absolute top-1 left-1 opacity-60" />
        <KolamCorner position="top-right" size={18} className="absolute top-1 right-1 opacity-60" />
        <KolamCorner position="bottom-left" size={18} className="absolute bottom-1 left-1 opacity-60" />
        <KolamCorner position="bottom-right" size={18} className="absolute bottom-1 right-1 opacity-60" />

        <div className="text-center pt-2 pb-0.5 px-6">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B4E3D]">
            One Board · Two Games
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 relative">
          {(['chaturanga', 'chess'] as Variant[]).map((v) => {
            const info = VARIANT_INFO[v];
            const copy = SIDE_COPY[v];
            const back = v === 'chess' ? CHESS_BACK : CHAT_BACK;
            return (
              <div
                key={v}
                onClick={() => onPickVariant(v)}
                className={`group cursor-pointer p-2.5 sm:p-4 flex flex-col items-center text-center transition-colors hover:bg-[#EFE3C0] ${v === 'chaturanga' ? 'md:border-r-[3px] border-[#5C140F]/40' : ''}`}
              >
                <div className="flex items-center gap-1 mb-1.5">
                  {back.map((t, idx) => (
                    <PieceIcon key={idx} variant={v} letter={LET[t] as PieceLetter} ivory className="w-4 h-4 sm:w-5 sm:h-5 opacity-90" />
                  ))}
                </div>

                <h2 className="font-fraunces font-extrabold text-xl sm:text-2xl text-[#5C140F] mb-0.5">
                  {info.title}
                </h2>
                <p className="font-telugu text-xs font-bold mb-1" style={{ color: copy.accent }}>
                  {info.native}
                </p>
                <p className="text-[11px] sm:text-xs text-[#2B1B12] leading-snug max-w-xs mb-2">
                  {copy.blurb}
                </p>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onPickVariant(v); }}
                  className="mt-auto inline-flex items-center gap-1.5 px-4 py-1.5 text-white border-2 border-[#5C140F] font-bold text-[11px] uppercase tracking-wider transition-transform group-hover:scale-[1.03] cursor-pointer"
                  style={{ backgroundColor: copy.accent }}
                >
                  <span>Play {info.title}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Center VS medallion, seam-mounted on desktop */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#EFA90C] border-[3px] border-[#5C140F] items-center justify-center z-10">
            <span className="font-fraunces font-black text-xs text-[#5C140F]">VS</span>
          </div>
        </div>
      </div>

      {/* Quick links strip — History / Tutorial / Play, no repeated cultural blurbs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate('HISTORY')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#F6ECD2] hover:bg-white border-2 border-[#5C140F] text-[11px] font-bold text-[#5C140F] uppercase tracking-wider cursor-pointer"
        >
          <BookOpen className="w-3 h-3" />
          The Story
        </button>
        <button
          type="button"
          onClick={() => onNavigate('TUTORIAL')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0E5C58] hover:bg-[#094340] text-white border-2 border-[#5C140F] text-[11px] font-bold uppercase tracking-wider cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#EFA90C]" />
          The Pieces &amp; Rules
        </button>
        <button
          type="button"
          onClick={() => onNavigate('MODE_SELECT')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#5C140F] hover:bg-[#3A0C09] text-white border-2 border-[#5C140F] text-[11px] font-bold uppercase tracking-wider cursor-pointer"
        >
          <Swords className="w-3 h-3" />
          Match Setup
        </button>
      </div>
    </div>
  );
};
