import React from 'react';
import { Variant, ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, KolamCorner, ChariotWheelIcon } from './FolkArtMotifs';
import { KreeduMascot } from './KreeduMascot';
import { PieceIcon } from './PieceIcon';
import { CHAT_BACK, CHESS_BACK, LET } from '../utils/chessEngine';
import { VARIANT_INFO } from '../utils/pieceArt';
import { PieceLetter } from '../types';
import { ArrowRight, BookOpen, Compass, Swords } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: ViewTab) => void;
  onPickVariant: (variant: Variant) => void;
}

const FACTS: Record<Variant, [string, string][]> = {
  chaturanga: [
    ['Origin', 'Gupta-era India, ~6th century'],
    ['Counsellor', 'Mantri — one diagonal step'],
    ['Elephant', 'Gaja — leaps exactly two'],
    ['Stalemate', 'A win for whoever forces it'],
  ],
  chess: [
    ['Origin', 'Europe, from the 15th century'],
    ['Queen', 'Any distance, any direction'],
    ['Bishop', 'Slides the whole diagonal'],
    ['Stalemate', 'A draw — half a point each'],
  ],
};

const VariantCard: React.FC<{ variant: Variant; onPick: () => void }> = ({ variant, onPick }) => {
  const info = VARIANT_INFO[variant];
  const back = variant === 'chess' ? CHESS_BACK : CHAT_BACK;
  return (
    <div
      onClick={onPick}
      className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-5 sm:p-6 flex flex-col justify-between cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#5C140F] relative"
    >
      <KolamCorner position="top-left" size={22} className="absolute top-1.5 left-1.5 opacity-60" />
      <KolamCorner position="bottom-right" size={22} className="absolute bottom-1.5 right-1.5 opacity-60" />

      <div>
        <div className="flex items-center justify-between mb-3 border-b-[2px] border-[#5C140F]/30 pb-2">
          <span className={`px-2.5 py-0.5 text-white text-[11px] font-bold uppercase tracking-wide ${variant === 'chaturanga' ? 'bg-[#D8401F]' : 'bg-[#0E5C58]'}`}>
            {variant === 'chaturanga' ? 'The Ancient Game' : 'The Modern Descendant'}
          </span>
        </div>

        {/* Back-rank strip preview */}
        <div className="flex items-center justify-center gap-1 mb-4 bg-[#E4D19E] border-[2px] border-[#5C140F] py-3">
          {back.map((t, idx) => (
            <PieceIcon key={idx} variant={variant} letter={LET[t] as PieceLetter} ivory className="w-6 h-6 sm:w-7 sm:h-7" />
          ))}
        </div>

        <h3 className="font-fraunces font-extrabold text-2xl text-center text-[#5C140F] mb-1">{info.title}</h3>
        <p className="font-telugu text-sm text-center font-bold text-[#D9587B] mb-3">{info.native}</p>
        <p className="text-xs text-[#2B1B12] leading-relaxed mb-4 text-center">{info.lead}</p>

        <dl className="grid grid-cols-2 gap-1.5 bg-[#E4D19E] border-[2px] border-[#5C140F] p-2.5 text-[11px] text-[#2B1B12] mb-5">
          {FACTS[variant].map(([k, v]) => (
            <div key={k}>
              <dt className="font-bold text-[#5C140F]">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPick(); }}
        className={`w-full py-3 text-white border-[2px] border-[#5C140F] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
          variant === 'chaturanga' ? 'bg-[#D8401F] group-hover:bg-[#B83215]' : 'bg-[#0E5C58] group-hover:bg-[#094340]'
        }`}
      >
        <span>Play {info.title}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onPickVariant }) => {
  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <KreeduMascot mood="HAPPY" size={84} showDialogBubble dialogText="I'll bring the elephants — you'll want the chariots." />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F6ECD2] border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-widest text-[#5C140F] mb-3">
          <ChariotWheelIcon size={14} color="#D8401F" />
          <span>One Board · Two Games · 1,500 Years Apart</span>
        </div>
        <h1 className="font-fraunces font-extrabold text-3xl sm:text-5xl text-[#5C140F] mb-2 leading-tight">
          Chaturangam — the four limbs of an army.
        </h1>
        <p className="font-telugu text-lg sm:text-xl font-bold text-[#D9587B] mb-3">చతురంగం</p>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#6B4E3D]">
          Command infantry, cavalry, elephants and chariots the way Gupta-era India did — then play the same board a
          thousand years later as modern Chess, and feel exactly what changed. 100% offline, against Kreedu or a friend.
        </p>
      </div>

      {/* Variant cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <VariantCard variant="chaturanga" onPick={() => onPickVariant('chaturanga')} />
        <VariantCard variant="chess" onPick={() => onPickVariant('chess')} />
      </div>

      <FolkDivider className="mb-8" />

      {/* Secondary links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 bg-[#E4D19E] border-[2px] border-[#5C140F] flex items-center justify-center text-[#5C140F]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-fraunces font-bold text-base text-[#5C140F] mb-0.5">How to Play</h4>
            <p className="text-xs text-[#6B4E3D] mb-2">Every piece, every rule, and what's different between the two games.</p>
            <button onClick={() => onNavigate('HOW_TO_PLAY')} className="text-xs font-bold text-[#D8401F] hover:underline cursor-pointer inline-flex items-center gap-1">
              Read the rules <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </FolkArtFrame>

        <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 bg-[#E4D19E] border-[2px] border-[#5C140F] flex items-center justify-center text-[#5C140F]">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-fraunces font-bold text-base text-[#5C140F] mb-0.5">The Journey to Chess</h4>
            <p className="text-xs text-[#6B4E3D] mb-2">How a 6th-century Indian war game became the world's most popular board game.</p>
            <button onClick={() => onNavigate('ABOUT')} className="text-xs font-bold text-[#D8401F] hover:underline cursor-pointer inline-flex items-center gap-1">
              Read the history <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </FolkArtFrame>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => onNavigate('MODE_SELECT')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5C140F] hover:bg-[#3A0C09] text-white border-[3px] border-[#5C140F] font-bold text-sm uppercase tracking-wider cursor-pointer"
        >
          <Swords className="w-4 h-4" />
          <span>Choose Variant &amp; Play</span>
        </button>
      </div>
    </div>
  );
};
