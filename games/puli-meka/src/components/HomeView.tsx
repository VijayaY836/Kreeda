import React from 'react';
import { AIDifficulty, GameMode, GameVariant, ViewTab } from '../types';
import { BOARD_DEFS, VARIANTS } from '../game/puliMekaEngine';
import { BookOpen, Bot, History, Play, Sparkles, Users } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: ViewTab) => void;
  onStartGame: (mode: GameMode, difficulty?: AIDifficulty) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onStartGame }) => {
  return (
        <div className="min-h-full px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 text-center">
              <div className="mb-3 inline-flex items-center gap-2 border-2 border-[#5C140F] bg-[#F6ECD2] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#5C140F]">
                <span className="text-[#D8401F]">♠</span>
                Ancient Indian Strategy Board Game
              </div>
              <h1 className="font-fraunces text-3xl font-extrabold uppercase leading-tight text-[#5C140F] sm:text-5xl">
                Traditional Indian Strategy: Two Classic Games
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {variants.map((variant) => (
                <GameCard key={variant} variant={variant} onNavigate={onNavigate} onStartGame={onStartGame} />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <UtilityButton icon={<Sparkles className="h-4 w-4 text-[#EFA90C]" />} label="Interactive Tutorial" onClick={() => onNavigate('TUTORIAL')} active />
              <UtilityButton icon={<BookOpen className="h-4 w-4" />} label="Rules Guide" onClick={() => onNavigate('HOW_TO_PLAY')} />
              <UtilityButton icon={<History className="h-4 w-4" />} label="Game History & Facts" onClick={() => onNavigate('HISTORY')} />
            </div>
          </div>
        </div>
      );
    };

const variants: GameVariant[] = ['puli_meka', 'bagh_chal'];

interface GameCardProps {
  variant: GameVariant;
  onNavigate: (tab: ViewTab) => void;
  onStartGame: (mode: GameMode, difficulty?: AIDifficulty) => void;
}

const GameCard: React.FC<GameCardProps> = ({ variant, onNavigate, onStartGame }) => {
  const details = VARIANTS[variant];

  return (
    <article className="border-[3px] border-[#5C140F] border-t-[12px] bg-[#F6ECD2] p-4 shadow-[0_3px_0_0_#5C140F] sm:p-5">
      <div className="grid grid-cols-[1fr_145px] items-start gap-3 sm:grid-cols-[1fr_165px]">
        <div>
          <h2 className="font-fraunces text-3xl font-extrabold uppercase leading-none text-[#5C140F] sm:text-4xl">{details.name}</h2>
          <div className="mt-1 font-telugu text-xl font-bold text-[#A45252]">
            {variant === 'puli_meka' ? 'పులి మేక ఆట' : 'బాగ్ చల్'}
          </div>
          <p className="mt-2 font-fraunces text-base italic text-[#2B1B12]">“{details.tagline}.”</p>
          <div className="my-3 flex items-center gap-1 text-[#D8401F]" aria-hidden="true">
            <span className="h-[2px] w-8 bg-[#5C140F]" /><span>◆</span><span className="text-[#EFA90C]">◆</span><span>◆</span><span className="h-[2px] w-8 bg-[#5C140F]" />
          </div>
          <p className="text-sm leading-relaxed text-[#2B1B12] sm:text-base">
            {variant === 'puli_meka' ? 'A traditional tiger-and-goat game of the south.' : 'The national game of Nepal, where tigers hunt goats.'}
          </p>
        </div>
        <BoardPreview variant={variant} />
      </div>

      <div className="mt-4 border-2 border-[#5C140F] p-3">
        <div className="mb-2 border-b-2 border-[#5C140F] pb-2 text-xs font-bold uppercase text-[#5C140F]">
          Start Playing <span className="font-telugu normal-case">• ఆట ప్రారంభించండి</span>
        </div>
        <button type="button" onClick={() => onNavigate('MODE_SELECT')} className="flex w-full items-center justify-center gap-2 border-2 border-[#5C140F] bg-[#C6321D] py-2.5 text-sm font-bold uppercase text-white transition hover:bg-[#A92718]">
          <Play className="h-4 w-4 fill-current" /> Play {details.name}
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onStartGame('PVP')} className="flex items-center justify-center gap-1 border-2 border-[#5C140F] bg-[#E4D19E] px-2 py-2 text-xs font-bold text-[#2B1B12] hover:bg-[#EFDFB8]">
            <Users className="h-3.5 w-3.5 text-[#D8401F]" />
            <span>2 Players<small className="block text-[9px] font-normal text-[#6B4E3D]">Pass &amp; Play</small></span>
          </button>
          <button type="button" onClick={() => onNavigate('MODE_SELECT')} className="flex items-center justify-center gap-1 border-2 border-[#5C140F] bg-[#E4D19E] px-2 py-2 text-xs font-bold text-[#2B1B12] hover:bg-[#EFDFB8]">
            <Bot className="h-3.5 w-3.5 text-[#0E5C58]" />
            <span>vs Kreedu AI<small className="block text-[9px] font-normal text-[#6B4E3D]">Select Difficulty</small></span>
          </button>
        </div>
      </div>
    </article>
  );
};

const BoardPreview: React.FC<{ variant: GameVariant }> = ({ variant }) => {
  const definition = BOARD_DEFS[variant];
  const nodes = Object.entries(definition.nodes) as [string, { x: number; y: number }][];
  const segments = definition.lines.flatMap((line) => line.slice(0, -1).map((node, index) => ({ from: definition.nodes[node], to: definition.nodes[line[index + 1]] })));

  return (
    <div className="aspect-square w-full bg-[#E4D19E] p-1">
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-label={`${VARIANTS[variant].name} board preview`}>
        <g stroke="#7D4938" strokeLinecap="round" strokeWidth="1.1" opacity="0.9">
          {segments.map((segment, index) => <line key={index} x1={segment.from.x} y1={segment.from.y} x2={segment.to.x} y2={segment.to.y} />)}
        </g>
        <g fill="#7D4938">{nodes.map(([node, position]) => <circle key={node} cx={position.x} cy={position.y} r="1.7" />)}</g>
      </svg>
    </div>
  );
};

const UtilityButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }> = ({ icon, label, onClick, active = false }) => (
  <button type="button" onClick={onClick} className={`flex items-center justify-center gap-2 border-2 border-[#5C140F] px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition ${active ? 'bg-[#0E5C58] text-white hover:bg-[#094340]' : 'bg-[#F6ECD2] text-[#5C140F] hover:bg-white'}`}>
    {icon}{label}
  </button>
);
