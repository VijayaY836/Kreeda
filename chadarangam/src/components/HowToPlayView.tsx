import React, { useMemo, useState } from 'react';
import { PieceLetter, Variant, ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider } from './FolkArtMotifs';
import { PieceIcon } from './PieceIcon';
import { ORDER, PIECE_INFO, VARIANT_INFO } from '../utils/pieceArt';
import { ArrowLeft } from 'lucide-react';

interface HowToPlayViewProps {
  onNavigate: (tab: ViewTab) => void;
  initialVariant: Variant;
}

type CellKind = '' | 'mv' | 'cap' | 'hop';

/* 5x5 movement-demo grid — direct port of app.js `renderDemo()`. The
   piece sits at the centre (2,2); 'mv' cells are legal destinations,
   'cap' shows a capturable enemy pawn, 'hop' marks a square the Gaja
   leaps over without landing on. */
function demoCells(t: PieceLetter, variant: Variant): CellKind[] {
  const N5 = 5, f0 = 2, r0 = 2;
  const cells: CellKind[] = new Array(25).fill('');
  const put = (f: number, r: number, c: CellKind) => { if (f >= 0 && f < N5 && r >= 0 && r < N5) cells[r * N5 + f] = c; };
  const ray = (df: number, dr: number) => { let f = f0 + df, r = r0 + dr; while (f >= 0 && f < N5 && r >= 0 && r < N5) { put(f, r, 'mv'); f += df; r += dr; } };

  if (t === 'R') { ray(1, 0); ray(-1, 0); ray(0, 1); ray(0, -1); put(f0, 4, 'cap'); }
  else if (t === 'B') { ray(1, 1); ray(1, -1); ray(-1, 1); ray(-1, -1); put(4, 4, 'cap'); }
  else if (t === 'Q') { for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) ray(a, b); put(4, 4, 'cap'); }
  else if (t === 'P') {
    put(f0, r0 + 1, 'mv');
    if (variant === 'chess') put(f0, r0 + 2, 'mv');
    put(f0 - 1, r0 + 1, 'cap'); put(f0 + 1, r0 + 1, 'cap');
  }
  else if (t === 'N') { for (const [a, b] of [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]) put(f0 + a, r0 + b, 'mv'); put(f0 + 1, r0 + 2, 'cap'); }
  else if (t === 'K') { for (const [a, b] of [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]) put(f0 + a, r0 + b, 'mv'); put(f0 + 1, r0 + 1, 'cap'); }
  else if (t === 'M') { for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) put(f0 + a, r0 + b, 'mv'); put(f0 + 1, r0 + 1, 'cap'); }
  else if (t === 'E') {
    for (const [a, b] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) put(f0 + a, r0 + b, 'mv');
    for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) put(f0 + a, r0 + b, 'hop');
    put(4, 4, 'cap');
  }
  return cells;
}

const CELL_BG: Record<CellKind, string> = {
  '': '#F6ECD2',
  mv: '#CFE3C4',
  cap: '#F0C4B0',
  hop: '#F6ECD2',
};

export const HowToPlayView: React.FC<HowToPlayViewProps> = ({ onNavigate, initialVariant }) => {
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [demoPiece, setDemoPiece] = useState<PieceLetter>(ORDER[initialVariant][0]);

  const order = ORDER[variant];
  const info = VARIANT_INFO[variant];
  const cells = useMemo(() => demoCells(demoPiece, variant), [demoPiece, variant]);
  const pinfo = PIECE_INFO[variant][demoPiece]!;

  const switchVariant = (v: Variant) => { setVariant(v); setDemoPiece(ORDER[v][0]); };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <div className="text-center mb-6">
        <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl text-[#5C140F] mb-1">How to Play</h1>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#6B4E3D]">Everything you need — the pieces, the goal, and what's different between the two games.</p>
      </div>

      {/* Variant toggle */}
      <div className="flex justify-center gap-2 mb-6">
        {(['chaturanga', 'chess'] as Variant[]).map(v => (
          <button
            key={v}
            onClick={() => switchVariant(v)}
            className={`px-4 py-2 border-2 border-[#5C140F] text-sm font-bold cursor-pointer ${variant === v ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
          >
            {VARIANT_INFO[v].title}
          </button>
        ))}
      </div>

      {/* Quick start */}
      <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 sm:p-7 mb-6">
        <h3 className="font-fraunces font-bold text-lg text-[#5C140F] mb-3">Sixty seconds and you can play</h3>
        {variant === 'chaturanga' ? (
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#2B1B12]">
            <li>Each side has 16 pieces: a <strong>Raja</strong>, a <strong>Mantri</strong>, two <strong>Gajas</strong>, two <strong>Ashvas</strong>, two <strong>Rathas</strong> and eight <strong>Padatis</strong>.</li>
            <li>Ivory moves first. Tap your piece, then tap a highlighted square.</li>
            <li>Landing on an enemy piece captures it. You may never leave your own Raja under attack.</li>
            <li>Trap the enemy Raja so it cannot escape — that's checkmate, and you win.</li>
          </ul>
        ) : (
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#2B1B12]">
            <li>Each side has 16 pieces: a <strong>King</strong>, a <strong>Queen</strong>, two <strong>Bishops</strong>, two <strong>Knights</strong>, two <strong>Rooks</strong> and eight <strong>Pawns</strong>.</li>
            <li>White moves first. Tap your piece, then tap a highlighted square.</li>
            <li>Landing on an enemy piece captures it. You may never leave your own king in check.</li>
            <li>Trap the enemy king so it cannot escape — that's checkmate, and you win.</li>
          </ul>
        )}
        <div className="mt-4 p-3 bg-[#E4D19E] border-2 border-[#5C140F] text-xs text-[#2B1B12] leading-relaxed">
          {variant === 'chaturanga'
            ? <>If you already play chess, three things will trip you up: the <strong>Mantri moves one square diagonally</strong> (it is not a queen), the <strong>Gaja jumps exactly two squares diagonally</strong> (it is not a bishop), and <strong>Padatis never advance two squares</strong>. There is no castling.</>
            : <>Coming from Chaturangam? The queen and bishop now slide the <strong>full board</strong>, pawns get a <strong>two-square first move</strong> (with en passant), and each side may <strong>castle</strong> once. Stalemate is now a draw, not a win.</>}
        </div>
      </FolkArtFrame>

      {/* Piece-by-piece demo */}
      <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 sm:p-7 mb-6">
        <h3 className="font-fraunces font-bold text-lg text-[#5C140F] mb-3">Pick a piece to see how it moves</h3>
        <p className="text-xs text-[#6B4E3D] mb-4">Green squares are moves, red squares are captures.</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {order.map((k) => (
            <button
              key={k}
              onClick={() => setDemoPiece(k)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-[#5C140F] text-xs font-bold cursor-pointer ${demoPiece === k ? 'bg-white shadow-[2px_2px_0px_0px_#5C140F]' : 'bg-[#E4D19E] hover:bg-white'}`}
            >
              <PieceIcon variant={variant} letter={k} ivory className="w-5 h-5" />
              {PIECE_INFO[variant][k]?.n}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="grid grid-cols-5 w-55 h-55 border-[3px] border-[#5C140F] shrink-0">
            {Array.from({ length: 25 }).map((_, k) => {
              const r = 4 - Math.floor(k / 5), f = k % 5;
              const idx = r * 5 + f;
              const kind = cells[idx];
              const isCenter = f === 2 && r === 2;
              const alt = (f + r) % 2 === 0;
              return (
                <div
                  key={k}
                  className="relative flex items-center justify-center border-[0.5px] border-[#5C140F]/25"
                  style={{ backgroundColor: kind ? CELL_BG[kind] : (alt ? '#EFDFB8' : '#F6ECD2') }}
                >
                  {isCenter && <PieceIcon variant={variant} letter={demoPiece} ivory small={demoPiece === 'P' && variant === 'chaturanga'} className="w-[70%] h-[70%]" />}
                  {kind === 'cap' && !isCenter && <PieceIcon variant={variant} letter="P" ivory={false} small={variant === 'chaturanga'} className="w-[62%] h-[62%] opacity-90" />}
                  {kind === 'mv' && <span className="absolute w-2 h-2 rounded-full bg-[#5F8F3B]" />}
                  {kind === 'hop' && <span className="absolute w-1.5 h-1.5 rounded-full bg-[#5C140F]/30" />}
                </div>
              );
            })}
          </div>

          <div className="flex-1">
            <span className="inline-block px-2 py-0.5 bg-[#E4D19E] border border-[#5C140F] text-[10px] font-bold text-[#2B1B12] uppercase mb-2">
              {pinfo.worth}
            </span>
            <h4 className="font-fraunces font-bold text-xl text-[#5C140F] mb-1">
              {pinfo.n}{pinfo.t ? ` · ${pinfo.t}` : ''}{pinfo.en ? ` — ${pinfo.en}` : ''}
            </h4>
            <p className="text-sm text-[#2B1B12] mb-2"><strong>Moves:</strong> {pinfo.how}</p>
            <p className="text-xs text-[#6B4E3D] leading-relaxed">{pinfo.note}</p>
            {variant === 'chaturanga' && pinfo.tag && (
              <p className="text-xs text-[#6B4E3D] mt-2">Written as <strong>{pinfo.tag}</strong> in the move log.</p>
            )}
          </div>
        </div>
      </FolkArtFrame>

      {/* Special rules */}
      <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 sm:p-7 mb-6">
        <h3 className="font-fraunces font-bold text-lg text-[#5C140F] mb-3">Special rules &amp; endings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#2B1B12]">
          {variant === 'chess' ? (
            <>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">Castling</strong>King and rook swap past each other once per game, if neither has moved and nothing stands between or attacks the path.</div>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">En passant</strong>If an enemy pawn jumps two squares past yours, you may capture it as though it had moved only one — but only on your very next move.</div>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">Promotion</strong>A pawn reaching the far rank becomes any piece you choose — almost always a queen.</div>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">Stalemate</strong>No legal move and not in check — the game is a draw.</div>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">Draws</strong>Also drawn by insufficient material, the fifty-move rule, or threefold repetition.</div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">No castling</strong>The Raja and Rathas never make a special combined move.</div>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">Promotion</strong>A Padati reaching the far rank becomes a Mantri — and only a Mantri.</div>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">Stalemate</strong>No legal move and not in check — under Shatranj rules, that's a <em>win</em> for whoever forced it, not a draw.</div>
              <div className="p-3 bg-[#E4D19E] border-2 border-[#5C140F]"><strong className="block text-[#5C140F] mb-1">Bare king</strong>Capturing every enemy piece but the Raja wins outright — unless the opponent can bare your Raja right back, which draws.</div>
            </>
          )}
        </div>
      </FolkArtFrame>

      <FolkDivider className="mb-6" />
      <div className="text-center">
        <button onClick={() => onNavigate('HOME')} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C140F] hover:underline cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
