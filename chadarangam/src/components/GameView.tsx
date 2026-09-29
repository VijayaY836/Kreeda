import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameSettings, KreeduMood, MoveRecord, PieceLetter, Side, ViewTab } from '../types';
import {
  Pos, setStart, ttClear, legalMoves, makeMove, unmakeMove, bestMove,
  inCheck, kingOf, insufficientMaterial, repetitionCount, bareKing,
  mFrom, mTo, mPromo, mFlag, FLAG_EP, LET, P, NAME_OF_SQ,
} from '../utils/chessEngine';
import { moveNotation } from '../utils/notation';
import { PIECE_INFO, PIECE_WORTH, VARIANT_INFO } from '../utils/pieceArt';
import { sounds } from '../utils/soundEngine';
import { t, useLang, sideName, variantTitle, pieceName, levelName, worthLabel } from '../i18n';
import { GameBoard } from './GameBoard';
import { PieceIcon } from './PieceIcon';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, KolamCorner } from './FolkArtMotifs';
import { KreeduMascot } from './KreeduMascot';
import {
  RotateCcw, HelpCircle, Settings, Trophy, History, Bot, User,
  Volume2, VolumeX, X, FlipVertical2, Undo2, Flag, Users, Lightbulb,
} from 'lucide-react';

interface GameViewProps {
  settings: GameSettings;
  onNavigate: (tab: ViewTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  // Inside the KREEDA hub's full-size card: the board fills the card's height
  // and everything else moves to a side column, so the match fits one screen.
  embedded?: boolean;
}

const DIFF_LEVEL: Record<GameSettings['difficulty'], number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

// Kreedu waits at least this long (from the player's move) before answering,
// so the player's own piece finishes sliding and Kreedu's reply is easy to follow.
const AI_MIN_THINK_MS = 1400;

const CHATTER_LINES = 4; // i18n.ts: chat.<variant>.0 … 3

const letterOf = (piece: number): PieceLetter => LET[Math.abs(piece)] as PieceLetter;

export const GameView: React.FC<GameViewProps> = ({ settings, onNavigate, soundEnabled, onToggleSound, embedded = false }) => {
  useLang(); // re-render when the app language changes
  const { variant, gameMode, difficulty, humanSide, boardStyle } = settings;
  const info = VARIANT_INFO[variant];

  const [board, setBoard] = useState<number[]>(() => Array.from(Pos.b));
  const [selected, setSelected] = useState<number | null>(null);
  const [targets, setTargets] = useState<number[]>([]); // legal moves from selected square
  const [lastMove, setLastMove] = useState<{ from: number; to: number; id: number; captured?: number } | null>(null);
  const moveIdRef = useRef(0); // bumps on every move so the board replays its slide
  const [moveLog, setMoveLog] = useState<MoveRecord[]>([]);
  const [capByIvory, setCapByIvory] = useState<PieceLetter[]>([]); // pieces Ivory has captured
  const [capByEbony, setCapByEbony] = useState<PieceLetter[]>([]);
  const [over, setOver] = useState(false);
  // outcome drives Kreedu's mood on the game-over card; kicker/title/text are already translated
  const [result, setResult] = useState<{ kicker: string; title: string; text: string; outcome: 'you' | 'kreedu' | 'side' | 'draw' } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [pendingPromo, setPendingPromo] = useState<number[] | null>(null);
  const [kreeduMood, setKreeduMood] = useState<KreeduMood>('IDLE');
  const [kreeduLine, setKreeduLine] = useState('');
  const [hints, setHints] = useState(true);
  const [flipped, setFlipped] = useState(humanSide < 0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Tracks the single in-flight "Kreedu is thinking" timer, if any. A plain
  // boolean busy-flag isn't enough here: resetGame() and the "AI moves
  // first" effect below can both re-fire (React StrictMode's dev-mode
  // double-invoke of effects is the reliable way to reproduce it) and a
  // flag that resetGame() unconditionally clears lets a second timer slip
  // through — which then computes a move for whichever side happens to be
  // "current" once it fires, i.e. Kreedu silently playing the human's turn
  // too. Storing the actual timer id and cancelling it on every reset closes
  // that race: at most one timer can ever be pending.
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearAiTimer = () => {
    if (aiTimerRef.current !== null) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  };

  const syncBoard = () => setBoard(Array.from(Pos.b));

  const resetGame = useCallback(() => {
    clearAiTimer();
    setStart(variant);
    ttClear();
    setBoard(Array.from(Pos.b));
    setSelected(null); setTargets([]); setLastMove(null);
    setMoveLog([]); setCapByIvory([]); setCapByEbony([]);
    setOver(false); setResult(null); setThinking(false); setPendingPromo(null);
    setKreeduMood('IDLE');
    setFlipped(humanSide < 0);
    setKreeduLine(
      gameMode === 'PVC'
        ? t('g.reset.pvc', { side: sideName(variant, humanSide > 0 ? 'w' : 'b'), first: sideName(variant, 'w') })
        : t('g.reset.pvp', { first: sideName(variant, 'w') })
    );
  }, [variant, gameMode, humanSide, info]);

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, gameMode, difficulty, humanSide]);

  const checkedSq = over ? -1 : (inCheck(Pos.side) ? kingOf(Pos.side) : -1);

  const finish = (winner: number | null, title: string, text: string) => {
    setOver(true); setSelected(null); setTargets([]);
    const outcome = winner === null ? 'draw' : gameMode === 'PVC' ? (winner === humanSide ? 'you' : 'kreedu') : 'side';
    const kicker = outcome === 'draw' ? t('g.k.draw') : outcome === 'you' ? t('g.k.you') : outcome === 'kreedu' ? t('g.k.kreedu')
      : t('g.k.side', { side: sideName(variant, winner! > 0 ? 'w' : 'b') }).toUpperCase();
    setResult({ kicker, title, text, outcome });
    if (winner === null) sounds.playDraw();
    else if (gameMode === 'PVC' && winner === humanSide) sounds.playVictory();
    else if (gameMode === 'PVC') sounds.playDefeat();
    else sounds.playVictory();
    setKreeduLine(title + '.');
    return true;
  };

  const checkEnd = (mover: number): boolean => {
    const opp = Pos.side;
    const replies = legalMoves();
    const checked = inCheck(opp);
    const names = { opp: sideName(variant, opp > 0 ? 'w' : 'b'), mover: sideName(variant, mover > 0 ? 'w' : 'b') };
    const end = (winner: number | null, key: string) => finish(winner, t(`g.end.${key}`), t(`g.end.${key}.t`, names));
    if (!replies.length) {
      if (checked) return end(mover, 'mate');
      if (variant === 'chess') return end(null, 'staleDraw');
      return end(mover, 'staleWin');
    }
    if (variant === 'chess') {
      if (insufficientMaterial()) return end(null, 'material');
      if (Pos.half >= 100) return end(null, 'fifty');
      if (repetitionCount() >= 2) return end(null, 'threefold');
    } else {
      if (bareKing(opp) && !bareKing(mover)) {
        const canEven = replies.some(mv => { makeMove(mv); const r = bareKing(mover); unmakeMove(); return r; });
        if (canEven) return end(null, 'bothBare');
        return end(mover, 'bare');
      }
    }
    return false;
  };

  const scheduleAI = useCallback(() => {
    if (aiTimerRef.current !== null) return;
    setThinking(true);
    setKreeduMood('THINKING');
    setKreeduLine(t('g.reading'));
    const started = performance.now();
    aiTimerRef.current = setTimeout(() => {
      const m = bestMove(DIFF_LEVEL[difficulty]);
      if (!m) { aiTimerRef.current = null; setThinking(false); return; }
      // The search can be near-instant; hold the reply until the minimum
      // think time has passed. Same ref, so resetGame() still cancels it.
      const wait = Math.max(0, AI_MIN_THINK_MS - (performance.now() - started));
      aiTimerRef.current = setTimeout(() => {
        aiTimerRef.current = null;
        applyMove(m);
        setThinking(false);
      }, wait);
    }, 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  // If Kreedu is Ivory (human chose Ebony), it must make the opening move —
  // resetGame() above has already run by the time this fires, so Pos.side
  // reflects the fresh position synchronously.
  useEffect(() => {
    if (gameMode === 'PVC' && Pos.side !== humanSide) {
      scheduleAI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, gameMode, difficulty, humanSide]);

  // Cancel any in-flight "Kreedu is thinking" timer if the player navigates
  // away mid-think, so it can't fire against an unmounted board.
  useEffect(() => clearAiTimer, []);

  const applyMove = (m: number) => {
    const mover = Pos.side;
    const from = mFrom(m), to = mTo(m), flag = mFlag(m);
    const capPiece = flag === FLAG_EP ? mover * -P : Pos.b[to];
    const san = moveNotation(m);
    let capLetter: PieceLetter | null = null;
    if (capPiece) {
      capLetter = letterOf(capPiece);
      if (mover > 0) setCapByIvory(prev => [...prev, capLetter!]);
      else setCapByEbony(prev => [...prev, capLetter!]);
    }

    const movedLetter = letterOf(Pos.b[from]);
    makeMove(m);
    syncBoard();
    setMoveLog(prev => [{ id: Math.random().toString(36).slice(2, 9), moveNumber: prev.length + 1, side: mover as Side, san, capturedLetter: capLetter }, ...prev]);
    // en passant takes a pawn from beside the destination, so there's nothing to fade out on it
    setLastMove({ from, to, id: ++moveIdRef.current, captured: capPiece && flag !== FLAG_EP ? capPiece : undefined });

    // Spell out what just moved, e.g. "Kreedu moved Ashva b8 → c6, taking your Padati."
    const who = gameMode === 'PVC' ? (mover === humanSide ? 'you' : 'kreedu') : 'side';
    const movedText = t(`g.moved.${who}${capLetter ? '.take' : ''}`, {
      side: sideName(variant, mover > 0 ? 'w' : 'b'),
      piece: pieceName(variant, movedLetter), from: NAME_OF_SQ(from), to: NAME_OF_SQ(to),
      captured: capLetter ? pieceName(variant, capLetter) : '',
    });
    setSelected(null); setTargets([]);

    if (capPiece) sounds.playCapture(); else sounds.playMove();
    if (mPromo(m)) sounds.playPromote();

    if (checkEnd(mover)) return;

    const checked = inCheck(Pos.side);
    if (checked) {
      sounds.playCheck();
      setKreeduMood(gameMode === 'PVC' && Pos.side === humanSide ? 'WORRIED' : 'IDLE');
    } else {
      setKreeduMood('IDLE');
    }
    const toMove = sideName(variant, Pos.side > 0 ? 'w' : 'b');
    const checkText = checked ? ` ${t('g.check', { side: toMove })}` : '';

    if (gameMode === 'PVC' && Pos.side !== humanSide) {
      scheduleAI();
    } else if (gameMode === 'PVC') {
      // Kreedu just moved: say exactly what, sometimes with a bit of table talk
      const chatter = !checked && Math.random() < 0.3 ? ` ${t(`chat.${variant}.${Math.floor(Math.random() * CHATTER_LINES)}`)}` : '';
      setKreeduLine(`${movedText}.${checkText}${chatter}`);
    } else {
      setKreeduLine(`${movedText}.${checkText || ` ${t('g.toMove', { side: toMove })}.`}`);
    }
  };

  const handleSquareClick = (i: number) => {
    if (over || thinking || pendingPromo) return;
    if (gameMode === 'PVC' && Pos.side !== humanSide) return;

    const hits = targets.filter(m => mTo(m) === i);
    if (hits.length) {
      if (hits.length > 1 && variant === 'chess') { setPendingPromo(hits); return; }
      applyMove(hits[0]);
      return;
    }

    const p = Pos.b[i];
    if (p && (p > 0) === (Pos.side > 0)) {
      if (selected === i) { setSelected(null); setTargets([]); }
      else {
        setSelected(i);
        setTargets(legalMoves().filter(m => mFrom(m) === i));
      }
    } else {
      setSelected(null); setTargets([]);
    }
  };

  const targetSquares = new Set(targets.map(mTo).filter(sq => !Pos.b[sq]));
  const captureSquares = new Set(targets.map(mTo).filter(sq => !!Pos.b[sq]));

  const undoMove = () => {
    if (thinking || !moveLog.length || !Pos.stack.length) return;
    let remaining = moveLog; // newest-first; remaining[0] mirrors the top of Pos.stack
    const popOne = () => {
      if (!Pos.stack.length) return;
      unmakeMove();
      remaining = remaining.slice(1);
    };
    popOne();
    if (gameMode === 'PVC') {
      while (Pos.side !== humanSide && Pos.stack.length) popOne();
    }
    syncBoard();
    setMoveLog(remaining);

    const ivory: PieceLetter[] = [], ebony: PieceLetter[] = [];
    remaining.slice().reverse().forEach(rec => {
      if (rec.capturedLetter) (rec.side > 0 ? ivory : ebony).push(rec.capturedLetter);
    });
    setCapByIvory(ivory); setCapByEbony(ebony);
    setOver(false); setResult(null); setSelected(null); setTargets([]);
    setLastMove(null);
    setKreeduLine(t('g.undone'));
    clearAiTimer();
  };

  const resign = () => {
    if (over) return;
    const loser = gameMode === 'PVC' ? humanSide : Pos.side;
    const loserName = sideName(variant, loser > 0 ? 'w' : 'b');
    const winnerName = sideName(variant, loser > 0 ? 'b' : 'w');
    finish(-loser, t('g.end.resign'), t('g.end.resign.t', { loser: loserName, winner: winnerName }));
  };

  const yourTurn = gameMode === 'PVP' ? true : Pos.side === humanSide;
  const turnLabel = over
    ? t('g.turn.over')
    : gameMode === 'PVC'
    ? (yourTurn ? t('g.turn.you') : t('g.turn.thinking'))
    : t('g.toMove', { side: sideName(variant, Pos.side > 0 ? 'w' : 'b') });

  const capWorth = (list: PieceLetter[]) => list.reduce((s, t) => s + (PIECE_WORTH[t] ?? 0), 0);
  const diff = capWorth(capByIvory) - capWorth(capByEbony);

  const utilityBar = (
    <div className={`${embedded ? 'p-2.5' : 'mb-4 p-3 sm:p-4'} bg-[#FAF4E5] border-[3px] border-[#5C140F] flex flex-wrap items-center justify-between gap-3`}>
      {/* in the card, the card's own title names the game and the opponent panel shows the level */}
      {!embedded && (
        <div className="flex items-center gap-2">
          <span className="font-fraunces font-bold text-sm text-[#5C140F]">{variantTitle(variant)}</span>
          <span className="font-telugu text-sm text-[#D9587B]">{variant === 'chaturanga' ? 'చతురంగం' : ''}</span>
          <span className="px-2 py-0.5 bg-[#E4D19E] border border-[#5C140F] text-[10px] font-bold text-[#2B1B12] uppercase">
            {gameMode === 'PVC' ? `${t('kreedu')} · ${levelName(DIFF_LEVEL[difficulty])}` : t('setup.pvp')}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <button onClick={() => onNavigate('MODE_SELECT')} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F6ECD2] hover:bg-white border-[1.5px] border-[#5C140F] text-xs font-bold text-[#5C140F] cursor-pointer">
          <Users className="w-3.5 h-3.5 text-[#D8401F]" />
          <span>{t('g.changeSetup')}</span>
        </button>
        <button onClick={resetGame} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('g.restart')}</span>
        </button>
        <button onClick={undoMove} disabled={!moveLog.length || thinking} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Undo2 className="w-3.5 h-3.5" />
          <span>{t('g.undo')}</span>
        </button>
        {gameMode === 'PVP' && (
          <button onClick={() => setFlipped(f => !f)} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer">
            <FlipVertical2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('g.flip')}</span>
          </button>
        )}
        <button onClick={() => setHints(h => !h)} className={`flex items-center gap-1 px-2.5 py-1.5 border-[1.5px] border-[#5C140F] text-xs font-bold cursor-pointer ${hints ? 'bg-[#0E5C58] text-white' : 'bg-[#E4D19E] text-[#2B1B12]'}`}>
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('g.hints')}</span>
        </button>
        <button onClick={onToggleSound} className="w-8 h-8 flex items-center justify-center bg-[#F6ECD2] hover:bg-white border-[1.5px] border-[#5C140F] text-[#5C140F] cursor-pointer">
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
        </button>
        <button onClick={() => setShowHelp(true)} className="w-8 h-8 flex items-center justify-center bg-[#F6ECD2] hover:bg-white border-[1.5px] border-[#5C140F] text-[#5C140F] cursor-pointer">
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setShowSettings(true)} className="w-8 h-8 flex items-center justify-center bg-[#F6ECD2] hover:bg-white border-[1.5px] border-[#5C140F] text-[#5C140F] cursor-pointer">
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button onClick={resign} disabled={over} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#D9587B]/20 hover:bg-[#D9587B]/35 border-[1.5px] border-[#5C140F] text-xs font-bold text-[#5C140F] cursor-pointer disabled:opacity-40">
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('g.resign')}</span>
        </button>
      </div>
    </div>
  );

  const statusBanner = (
    <div className={`${embedded ? 'flex-nowrap p-3' : 'mb-4 flex-wrap p-3 sm:p-4'} flex items-center justify-between gap-3 border-[3px] border-[#5C140F] ${checkedSq >= 0 ? 'bg-[#D9587B]/20' : 'bg-[#F6ECD2]'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-5 h-5 rounded-full border-2 border-[#5C140F] shrink-0 ${Pos.side > 0 ? 'bg-[#F6ECD2]' : 'bg-[#5C140F]'}`} />
        <div>
          <span className="font-fraunces font-bold text-base sm:text-lg text-[#5C140F]">{turnLabel}</span>
          <p className="text-xs text-[#6B4E3D] font-medium">{kreeduLine}</p>
        </div>
      </div>
      <div className="text-xs font-bold text-[#5C140F] shrink-0">{t('g.moveN', { n: Pos.full })}</div>
    </div>
  );

  const boardEl = (
    <GameBoard
      variant={variant}
      board={board}
      boardStyle={boardStyle}
      selected={selected}
      targetSquares={targetSquares}
      captureSquares={captureSquares}
      lastMove={lastMove}
      checkedSq={checkedSq}
      flipped={flipped}
      hints={hints}
      disabled={over || thinking || !!pendingPromo || (gameMode === 'PVC' && Pos.side !== humanSide)}
      onSquareClick={handleSquareClick}
      letterOf={letterOf}
      fluid={embedded}
    />
  );

  const capturesStrip = (
    <div className={embedded ? 'grid grid-cols-2 gap-3' : 'w-full max-w-140 mt-4 grid grid-cols-2 gap-3'}>
      <div className="border-2 border-[#5C140F] p-2.5 bg-[#F6ECD2]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-[#5C140F]">{t('g.captured', { side: sideName(variant, 'w') })}</span>
          {diff > 0 && <span className="text-[10px] font-bold text-[#D8401F]">+{diff}</span>}
        </div>
        <div className="flex flex-wrap gap-1 min-h-5">
          {capByIvory.length === 0 && <span className="text-[10px] italic text-[#6B4E3D]">{t('g.nothing')}</span>}
          {capByIvory.map((t, idx) => (
            <PieceIcon key={idx} variant={variant} letter={t} ivory={false} className="w-4 h-4" />
          ))}
        </div>
      </div>
      <div className="border-2 border-[#5C140F] p-2.5 bg-[#F6ECD2]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-[#5C140F]">{t('g.captured', { side: sideName(variant, 'b') })}</span>
          {diff < 0 && <span className="text-[10px] font-bold text-[#5C140F]">+{-diff}</span>}
        </div>
        <div className="flex flex-wrap gap-1 min-h-5">
          {capByEbony.length === 0 && <span className="text-[10px] italic text-[#6B4E3D]">{t('g.nothing')}</span>}
          {capByEbony.map((t, idx) => (
            <PieceIcon key={idx} variant={variant} letter={t} ivory className="w-4 h-4" />
          ))}
        </div>
      </div>
    </div>
  );

  const opponentPanel = embedded ? (
    // One row: Kreedu's line already shows in the status banner above.
    <FolkArtFrame bg="bg-[#F6ECD2]" hasCorners={false} className="p-3!">
      <div className="flex items-center gap-3">
        {gameMode === 'PVC' ? (
          <KreeduMascot mood={kreeduMood} size={44} />
        ) : (
          <User className="w-5 h-5 text-[#D8401F] shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <span className="font-fraunces font-bold text-sm text-[#5C140F]">
            {gameMode === 'PVC' ? t('kreedu') : t('g.pvpTitle')}
          </span>
          <p className="text-[11px] text-[#6B4E3D] leading-snug">
            {gameMode === 'PVP' ? t('g.pass') : t(`g.diff.${difficulty}`)}
          </p>
        </div>
        {gameMode === 'PVC' && (
          <span className="px-2 py-0.5 bg-[#E4D19E] border border-[#5C140F] text-[10px] font-bold text-[#2B1B12] uppercase shrink-0">
            {levelName(DIFF_LEVEL[difficulty])}
          </span>
        )}
      </div>
    </FolkArtFrame>
  ) : (
    <>
      {gameMode === 'PVC' ? (
        <FolkArtFrame bg="bg-[#F6ECD2]" className="p-4 sm:p-5">
          <div className="flex items-center justify-between border-b-2 border-[#5C140F] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#0E5C58]" />
              <span className="font-fraunces font-bold text-sm text-[#5C140F]">{t('g.aiOpponent')}</span>
            </div>
            <span className="px-2 py-0.5 bg-[#E4D19E] border border-[#5C140F] text-[10px] font-bold text-[#2B1B12] uppercase">
              {levelName(DIFF_LEVEL[difficulty])}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <KreeduMascot mood={kreeduMood} size={64} showDialogBubble dialogText={kreeduLine} />
            <div className="text-xs text-[#2B1B12] space-y-1">
              <p className="font-bold text-[#5C140F]">{t('g.search')}</p>
              <p className="text-[11px] text-[#6B4E3D]">
                {t(`g.diffLong.${difficulty}`)}
              </p>
            </div>
          </div>
        </FolkArtFrame>
      ) : (
        <FolkArtFrame bg="bg-[#F6ECD2]" className="p-4 sm:p-5">
          <div className="flex items-center gap-2 border-b-2 border-[#5C140F] pb-2 mb-3">
            <User className="w-4 h-4 text-[#D8401F]" />
            <span className="font-fraunces font-bold text-sm text-[#5C140F]">{t('g.pvpTitle')}</span>
          </div>
          <p className="text-xs text-[#2B1B12]">{t('g.pass')} {kreeduLine}</p>
        </FolkArtFrame>
      )}
    </>
  );

  const moveLogPanel = (
    // in the card on a phone there's no room left for the log, so it's left out there
    <FolkArtFrame bg="bg-[#F6ECD2]" className={`p-4 flex-1 flex-col${embedded ? ' p-3! hidden md:flex md:min-h-20' : ' flex'}`}>
      <div className="flex items-center gap-2 border-b-2 border-[#5C140F] pb-2 mb-2">
        <History className="w-4 h-4 text-[#5C140F]" />
        <h4 className="font-fraunces text-sm font-bold text-[#5C140F]">{t('g.log', { n: moveLog.length })}</h4>
      </div>
      {/* in the card the log fills the side column's leftover height */}
      <div className={`${embedded ? 'flex-1 min-h-0' : 'max-h-65'} overflow-y-auto space-y-1 pr-1 text-xs`}>
        {moveLog.length === 0 ? (
          <p className="text-center py-4 text-xs italic text-[#6B4E3D]">{t('g.logEmpty')}</p>
        ) : (
          moveLog.slice().reverse().map((rec, idx) => (
            <div key={rec.id} className={`px-2 py-1.5 border-[1.5px] border-[#5C140F] flex items-center justify-between ${idx % 2 === 0 ? 'bg-[#E4D19E]' : 'bg-[#F6ECD2]'}`}>
              <span className="font-mono text-[10px] text-[#6B4E3D] w-7">#{rec.moveNumber}</span>
              <span className="font-bold text-[#2B1B12] flex-1 text-center">{rec.san}</span>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border border-[#5C140F] ${rec.side > 0 ? 'bg-[#F6ECD2] text-[#5C140F]' : 'bg-[#5C140F] text-white'}`}>
                {rec.side > 0 ? 'W' : 'B'}
              </span>
            </div>
          ))
        )}
      </div>
    </FolkArtFrame>
  );

  return (
    <>
      {embedded ? (
        // Board on the left at the card's full height; the rest in a side
        // column whose move log takes up whatever height is left over.
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-[auto_minmax(280px,360px)] gap-5 justify-center md:items-stretch">
            <div className="embed-board mx-auto">{boardEl}</div>
            {/* capped at the card's height (minus padding) so the move log shrinks rather than overflowing */}
            <div className="flex flex-col gap-3 md:min-h-0 md:max-h-[calc(100vh-2rem)]">
              {utilityBar}
              {statusBanner}
              {capturesStrip}
              {opponentPanel}
              {moveLogPanel}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6">
          {utilityBar}
          {statusBanner}

          {/* Board + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 flex flex-col items-center">
              {boardEl}
              {capturesStrip}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              {opponentPanel}
              {moveLogPanel}
            </div>
          </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {pendingPromo && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F6ECD2] border-4 border-[#5C140F] p-6 text-center">
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mb-4">{t('g.promote')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {pendingPromo.slice().sort((a, b) => mPromo(b) - mPromo(a)).map((m) => {
                const letter = LET[mPromo(m)] as PieceLetter;
                return (
                  <button
                    key={m}
                    onClick={() => { const mv = m; setPendingPromo(null); applyMove(mv); }}
                    className="flex flex-col items-center gap-1.5 p-3 bg-[#E4D19E] hover:bg-white border-2 border-[#5C140F] cursor-pointer"
                  >
                    <PieceIcon variant="chess" letter={letter} ivory={Pos.side > 0} className="w-10 h-10" />
                    <span className="text-xs font-bold text-[#5C140F]">{pieceName('chess', letter)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL */}
      {result && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#F6ECD2] border-4 border-[#5C140F] p-6 text-center relative">
            <KolamCorner position="top-left" size={28} className="absolute top-1 left-1" />
            <KolamCorner position="top-right" size={28} className="absolute top-1 right-1" />
            <KolamCorner position="bottom-left" size={28} className="absolute bottom-1 left-1" />
            <KolamCorner position="bottom-right" size={28} className="absolute bottom-1 right-1" />

            <div className="flex justify-center mb-3">
              {result.outcome === 'you' || result.outcome === 'side' ? (
                <div className="p-3 bg-[#D8401F] border-2 border-[#5C140F] text-white">
                  <Trophy className="w-10 h-10" />
                </div>
              ) : (
                <KreeduMascot mood="WIN" size={72} />
              )}
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-[#D8401F] mb-1">{result.kicker}</p>
            <h3 className="font-fraunces text-3xl font-extrabold text-[#5C140F] mb-2">{result.title}</h3>
            <p className="text-sm text-[#2B1B12] font-medium mb-6">{result.text}</p>

            <div className="flex flex-col gap-2">
              <button onClick={resetGame} className="w-full py-3 bg-[#D8401F] hover:bg-[#B83215] text-white border-[3px] border-[#5C140F] font-bold text-sm tracking-wide uppercase cursor-pointer">
                {t('g.again')}
              </button>
              <button onClick={() => onNavigate('MODE_SELECT')} className="w-full py-2.5 bg-[#F6ECD2] hover:bg-white border-2 border-[#5C140F] text-xs font-bold text-[#5C140F] uppercase cursor-pointer">
                {t('g.changeSetup')}
              </button>
              <button onClick={() => onNavigate('HOME')} className="w-full py-2 bg-[#E4D19E] hover:bg-[#F6ECD2] border-2 border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer">
                {t('home')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F6ECD2] border-4 border-[#5C140F] p-6 relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-3 right-3 p-1.5 bg-[#E4D19E] border-2 border-[#5C140F] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mb-4">{t('g.settingsTitle')}</h3>
            <div className="space-y-3 text-xs text-[#2B1B12]">
              <div className="flex items-center justify-between p-3 bg-[#E4D19E] border-2 border-[#5C140F]">
                <span className="font-bold text-[#5C140F]">{t('g.moveHints')}</span>
                <button onClick={() => setHints(h => !h)} className="px-3 py-1 bg-[#F6ECD2] border-[1.5px] border-[#5C140F] font-bold text-xs cursor-pointer">
                  {hints ? t('g.on') : t('g.off')}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#E4D19E] border-2 border-[#5C140F]">
                <span className="font-bold text-[#5C140F]">{t('g.sfx')}</span>
                <button onClick={onToggleSound} className="px-3 py-1 bg-[#F6ECD2] border-[1.5px] border-[#5C140F] font-bold text-xs cursor-pointer">
                  {soundEnabled ? t('g.enabled') : t('g.muted')}
                </button>
              </div>
              <p className="text-[11px] text-[#6B4E3D] px-1">{t('g.settingsNote')}</p>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full mt-4 py-2.5 bg-[#D8401F] hover:bg-[#B83215] text-white border-2 border-[#5C140F] font-bold text-xs uppercase cursor-pointer">
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#F6ECD2] border-4 border-[#5C140F] p-6 max-h-[85vh] overflow-y-auto relative">
            <button onClick={() => setShowHelp(false)} className="absolute top-3 right-3 p-1.5 bg-[#E4D19E] border-2 border-[#5C140F] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-2">{t('g.quickRef', { title: variantTitle(variant) })}</h3>
            <FolkDivider className="mb-3" />
            <div className="space-y-2.5 text-xs text-[#2B1B12] leading-relaxed">
              {(Object.entries(PIECE_INFO[variant]) as [PieceLetter, (typeof PIECE_INFO)['chess']['P']][]).map(([letter, pinfo]) => (
                <div key={letter} className="p-2.5 bg-[#E4D19E] border-2 border-[#5C140F] flex items-start gap-3">
                  <PieceIcon variant={variant} letter={letter} ivory className="w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-[#5C140F]">{pieceName(variant, letter)}{pinfo!.t && pinfo!.t !== pieceName(variant, letter) ? ` · ${pinfo!.t}` : ''} <span className="font-normal text-[#6B4E3D]">— {worthLabel(pinfo!.worth)}</span></h4>
                    <p>{pinfo!.how}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full mt-4 py-2.5 bg-[#D8401F] text-white border-2 border-[#5C140F] text-xs font-bold uppercase cursor-pointer">
              {t('g.backToGame')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
