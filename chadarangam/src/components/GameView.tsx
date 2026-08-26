import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameSettings, KreeduMood, MoveRecord, PieceLetter, Side, ViewTab } from '../types';
import {
  Pos, setStart, legalMoves, makeMove, unmakeMove, bestMove,
  inCheck, kingOf, insufficientMaterial, repetitionCount, bareKing,
  mFrom, mTo, mPromo, mFlag, FLAG_EP, LET, LEVEL_NAMES, P,
} from '../utils/chessEngine';
import { moveNotation } from '../utils/notation';
import { PIECE_INFO, PIECE_WORTH, VARIANT_INFO } from '../utils/pieceArt';
import { sounds } from '../utils/soundEngine';
import { GameBoard } from './GameBoard';
import { PieceIcon } from './PieceIcon';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, KolamCorner } from './FolkArtMotifs';
import { KreeduMascot } from './KreeduMascot';
import {
  RotateCcw, HelpCircle, Settings, Trophy, History, Bot, User,
  Volume2, VolumeX, X, FlipVertical2, Undo2, Flag, Users,
} from 'lucide-react';

interface GameViewProps {
  settings: GameSettings;
  onNavigate: (tab: ViewTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const DIFF_LEVEL: Record<GameSettings['difficulty'], number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

const CHATTER: Record<string, string[]> = {
  chaturanga: [
    'The chariots are the only pieces that reach across this board — mind them.',
    'Elephants touch only eight squares in the whole game. Odd creatures.',
    'No queen here. Everything has to be built one square at a time.',
    'Your Raja can walk into the fight — nothing here punishes it from afar.',
  ],
  chess: [
    'Knights before bishops, usually. Usually.',
    'A rook on an open file does more work than two minor pieces shuffling.',
    'If you are ahead on material, trade pieces and keep pawns.',
    'Every check I give you is a move I am not developing with.',
  ],
};

const letterOf = (piece: number): PieceLetter => LET[Math.abs(piece)] as PieceLetter;

export const GameView: React.FC<GameViewProps> = ({ settings, onNavigate, soundEnabled, onToggleSound }) => {
  const { variant, gameMode, difficulty, humanSide, boardStyle } = settings;
  const info = VARIANT_INFO[variant];

  const [board, setBoard] = useState<number[]>(() => Array.from(Pos.b));
  const [selected, setSelected] = useState<number | null>(null);
  const [targets, setTargets] = useState<number[]>([]); // legal moves from selected square
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
  const [moveLog, setMoveLog] = useState<MoveRecord[]>([]);
  const [capByIvory, setCapByIvory] = useState<PieceLetter[]>([]); // pieces Ivory has captured
  const [capByEbony, setCapByEbony] = useState<PieceLetter[]>([]);
  const [over, setOver] = useState(false);
  const [result, setResult] = useState<{ kicker: string; title: string; text: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [pendingPromo, setPendingPromo] = useState<number[] | null>(null);
  const [kreeduMood, setKreeduMood] = useState<KreeduMood>('IDLE');
  const [kreeduLine, setKreeduLine] = useState('');
  const [hints, setHints] = useState(true);
  const [flipped, setFlipped] = useState(humanSide < 0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const aiBusyRef = useRef(false);

  const syncBoard = () => setBoard(Array.from(Pos.b));

  const resetGame = useCallback(() => {
    setStart(variant);
    setBoard(Array.from(Pos.b));
    setSelected(null); setTargets([]); setLastMove(null);
    setMoveLog([]); setCapByIvory([]); setCapByEbony([]);
    setOver(false); setResult(null); setThinking(false); setPendingPromo(null);
    setKreeduMood('IDLE');
    setFlipped(humanSide < 0);
    aiBusyRef.current = false;
    setKreeduLine(
      gameMode === 'PVC'
        ? `You command ${humanSide > 0 ? info.sides.w : info.sides.b}. ${info.sides.w} always moves first.`
        : `${info.sides.w} moves first. Tap a piece to see where it can go.`
    );
  }, [variant, gameMode, humanSide, info]);

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, gameMode, difficulty, humanSide]);

  const checkedSq = over ? -1 : (inCheck(Pos.side) ? kingOf(Pos.side) : -1);

  const finish = (winner: number | null, title: string, text: string) => {
    setOver(true); setSelected(null); setTargets([]);
    let kicker = 'GAME OVER';
    if (winner !== null && gameMode === 'PVC') kicker = winner === humanSide ? 'YOU WIN' : 'KREEDU WINS';
    else if (winner !== null) kicker = (winner > 0 ? info.sides.w : info.sides.b).toUpperCase() + ' WINS';
    else kicker = 'DRAWN';
    setResult({ kicker, title, text });
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
    const oppName = opp > 0 ? info.sides.w : info.sides.b;
    const moverName = mover > 0 ? info.sides.w : info.sides.b;
    if (!replies.length) {
      if (checked) return finish(mover, 'Checkmate', `${oppName} is attacked with nowhere to go. ${moverName} wins.`);
      if (variant === 'chess') return finish(null, 'Stalemate — a draw', `${oppName} has no legal move but is not in check. Modern chess scores that as a draw.`);
      return finish(mover, 'Stalemate — a win', `${oppName} has no legal move but is not in check. Under Shatranj rules that is a victory for ${moverName}, not a draw.`);
    }
    if (variant === 'chess') {
      if (insufficientMaterial()) return finish(null, 'Draw — not enough material', 'Neither side has the material left to force checkmate.');
      if (Pos.half >= 100) return finish(null, 'Draw — fifty-move rule', 'Fifty moves each without a capture or a pawn move.');
      if (repetitionCount() >= 2) return finish(null, 'Draw — threefold repetition', 'The same position has appeared three times.');
    } else {
      if (bareKing(opp) && !bareKing(mover)) {
        const canEven = replies.some(mv => { makeMove(mv); const r = bareKing(mover); unmakeMove(); return r; });
        if (canEven) return finish(null, 'Drawn — both Rajas bared', `${oppName} is down to a lone Raja but can strip ${moverName} bare in reply. The old rule calls that a draw.`);
        return finish(mover, 'Raja bared', `${oppName} has nothing left but the Raja. ${moverName} wins.`);
      }
    }
    return false;
  };

  const scheduleAI = useCallback(() => {
    if (aiBusyRef.current) return;
    aiBusyRef.current = true;
    setThinking(true);
    setKreeduMood('THINKING');
    setKreeduLine('Kreedu is reading the board…');
    setTimeout(() => {
      const m = bestMove(DIFF_LEVEL[difficulty]);
      if (!m) { setThinking(false); aiBusyRef.current = false; return; }
      applyMove(m);
      setThinking(false);
      aiBusyRef.current = false;
    }, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

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

    makeMove(m);
    syncBoard();
    setMoveLog(prev => [{ id: Math.random().toString(36).slice(2, 9), moveNumber: prev.length + 1, side: mover as Side, san, capturedLetter: capLetter }, ...prev]);
    setLastMove({ from, to });
    setSelected(null); setTargets([]);

    if (capPiece) sounds.playCapture(); else sounds.playMove();
    if (mPromo(m)) sounds.playPromote();

    if (checkEnd(mover)) return;

    if (inCheck(Pos.side)) {
      sounds.playCheck();
      const name = Pos.side > 0 ? info.sides.w : info.sides.b;
      setKreeduLine(`${name} is in check — that must be answered this turn.`);
      setKreeduMood(gameMode === 'PVC' && Pos.side === humanSide ? 'WORRIED' : 'IDLE');
    } else {
      setKreeduMood('IDLE');
      if (gameMode === 'PVP') {
        const name = Pos.side > 0 ? info.sides.w : info.sides.b;
        setKreeduLine(`${name} to move.`);
      }
    }

    if (gameMode === 'PVC' && Pos.side !== humanSide) {
      scheduleAI();
    } else if (gameMode === 'PVC') {
      const pool = CHATTER[variant];
      setKreeduLine(Math.random() < 0.3 ? pool[Math.floor(Math.random() * pool.length)] : 'Your move.');
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
    setKreeduLine('Move taken back.');
    aiBusyRef.current = false;
  };

  const resign = () => {
    if (over) return;
    const loser = gameMode === 'PVC' ? humanSide : Pos.side;
    const loserName = loser > 0 ? info.sides.w : info.sides.b;
    const winnerName = loser > 0 ? info.sides.b : info.sides.w;
    finish(-loser, 'Resignation', `${loserName} resigns. ${winnerName} wins.`);
  };

  const yourTurn = gameMode === 'PVP' ? true : Pos.side === humanSide;
  const turnLabel = over
    ? 'Game over'
    : gameMode === 'PVC'
    ? (yourTurn ? 'Your move' : 'Kreedu is thinking…')
    : `${Pos.side > 0 ? info.sides.w : info.sides.b} to move`;

  const capWorth = (list: PieceLetter[]) => list.reduce((s, t) => s + (PIECE_WORTH[t] ?? 0), 0);
  const diff = capWorth(capByIvory) - capWorth(capByEbony);

  return (
    <div className="max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6">
      {/* Utility bar */}
      <div className="mb-4 bg-[#FAF4E5] border-[3px] border-[#5C140F] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-fraunces font-bold text-sm text-[#5C140F]">{info.title}</span>
          <span className="font-telugu text-sm text-[#D9587B]">{variant === 'chaturanga' ? 'చతురంగం' : ''}</span>
          <span className="px-2 py-0.5 bg-[#E4D19E] border border-[#5C140F] text-[10px] font-bold text-[#2B1B12] uppercase">
            {gameMode === 'PVC' ? `vs Kreedu · ${LEVEL_NAMES[DIFF_LEVEL[difficulty]]}` : '2 Players'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => onNavigate('MODE_SELECT')} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F6ECD2] hover:bg-white border-[1.5px] border-[#5C140F] text-xs font-bold text-[#5C140F] cursor-pointer">
            <Users className="w-3.5 h-3.5 text-[#D8401F]" />
            <span>Change Setup</span>
          </button>
          <button onClick={resetGame} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
          <button onClick={undoMove} disabled={!moveLog.length || thinking} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          {gameMode === 'PVP' && (
            <button onClick={() => setFlipped(f => !f)} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer">
              <FlipVertical2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flip</span>
            </button>
          )}
          <button onClick={() => setHints(h => !h)} className={`flex items-center gap-1 px-2.5 py-1.5 border-[1.5px] border-[#5C140F] text-xs font-bold cursor-pointer ${hints ? 'bg-[#0E5C58] text-white' : 'bg-[#E4D19E] text-[#2B1B12]'}`}>
            <span className="hidden sm:inline">Hints</span>
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
            <span className="hidden sm:inline">Resign</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 border-[3px] border-[#5C140F] p-3 sm:p-4 ${checkedSq >= 0 ? 'bg-[#D9587B]/20' : 'bg-[#F6ECD2]'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full border-2 border-[#5C140F] shrink-0 ${Pos.side > 0 ? 'bg-[#F6ECD2]' : 'bg-[#5C140F]'}`} />
          <div>
            <span className="font-fraunces font-bold text-base sm:text-lg text-[#5C140F]">{turnLabel}</span>
            <p className="text-xs text-[#6B4E3D] font-medium">{kreeduLine}</p>
          </div>
        </div>
        <div className="text-xs font-bold text-[#5C140F]">Move {Pos.full}</div>
      </div>

      {/* Board + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col items-center">
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
          />

          {/* Captures strip */}
          <div className="w-full max-w-140 mt-4 grid grid-cols-2 gap-3">
            <div className="border-2 border-[#5C140F] p-2.5 bg-[#F6ECD2]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#5C140F]">{info.sides.w} has captured</span>
                {diff > 0 && <span className="text-[10px] font-bold text-[#D8401F]">+{diff}</span>}
              </div>
              <div className="flex flex-wrap gap-1 min-h-5">
                {capByIvory.length === 0 && <span className="text-[10px] italic text-[#6B4E3D]">Nothing yet</span>}
                {capByIvory.map((t, idx) => (
                  <PieceIcon key={idx} variant={variant} letter={t} ivory={false} className="w-4 h-4" />
                ))}
              </div>
            </div>
            <div className="border-2 border-[#5C140F] p-2.5 bg-[#F6ECD2]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#5C140F]">{info.sides.b} has captured</span>
                {diff < 0 && <span className="text-[10px] font-bold text-[#5C140F]">+{-diff}</span>}
              </div>
              <div className="flex flex-wrap gap-1 min-h-5">
                {capByEbony.length === 0 && <span className="text-[10px] italic text-[#6B4E3D]">Nothing yet</span>}
                {capByEbony.map((t, idx) => (
                  <PieceIcon key={idx} variant={variant} letter={t} ivory className="w-4 h-4" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          {gameMode === 'PVC' ? (
            <FolkArtFrame bg="bg-[#F6ECD2]" className="p-4 sm:p-5">
              <div className="flex items-center justify-between border-b-2 border-[#5C140F] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#0E5C58]" />
                  <span className="font-fraunces font-bold text-sm text-[#5C140F]">AI Opponent: Kreedu</span>
                </div>
                <span className="px-2 py-0.5 bg-[#E4D19E] border border-[#5C140F] text-[10px] font-bold text-[#2B1B12] uppercase">
                  {LEVEL_NAMES[DIFF_LEVEL[difficulty]]}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <KreeduMascot mood={kreeduMood} size={64} showDialogBubble dialogText={kreeduLine} />
                <div className="text-xs text-[#2B1B12] space-y-1">
                  <p className="font-bold text-[#5C140F]">Iterative-Deepening Search</p>
                  <p className="text-[11px] text-[#6B4E3D]">
                    {difficulty === 'EASY' && 'Casual pace, one move deep, with a human-like wobble.'}
                    {difficulty === 'MEDIUM' && 'Balanced minimax with transposition table and move ordering.'}
                    {difficulty === 'HARD' && 'Deep search with null-move pruning and quiescence — plays for keeps.'}
                  </p>
                </div>
              </div>
            </FolkArtFrame>
          ) : (
            <FolkArtFrame bg="bg-[#F6ECD2]" className="p-4 sm:p-5">
              <div className="flex items-center gap-2 border-b-2 border-[#5C140F] pb-2 mb-3">
                <User className="w-4 h-4 text-[#D8401F]" />
                <span className="font-fraunces font-bold text-sm text-[#5C140F]">2-Player Local Match</span>
              </div>
              <p className="text-xs text-[#2B1B12]">Pass the device between turns. {kreeduLine}</p>
            </FolkArtFrame>
          )}

          <FolkArtFrame bg="bg-[#F6ECD2]" className="p-4 flex-1 flex flex-col">
            <div className="flex items-center gap-2 border-b-2 border-[#5C140F] pb-2 mb-2">
              <History className="w-4 h-4 text-[#5C140F]" />
              <h4 className="font-fraunces text-sm font-bold text-[#5C140F]">Move Log ({moveLog.length})</h4>
            </div>
            <div className="max-h-65 overflow-y-auto space-y-1 pr-1 text-xs">
              {moveLog.length === 0 ? (
                <p className="text-center py-4 text-xs italic text-[#6B4E3D]">Moves will appear here as you play...</p>
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
        </div>
      </div>

      {/* PROMOTION MODAL */}
      {pendingPromo && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F6ECD2] border-4 border-[#5C140F] p-6 text-center">
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mb-4">Promote your pawn to:</h3>
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
                    <span className="text-xs font-bold text-[#5C140F]">{PIECE_INFO.chess[letter]?.n}</span>
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
              {result.kicker === 'YOU WIN' || (gameMode === 'PVP' && result.kicker.includes('WINS')) ? (
                <div className="p-3 bg-[#D8401F] border-2 border-[#5C140F] text-white">
                  <Trophy className="w-10 h-10" />
                </div>
              ) : (
                <KreeduMascot mood={result.kicker === 'YOU WIN' ? 'LOSE' : 'WIN'} size={72} />
              )}
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-[#D8401F] mb-1">{result.kicker}</p>
            <h3 className="font-fraunces text-3xl font-extrabold text-[#5C140F] mb-2">{result.title}</h3>
            <p className="text-sm text-[#2B1B12] font-medium mb-6">{result.text}</p>

            <div className="flex flex-col gap-2">
              <button onClick={resetGame} className="w-full py-3 bg-[#D8401F] hover:bg-[#B83215] text-white border-[3px] border-[#5C140F] font-bold text-sm tracking-wide uppercase cursor-pointer">
                Play Again
              </button>
              <button onClick={() => onNavigate('MODE_SELECT')} className="w-full py-2.5 bg-[#F6ECD2] hover:bg-white border-2 border-[#5C140F] text-xs font-bold text-[#5C140F] uppercase cursor-pointer">
                Change Setup
              </button>
              <button onClick={() => onNavigate('HOME')} className="w-full py-2 bg-[#E4D19E] hover:bg-[#F6ECD2] border-2 border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer">
                Home
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
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mb-4">Game Settings</h3>
            <div className="space-y-3 text-xs text-[#2B1B12]">
              <div className="flex items-center justify-between p-3 bg-[#E4D19E] border-2 border-[#5C140F]">
                <span className="font-bold text-[#5C140F]">Move Hints</span>
                <button onClick={() => setHints(h => !h)} className="px-3 py-1 bg-[#F6ECD2] border-[1.5px] border-[#5C140F] font-bold text-xs cursor-pointer">
                  {hints ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#E4D19E] border-2 border-[#5C140F]">
                <span className="font-bold text-[#5C140F]">Sound Effects</span>
                <button onClick={onToggleSound} className="px-3 py-1 bg-[#F6ECD2] border-[1.5px] border-[#5C140F] font-bold text-xs cursor-pointer">
                  {soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>
              <p className="text-[11px] text-[#6B4E3D] px-1">To change variant, opponent, difficulty or side, use "Change Setup" from the toolbar above.</p>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full mt-4 py-2.5 bg-[#D8401F] hover:bg-[#B83215] text-white border-2 border-[#5C140F] font-bold text-xs uppercase cursor-pointer">
              Close
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
            <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-2">Quick Reference — {info.title}</h3>
            <FolkDivider className="mb-3" />
            <div className="space-y-2.5 text-xs text-[#2B1B12] leading-relaxed">
              {(Object.entries(PIECE_INFO[variant]) as [PieceLetter, (typeof PIECE_INFO)['chess']['P']][]).map(([letter, pinfo]) => (
                <div key={letter} className="p-2.5 bg-[#E4D19E] border-2 border-[#5C140F] flex items-start gap-3">
                  <PieceIcon variant={variant} letter={letter} ivory className="w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-[#5C140F]">{pinfo!.n}{pinfo!.t ? ` · ${pinfo!.t}` : ''} <span className="font-normal text-[#6B4E3D]">— {pinfo!.worth}</span></h4>
                    <p>{pinfo!.how}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full mt-4 py-2.5 bg-[#D8401F] text-white border-2 border-[#5C140F] text-xs font-bold uppercase cursor-pointer">
              Back to Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
