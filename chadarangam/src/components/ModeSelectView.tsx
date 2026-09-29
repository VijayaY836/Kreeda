import React, { useMemo, useState } from 'react';
import { AIDifficulty, GameMode, GameSettings, PieceLetter, Side, Variant, ViewTab } from '../types';
import { KolamCorner } from './FolkArtMotifs';
import { PieceIcon } from './PieceIcon';
import { GameBoard } from './GameBoard';
import { CHAT_BACK, CHESS_BACK, LET, P, SQ } from '../utils/chessEngine';
import { t, useLang, sideName, variantTitle, levelName } from '../i18n';
import { ArrowLeft, Play, Bot, Users, LayoutGrid, Grid3x3 } from 'lucide-react';

interface ModeSelectViewProps {
  onNavigate: (tab: ViewTab) => void;
  onStartGame: (settings: Pick<GameSettings, 'variant' | 'gameMode' | 'difficulty' | 'humanSide' | 'boardStyle'>) => void;
  initialVariant: Variant;
  // Earlier choices to reopen setup with (e.g. coming back from a match).
  initial?: Partial<Pick<GameSettings, 'gameMode' | 'difficulty' | 'humanSide' | 'boardStyle'>>;
  // Shown inside the KREEDA hub's setup card: the card supplies the title,
  // and there's no app home to go back to.
  embedded?: boolean;
}

// level 1–3 → Sishya / Yodha / Senapati (names and hints in i18n.ts)
const DIFF_META: { key: AIDifficulty; emoji: string; level: number }[] = [
  { key: 'EASY', emoji: '🌱', level: 1 },
  { key: 'MEDIUM', emoji: '⚖️', level: 2 },
  { key: 'HARD', emoji: '🔥', level: 3 },
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

export const ModeSelectView: React.FC<ModeSelectViewProps> = ({ onNavigate, onStartGame, initialVariant, initial = {}, embedded = false }) => {
  useLang(); // re-render when the app language changes
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [gameMode, setGameMode] = useState<GameMode>(initial.gameMode ?? 'PVC');
  const [difficulty, setDifficulty] = useState<AIDifficulty>(initial.difficulty ?? 'MEDIUM');
  const [humanSide, setHumanSide] = useState<Side>(initial.humanSide ?? 1);
  const [boardStyle, setBoardStyle] = useState<'ashtapada' | 'checkered'>(initial.boardStyle ?? 'ashtapada');

  const effectiveBoardStyle = variant === 'chess' ? 'checkered' : boardStyle;
  const accent = variant === 'chaturanga' ? '#D8401F' : '#0E5C58';
  const accentDark = variant === 'chaturanga' ? '#B83215' : '#094340';
  const board = useMemo(() => previewBoard(variant), [variant]);

  // Inside the hub's card everything has to fit on one screen, so sections sit closer.
  const section = embedded ? 'mb-4' : 'mb-6';

  const begin = () => {
    onStartGame({ variant, gameMode, difficulty, humanSide, boardStyle: effectiveBoardStyle });
  };

  return (
    <div className={embedded ? 'min-h-screen flex items-center justify-center px-3 sm:px-5 py-4' : 'max-w-6xl mx-auto py-8 sm:py-12 px-4'}>
      {!embedded && (
        <div className="text-center mb-8">
          <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl text-[#5C140F] mb-1">{t('setup.title')}</h1>
          <p className="text-xs sm:text-sm text-[#6B4E3D]">{t('setup.sub')}</p>
        </div>
      )}

      <div className={embedded ? 'w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'}>
        {/* Settings console */}
        <div className={`${embedded ? 'md:col-span-7 p-4 sm:p-5' : 'lg:col-span-7 p-5 sm:p-8'} relative bg-[#F6ECD2] border-[3px] border-[#5C140F]`}>
          <KolamCorner position="top-left" size={22} className="absolute top-1.5 left-1.5 opacity-60" />
          <KolamCorner position="top-right" size={22} className="absolute top-1.5 right-1.5 opacity-60" />
          <KolamCorner position="bottom-left" size={22} className="absolute bottom-1.5 left-1.5 opacity-60" />
          <KolamCorner position="bottom-right" size={22} className="absolute bottom-1.5 right-1.5 opacity-60" />

          {/* 1. Variant */}
          <div className={section}>
            <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">{t('setup.game')}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['chaturanga', 'chess'] as Variant[]).map((v) => {
                const sel = variant === v;
                return (
                  <button
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`flex items-center gap-3 p-3 border-2 text-left cursor-pointer transition-all ${sel ? 'border-[#5C140F] bg-white shadow-[3px_3px_0px_0px_#5C140F]' : 'border-[#5C140F]/30 bg-[#E4D19E] hover:bg-white'}`}
                  >
                    <PieceIcon variant={v} letter="K" ivory className="w-8 h-8 shrink-0" />
                    <div>
                      <div className="font-fraunces font-bold text-sm text-[#5C140F]">{variantTitle(v)}</div>
                      <div className="text-[10px] text-[#6B4E3D]">{t(`setup.era.${v}`)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Opponent */}
          <div className={section}>
            <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">{t('setup.opponent')}</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGameMode('PVC')}
                className={`flex items-center justify-center gap-2 py-3 border-2 border-[#5C140F] text-sm font-bold cursor-pointer transition-colors ${gameMode === 'PVC' ? 'bg-[#0E5C58] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
              >
                <Bot className="w-4 h-4" /> {t('setup.ai')}
              </button>
              <button
                onClick={() => setGameMode('PVP')}
                className={`flex items-center justify-center gap-2 py-3 border-2 border-[#5C140F] text-sm font-bold cursor-pointer transition-colors ${gameMode === 'PVP' ? 'bg-[#D8401F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
              >
                <Users className="w-4 h-4" /> {t('setup.pvp')}
              </button>
            </div>
          </div>

          {/* 3. Difficulty + Side (AI only) */}
          {gameMode === 'PVC' && (
            <div className={`${section} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">{t('setup.strength')}</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {DIFF_META.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setDifficulty(d.key)}
                      title={t(`level.hint.${d.level}`)}
                      className={`flex flex-col items-center py-2 border-2 border-[#5C140F] text-[11px] font-bold cursor-pointer transition-colors ${difficulty === d.key ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                    >
                      <span className="text-base leading-none mb-0.5">{d.emoji}</span>
                      {levelName(d.level)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">{t('setup.playAs')}</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setHumanSide(1)}
                    className={`flex items-center justify-center gap-1.5 py-2 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${humanSide === 1 ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#F6ECD2] border-2 border-current" />
                    {sideName(variant, 'w')}
                  </button>
                  <button
                    onClick={() => setHumanSide(-1)}
                    className={`flex items-center justify-center gap-1.5 py-2 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${humanSide === -1 ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#5C140F] border-2 border-[#EFA90C]" />
                    {sideName(variant, 'b')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Board style (Chaturangam only) */}
          {variant === 'chaturanga' && (
            <div className={section}>
              <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B4E3D] mb-2">{t('setup.board')}</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBoardStyle('ashtapada')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${boardStyle === 'ashtapada' ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> {t('setup.ashtapada')}
                </button>
                <button
                  onClick={() => setBoardStyle('checkered')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${boardStyle === 'checkered' ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
                >
                  <Grid3x3 className="w-3.5 h-3.5" /> {t('setup.checkered')}
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
            {t('setup.begin', { title: variantTitle(variant) })}
          </button>
        </div>

        {/* Live board preview — as in the legacy setup screen */}
        <div
          // in the card on a phone the preview would push setup past one screen, so it's left out there
          className={embedded ? 'hidden md:block md:col-span-5 w-full mx-auto' : 'lg:col-span-5 lg:sticky lg:top-20'}
          // the preview's frame, title and caption add ~110px around the board
          style={embedded ? { maxWidth: 'min(26rem, calc(100vh - 110px))' } : undefined}
        >
          <div className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-fraunces font-bold text-sm text-[#5C140F]">{t('setup.preview', { title: variantTitle(variant) })}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B4E3D]">
                {t(`setup.tag.${effectiveBoardStyle}`)}
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
              {t(`setup.cap.${variant}`)}
            </p>
          </div>
        </div>
      </div>

      {!embedded && <div className="mt-5 text-center">
        <button onClick={() => onNavigate('HOME')} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C140F] hover:underline cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('setup.backHome')}</span>
        </button>
      </div>}
    </div>
  );
};
