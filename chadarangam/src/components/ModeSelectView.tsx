import React, { useMemo, useState } from 'react';
import { AIDifficulty, GameMode, GameSettings, PieceLetter, Side, Variant, ViewTab } from '../types';
import { KolamCorner } from './FolkArtMotifs';
import { PieceIcon } from './PieceIcon';
import { GameBoard } from './GameBoard';
import { CHAT_BACK, CHESS_BACK, LET, P, SQ } from '../utils/chessEngine';
import { VARIANT_INFO } from '../utils/pieceArt';
import { ArrowLeft, Play, Bot, Users, LayoutGrid, Grid3x3 } from 'lucide-react';

interface ModeSelectViewProps {
  onNavigate: (tab: ViewTab) => void;
  onStartGame: (settings: Pick<GameSettings, 'variant' | 'gameMode' | 'difficulty' | 'humanSide' | 'boardStyle'>) => void;
  initialVariant: Variant;
}

const DIFF_META: { key: AIDifficulty; emoji: string; label: string; sanskrit: string }[] = [
  { key: 'EASY', emoji: '🌱', label: 'Sishya', sanskrit: 'the pupil' },
  { key: 'MEDIUM', emoji: '⚖️', label: 'Yodha', sanskrit: 'the warrior' },
  { key: 'HARD', emoji: '🔥', label: 'Senapati', sanskrit: 'the general' },
];

const letterOf = (piece: number): PieceLetter => LET[Math.abs(piece)] as PieceLetter;

function previewBoard(variant: Variant): number[] {
  const b = new Array(64).fill(0);
  const back = variant === 'chess' ? CHESS_BACK : CHAT_BACK;
  for (let f = 0; f < 8; f++) {
    b[SQ(f, 0)] = back[f];
    b[SQ(f, 1)] = P;
    b[SQ(f, 6)] = -P;
    b[SQ(f, 7)] = -back[f];
  }
  return b;
}

export const ModeSelectView: React.FC<ModeSelectViewProps> = ({ onNavigate, onStartGame, initialVariant }) => {
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [gameMode, setGameMode] = useState<GameMode>('PVC');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('MEDIUM');
  const [humanSide, setHumanSide] = useState<Side>(1);
  const [boardStyle, setBoardStyle] = useState<'ashtapada' | 'checkered'>('ashtapada');

  const info = VARIANT_INFO[variant];
  const effectiveBoardStyle = variant === 'chess' ? 'checkered' : boardStyle;
  const accent = variant === 'chaturanga' ? '#D8401F' : '#0E5C58';
  const accentDark = variant === 'chaturanga' ? '#B83215' : '#094340';
  const board = useMemo(() => previewBoard(variant), [variant]);

  const begin = () => {
    onStartGame({ variant, gameMode, difficulty, humanSide, boardStyle: effectiveBoardStyle });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl text-[#5C140F] mb-1">Set Up Your Match</h1>
        <p className="text-xs sm:text-sm text-[#6B4E3D]">Everything on one screen — pick, tweak, begin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Settings console */}
        <div className="lg:col-span-7 relative bg-[#F6ECD2] border-[3px] border-[#5C140F] p-5 sm:p-8">
          <KolamCorner position="top-left" size={22} className="absolute top-1.5 left-1.5 opacity-60" />
          <KolamCorner position="top-right" size={22} className="absolute top-1.5 right-1.5 opacity-60" />
          <KolamCorner position="bottom-left" size={22} className="absolute bottom-1.5 left-1.5 opacity-60" />
          <KolamCorner position="bottom-right" size={22} className="absolute bottom-1.5 right-1.5 opacity-60" />

          {/* 1. Variant */}
          <div className="mb-6">
            <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">Game</span>
            <div className="grid grid-cols-2 gap-3">
              {(['chaturanga', 'chess'] as Variant[]).map((v) => {
                const vInfo = VARIANT_INFO[v];
                const sel = variant === v;
                return (
                  <button
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`flex items-center gap-3 p-3 border-2 text-left cursor-pointer transition-all ${sel ? 'border-[#5C140F] bg-white shadow-[3px_3px_0px_0px_#5C140F]' : 'border-[#5C140F]/30 bg-[#E4D19E] hover:bg-white'}`}
                  >
                    <PieceIcon variant={v} letter="K" ivory className="w-8 h-8 shrink-0" />
                    <div>
                      <div className="font-fraunces font-bold text-sm text-[#5C140F]">{vInfo.title}</div>
                      <div className="text-[10px] text-[#6B4E3D]">{v === 'chaturanga' ? 'Gupta-era, ~6th c.' : 'Modern game'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Opponent */}
          <div className="mb-6">
            <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">Opponent</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGameMode('PVC')}
                className={`flex items-center justify-center gap-2 py-3 border-2 border-[#5C140F] text-sm font-bold cursor-pointer transition-colors ${gameMode === 'PVC' ? 'bg-[#0E5C58] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
              >
                <Bot className="w-4 h-4" /> Kreedu AI
              </button>
              <button
                onClick={() => setGameMode('PVP')}
                className={`flex items-center justify-center gap-2 py-3 border-2 border-[#5C140F] text-sm font-bold cursor-pointer transition-colors ${gameMode === 'PVP' ? 'bg-[#D8401F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
              >
                <Users className="w-4 h-4" /> 2 Players
              </button>
            </div>
          </div>

          {/* 3. Difficulty + Side (AI only) */}
          {gameMode === 'PVC' && (
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">Kreedu's Strength</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {DIFF_META.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setDifficulty(d.key)}
                      title={d.sanskrit}
                      className={`flex flex-col items-center py-2 border-2 border-[#5C140F] text-[11px] font-bold cursor-pointer transition-colors ${difficulty === d.key ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                    >
                      <span className="text-base leading-none mb-0.5">{d.emoji}</span>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">Play As</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setHumanSide(1)}
                    className={`flex items-center justify-center gap-1.5 py-2 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${humanSide === 1 ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#F6ECD2] border-2 border-current" />
                    {info.sides.w}
                  </button>
                  <button
                    onClick={() => setHumanSide(-1)}
                    className={`flex items-center justify-center gap-1.5 py-2 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${humanSide === -1 ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#5C140F] border-2 border-[#EFA90C]" />
                    {info.sides.b}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Board style (Chaturangam only) */}
          {variant === 'chaturanga' && (
            <div className="mb-6">
              <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">Board Style</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBoardStyle('ashtapada')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${boardStyle === 'ashtapada' ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Ashtapada (traditional)
                </button>
                <button
                  onClick={() => setBoardStyle('checkered')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${boardStyle === 'checkered' ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                >
                  <Grid3x3 className="w-3.5 h-3.5" /> Checkered
                </button>
              </div>
            </div>
          )}

          {/* Begin */}
          <button
            type="button"
            onClick={begin}
            className="w-full py-4 text-white border-2 border-[#5C140F] font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            style={{ backgroundColor: accent }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentDark)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accent)}
          >
            <Play className="w-5 h-5 fill-current" />
            Begin {info.title} Match
          </button>
        </div>

        {/* Live board preview — as in the legacy setup screen */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-fraunces font-bold text-sm text-[#5C140F]">{info.title} Preview</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B4E3D]">
                {effectiveBoardStyle === 'checkered' ? 'Checkered' : 'Ashtapada'}
              </span>
            </div>
            <GameBoard
              variant={variant}
              board={board}
              boardStyle={effectiveBoardStyle}
              selected={null}
              targetSquares={new Set()}
              captureSquares={new Set()}
              lastMove={null}
              checkedSq={-1}
              flipped={gameMode === 'PVC' && humanSide < 0}
              hints={false}
              disabled
              onSquareClick={() => {}}
              letterOf={letterOf}
            />
            <p className="text-[11px] text-[#6B4E3D] mt-3 text-center">
              {variant === 'chaturanga'
                ? 'Armies mirror — the Raja faces the Raja down the d-file.'
                : 'Armies rotate — each Queen starts on her own colour.'}
            </p>
          </div>
        </div>
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
