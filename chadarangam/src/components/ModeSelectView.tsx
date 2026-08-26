import React, { useMemo, useState } from 'react';
import { AIDifficulty, GameMode, GameSettings, Side, Variant, ViewTab, PieceLetter } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, KolamCorner } from './FolkArtMotifs';
import { KreeduMascot } from './KreeduMascot';
import { PieceIcon } from './PieceIcon';
import { CHAT_BACK, CHESS_BACK, LET } from '../utils/chessEngine';
import { VARIANT_INFO } from '../utils/pieceArt';
import { ArrowLeft, ArrowRight, Bot, Users, Grid3x3, LayoutGrid } from 'lucide-react';

interface ModeSelectViewProps {
  onNavigate: (tab: ViewTab) => void;
  onStartGame: (settings: Pick<GameSettings, 'variant' | 'gameMode' | 'difficulty' | 'humanSide' | 'boardStyle'>) => void;
  initialVariant: Variant;
}

const DIFF_META: { key: AIDifficulty; level: number; label: string; sanskrit: string; emoji: string; desc: string; color: string }[] = [
  { key: 'EASY', level: 1, label: 'Sishya', sanskrit: 'the pupil', emoji: '🌱', desc: 'Plays casually, one move deep, with a wobble in its judgement. Ideal for learning the pieces.', color: '#5F8F3B' },
  { key: 'MEDIUM', level: 2, label: 'Yodha', sanskrit: 'the warrior', emoji: '⚖️', desc: 'A tuned minimax search that blocks threats and presses tactical openings. Balanced challenge.', color: '#D8401F' },
  { key: 'HARD', level: 3, label: 'Senapati', sanskrit: 'the general', emoji: '🔥', desc: 'Deep iterative-deepening search with quiescence and null-move pruning. Plays for keeps.', color: '#5C140F' },
];

export const ModeSelectView: React.FC<ModeSelectViewProps> = ({ onNavigate, onStartGame, initialVariant }) => {
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [gameMode, setGameMode] = useState<GameMode>('PVC');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('MEDIUM');
  const [humanSide, setHumanSide] = useState<Side>(1);
  const [boardStyle, setBoardStyle] = useState<'ashtapada' | 'checkered'>('ashtapada');

  const info = VARIANT_INFO[variant];
  const back = variant === 'chess' ? CHESS_BACK : CHAT_BACK;
  const effectiveBoardStyle = variant === 'chess' ? 'checkered' : boardStyle;

  const summary = useMemo(() => {
    const foe = gameMode === 'PVC' ? `Kreedu · ${DIFF_META.find(d => d.key === difficulty)?.label}` : 'two players';
    const side = gameMode === 'PVC' ? ` · you play ${humanSide > 0 ? info.sides.w : info.sides.b}` : '';
    return `${info.title} · vs ${foe}${side}`;
  }, [gameMode, difficulty, humanSide, info]);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <KreeduMascot mood="THINKING" size={64} />
        </div>
        <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl text-[#5C140F] mb-1">Set Up Your Match</h1>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#6B4E3D]">
          Choose a variant, an opponent, and (if you're facing Kreedu) a difficulty. Then step onto the board.
        </p>
      </div>

      <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 sm:p-7 mb-6">
        {/* Variant */}
        <div className="mb-6">
          <h3 className="font-fraunces font-bold text-sm uppercase tracking-wider text-[#5C140F] mb-3">1. Choose Your Game</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['chaturanga', 'chess'] as Variant[]).map((v) => {
              const vInfo = VARIANT_INFO[v];
              const vBack = v === 'chess' ? CHESS_BACK : CHAT_BACK;
              const sel = variant === v;
              return (
                <div
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`relative p-4 border-[2.5px] cursor-pointer transition-all ${sel ? 'border-[#D8401F] bg-white shadow-[3px_3px_0px_0px_#5C140F]' : 'border-[#5C140F]/40 bg-[#E4D19E] hover:bg-[#F6ECD2]'}`}
                >
                  {sel && <KolamCorner position="top-right" size={18} className="absolute top-1 right-1" />}
                  <div className="flex items-center justify-center gap-1 mb-3 bg-[#E4D19E] border-[1.5px] border-[#5C140F] py-2">
                    {vBack.map((t, idx) => (
                      <PieceIcon key={idx} variant={v} letter={LET[t] as PieceLetter} ivory className="w-5 h-5 sm:w-6 sm:h-6" />
                    ))}
                  </div>
                  <h4 className="font-fraunces font-extrabold text-lg text-center text-[#5C140F]">{vInfo.title}</h4>
                  <p className="text-[11px] text-center text-[#6B4E3D] mt-0.5">{v === 'chaturanga' ? 'Gupta-era rules, ~6th century' : 'The modern game'}</p>
                </div>
              );
            })}
          </div>
        </div>

        <FolkDivider className="mb-6" />

        {/* Opponent */}
        <div className="mb-6">
          <h3 className="font-fraunces font-bold text-sm uppercase tracking-wider text-[#5C140F] mb-3">2. Choose Your Opponent</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGameMode('PVC')}
              className={`flex items-center justify-center gap-2 px-3 py-3 border-[2px] border-[#5C140F] text-sm font-bold transition-colors cursor-pointer ${gameMode === 'PVC' ? 'bg-[#0E5C58] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
            >
              <Bot className="w-4 h-4" />
              <span>vs Kreedu (AI)</span>
            </button>
            <button
              onClick={() => setGameMode('PVP')}
              className={`flex items-center justify-center gap-2 px-3 py-3 border-[2px] border-[#5C140F] text-sm font-bold transition-colors cursor-pointer ${gameMode === 'PVP' ? 'bg-[#D8401F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
            >
              <Users className="w-4 h-4" />
              <span>2 Players (Local)</span>
            </button>
          </div>
        </div>

        {/* Difficulty + Side (AI only) */}
        {gameMode === 'PVC' && (
          <>
            <FolkDivider className="mb-6" />
            <div className="mb-6">
              <h3 className="font-fraunces font-bold text-sm uppercase tracking-wider text-[#5C140F] mb-3">3. Kreedu's Strength</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIFF_META.map((d) => (
                  <div
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    className={`p-3 border-[2px] cursor-pointer transition-all ${difficulty === d.key ? 'border-[#5C140F] bg-white shadow-[3px_3px_0px_0px_#5C140F]' : 'border-[#5C140F]/40 bg-[#E4D19E] hover:bg-white'}`}
                  >
                    <div className="text-2xl text-center mb-1">{d.emoji}</div>
                    <h4 className="font-fraunces font-extrabold text-base text-center text-[#5C140F]">{d.label}</h4>
                    <p className="text-[10px] text-center font-bold mb-1.5" style={{ color: d.color }}>{d.sanskrit}</p>
                    <p className="text-[11px] text-[#2B1B12] text-center leading-snug">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <FolkDivider className="mb-6" />
            <div className="mb-2">
              <h3 className="font-fraunces font-bold text-sm uppercase tracking-wider text-[#5C140F] mb-3">4. Choose Your Side</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHumanSide(1)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 border-[2px] border-[#5C140F] text-sm font-bold transition-colors cursor-pointer ${humanSide === 1 ? 'bg-[#F6ECD2] ring-2 ring-[#D8401F]' : 'bg-[#E4D19E] hover:bg-white'}`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F6ECD2] border-2 border-[#5C140F]" />
                  <span>{info.sides.w} (moves first)</span>
                </button>
                <button
                  onClick={() => setHumanSide(-1)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 border-[2px] border-[#5C140F] text-sm font-bold transition-colors cursor-pointer ${humanSide === -1 ? 'bg-[#F6ECD2] ring-2 ring-[#D8401F]' : 'bg-[#E4D19E] hover:bg-white'}`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#5C140F] border-2 border-[#EFA90C]" />
                  <span>{info.sides.b}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Board style (Chaturangam only) */}
        {variant === 'chaturanga' && (
          <>
            <FolkDivider className="mb-6 mt-6" />
            <div>
              <h3 className="font-fraunces font-bold text-sm uppercase tracking-wider text-[#5C140F] mb-3">Board Style</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBoardStyle('ashtapada')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 border-[2px] border-[#5C140F] text-sm font-bold transition-colors cursor-pointer ${boardStyle === 'ashtapada' ? 'bg-[#F6ECD2] ring-2 ring-[#D8401F]' : 'bg-[#E4D19E] hover:bg-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Ashtapada (traditional)</span>
                </button>
                <button
                  onClick={() => setBoardStyle('checkered')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 border-[2px] border-[#5C140F] text-sm font-bold transition-colors cursor-pointer ${boardStyle === 'checkered' ? 'bg-[#F6ECD2] ring-2 ring-[#D8401F]' : 'bg-[#E4D19E] hover:bg-white'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span>Checkered</span>
                </button>
              </div>
            </div>
          </>
        )}
      </FolkArtFrame>

      {/* Summary + CTA */}
      <div className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B4E3D]">Match Summary</p>
          <p className="font-fraunces font-bold text-base text-[#5C140F]">{summary}</p>
        </div>
        <button
          onClick={() => onStartGame({ variant, gameMode, difficulty, humanSide, boardStyle: effectiveBoardStyle })}
          className="w-full sm:w-auto px-8 py-3 bg-[#D8401F] hover:bg-[#B83215] text-white border-[3px] border-[#5C140F] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start Game</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-5 text-center">
        <button onClick={() => onNavigate('HOME')} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C140F] hover:underline cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
