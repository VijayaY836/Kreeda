import React, { useMemo, useState } from 'react';
import { PieceLetter, Variant, ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { ChariotWheelIcon } from './FolkArtMotifs';
import { PieceIcon } from './PieceIcon';
import { ORDER, PIECE_INFO, VARIANT_INFO } from '../utils/pieceArt';
import {
  ArrowRight, ShieldAlert, CheckCircle, Crown, Grid3x3, Flag, Sparkles, Play, Swords,
} from 'lucide-react';

interface InteractiveTutorialProps {
  onComplete: () => void;
  initialVariant?: Variant;
}

type Tab = 'PIECES' | 'RULES';

/* ---------- Rules tab data ---------- */
interface RuleChip { title: string; description: string; icon: React.ReactNode; }
const RULES: Record<Variant, RuleChip[]> = {
  chaturanga: [
    { title: 'Full armies from move one', description: '16 pieces a side, fully arrayed — Raja, Mantri, 2 Gajas, 2 Ashvas, 2 Rathas, 8 Padatis.', icon: <span className="text-xs font-bold font-fraunces text-[#5C140F]">×16</span> },
    { title: 'Ashtapada board', description: 'An 8×8 grid, traditionally uncheckered. Armies mirror — Raja faces Raja down the d-file.', icon: <Grid3x3 className="w-4 h-4 text-[#5C140F]" /> },
    { title: 'Check', description: 'Answer an attack on your Raja immediately — move, block, or capture. Never leave it exposed.', icon: <ShieldAlert className="w-4 h-4 text-[#D8401F]" /> },
    { title: 'Capturing', description: 'Land on an enemy piece to remove it. Only the Ashva and Gaja leap over others.', icon: <CheckCircle className="w-4 h-4 text-[#5F8F3B]" /> },
    { title: 'No castling, no en passant', description: 'The Raja and Rathas never combine moves; Padatis never advance two squares.', icon: <Flag className="w-4 h-4 text-[#5C140F]" /> },
    { title: 'Promotion → Mantri only', description: 'A Padati reaching the far rank always becomes a Mantri — no other choice.', icon: <Crown className="w-4 h-4 text-[#EFA90C]" /> },
    { title: 'Stalemate is a win', description: 'No legal move and not in check — a victory for whoever forced it, under Shatranj rules.', icon: <Sparkles className="w-4 h-4 text-[#D8401F]" /> },
    { title: 'Bare king', description: 'Stripping every enemy piece but the Raja wins outright — a draw if they can bare you back.', icon: <Sparkles className="w-4 h-4 text-[#0E5C58]" /> },
  ],
  chess: [
    { title: 'Full armies from move one', description: '16 pieces a side, fully arrayed — King, Queen, 2 Bishops, 2 Knights, 2 Rooks, 8 Pawns.', icon: <span className="text-xs font-bold font-fraunces text-[#5C140F]">×16</span> },
    { title: 'Checkered board', description: 'An 8×8 grid, light and dark squares. Armies rotate — queen starts on her own colour.', icon: <Grid3x3 className="w-4 h-4 text-[#5C140F]" /> },
    { title: 'Check', description: 'Answer an attack on your King immediately — move, block, or capture. It can never stay in check.', icon: <ShieldAlert className="w-4 h-4 text-[#D8401F]" /> },
    { title: 'Capturing', description: 'Land on an enemy piece to remove it. Only the Knight leaps over other pieces.', icon: <CheckCircle className="w-4 h-4 text-[#5F8F3B]" /> },
    { title: 'Castling & en passant', description: 'King and Rook may castle once; a two-square pawn push can be captured en passant next move.', icon: <Flag className="w-4 h-4 text-[#5C140F]" /> },
    { title: 'Promotion → any piece', description: 'A Pawn reaching the far rank becomes any piece you choose — almost always a Queen.', icon: <Crown className="w-4 h-4 text-[#EFA90C]" /> },
    { title: 'Stalemate is a draw', description: 'No legal move and not in check scores as a draw here, not a win.', icon: <Sparkles className="w-4 h-4 text-[#D8401F]" /> },
    { title: 'Other draws', description: 'Threefold repetition, the fifty-move rule, and insufficient material all draw the game too.', icon: <Sparkles className="w-4 h-4 text-[#0E5C58]" /> },
  ],
};

const COMPARE_ROWS: [string, string, string][] = [
  ['Queen-equivalent', 'Mantri — one square diagonally', 'Queen — any distance, any direction'],
  ['Bishop-equivalent', 'Gaja — leaps exactly two squares', 'Bishop — slides the full diagonal'],
  ['Pawn', 'No two-square first move', 'Two-square first move, en passant'],
  ['Promotion', 'Padati → Mantri only', "Pawn → player's choice"],
  ['Castling', 'None', 'Both sides'],
  ['Stalemate', 'Win for whoever forced it', 'Draw'],
];

/* ---------- Pieces tab data ---------- */
type CellKind = '' | 'mv' | 'mv2' | 'cap' | 'hop';
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
    if (variant === 'chess') put(f0, r0 + 2, 'mv2');
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
const CELL_BG: Record<CellKind, string> = { '': '#F6ECD2', mv: '#CFE3C4', mv2: '#CFE3C4', cap: '#F3B79C', hop: '#F6ECD2' };

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onComplete, initialVariant = 'chaturanga' }) => {
  const [tab, setTab] = useState<Tab>('PIECES');
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [demoPiece, setDemoPiece] = useState<PieceLetter>(ORDER[initialVariant][0]);

  const info = VARIANT_INFO[variant];
  const order = ORDER[variant];
  const cells = useMemo(() => demoCells(demoPiece, variant), [demoPiece, variant]);
  const hasHop = cells.includes('hop');
  const hasMv2 = cells.includes('mv2');
  const pinfo = PIECE_INFO[variant][demoPiece]!;
  const switchVariant = (v: Variant) => { setVariant(v); setDemoPiece(ORDER[v][0]); };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-fraunces text-[#5C140F] mb-2">Tutorial</h1>
        <p className="max-w-xl mx-auto text-sm text-[#6B4E3D] mb-6">
          Every piece's movement, and the rules that separate the two eras — try both before your first match.
        </p>

        <div className="inline-flex bg-[#F6ECD2] border-2 border-[#5C140F] p-1 gap-1 mb-4">
          {(['PIECES', 'RULES'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide cursor-pointer transition-colors ${
                tab === t ? 'bg-[#5C140F] text-white' : 'text-[#5C140F] hover:bg-[#E4D19E]'
              }`}
            >
              {t === 'PIECES' ? 'The Pieces' : 'The Rules'}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          {(['chaturanga', 'chess'] as Variant[]).map((v) => (
            <button
              key={v}
              onClick={() => switchVariant(v)}
              className={`px-4 py-2 border-2 border-[#5C140F] text-sm font-bold cursor-pointer ${variant === v ? 'bg-[#5C140F] text-white' : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-white'}`}
            >
              {VARIANT_INFO[v].title}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- PIECES ---------------- */}
      {tab === 'PIECES' && (
        <FolkArtFrame bg="bg-[#F6ECD2]" className="p-5 sm:p-7 mb-8">
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

          <div className="flex flex-col lg:flex-row gap-7 items-center lg:items-start">
            <div className="shrink-0">
              <div className="grid grid-cols-5 grid-rows-5 w-64 h-64 sm:w-72 sm:h-72 border-[3px] border-[#5C140F] shadow-[3px_3px_0px_0px_#5C140F]">
                {Array.from({ length: 25 }).map((_, k) => {
                  const r = 4 - Math.floor(k / 5), f = k % 5;
                  const idx = r * 5 + f;
                  const kind = cells[idx];
                  const isCenter = f === 2 && r === 2;
                  const alt = (f + r) % 2 === 0;
                  return (
                    <div
                      key={k}
                      className="relative flex items-center justify-center border-[0.5px] border-[#5C140F]/25 aspect-square"
                      style={{ backgroundColor: kind ? CELL_BG[kind] : (alt ? '#EFDFB8' : '#F6ECD2') }}
                    >
                      {isCenter && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#EFA90C]/25 ring-2 ring-inset ring-[#EFA90C]">
                          <PieceIcon variant={variant} letter={demoPiece} ivory small={demoPiece === 'P' && variant === 'chaturanga'} className="w-[70%] h-[70%]" />
                        </div>
                      )}
                      {kind === 'cap' && !isCenter && (
                        <>
                          <PieceIcon variant={variant} letter="P" ivory={false} small={variant === 'chaturanga'} className="w-[60%] h-[60%] opacity-90" />
                          <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#B83215] border border-[#5C140F]">
                            <Swords className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                          </span>
                        </>
                      )}
                      {kind === 'mv' && <span className="w-2.5 h-2.5 rounded-full bg-[#5F8F3B] ring-2 ring-[#5F8F3B]/30" />}
                      {kind === 'mv2' && (
                        <span className="relative flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#5F8F3B]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5F8F3B]" />
                        </span>
                      )}
                      {kind === 'hop' && <span className="w-2 h-2 rounded-full border-2 border-dashed border-[#5C140F]/40" />}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 border border-[#5C140F]/40 flex items-center justify-center shrink-0" style={{ backgroundColor: CELL_BG.mv }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5F8F3B]" />
                  </span>
                  <span className="text-[11px] font-bold text-[#2B1B12]">Normal move</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative w-4 h-4 border border-[#5C140F]/40 shrink-0" style={{ backgroundColor: CELL_BG.cap }}>
                    <Swords className="absolute inset-0 m-auto w-2.5 h-2.5 text-[#B83215]" strokeWidth={2.5} />
                  </span>
                  <span className="text-[11px] font-bold text-[#B83215]">Capture</span>
                </div>
                {hasMv2 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border border-[#5C140F]/40 flex items-center justify-center shrink-0" style={{ backgroundColor: CELL_BG.mv2 }}>
                      <span className="relative flex items-center justify-center w-2.5 h-2.5 rounded-full border-2 border-[#5F8F3B]">
                        <span className="w-1 h-1 rounded-full bg-[#5F8F3B]" />
                      </span>
                    </span>
                    <span className="text-[11px] font-bold text-[#2B1B12]">First move only</span>
                  </div>
                )}
                {hasHop && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border border-[#5C140F]/40 flex items-center justify-center shrink-0 bg-[#F6ECD2]">
                      <span className="w-1.5 h-1.5 rounded-full border border-dashed border-[#5C140F]/50" />
                    </span>
                    <span className="text-[11px] font-bold text-[#2B1B12]">Leaps over (no capture)</span>
                  </div>
                )}
              </div>
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
      )}

      {/* ---------------- RULES ---------------- */}
      {tab === 'RULES' && (
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {RULES[variant].map((r) => (
              <div key={r.title} className="flex items-start gap-3 p-3.5 bg-[#F6ECD2] border-2 border-[#5C140F]">
                <div className="p-1.5 bg-[#E4D19E] border-[1.5px] border-[#5C140F] shrink-0">{r.icon}</div>
                <div>
                  <h4 className="text-sm font-bold text-[#5C140F] mb-0.5">{r.title}</h4>
                  <p className="text-[11px] text-[#2B1B12] leading-relaxed">{r.description}</p>
                </div>
              </div>
            ))}
          </div>

          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center gap-2 mb-4">
              <ChariotWheelIcon size={18} color="#D8401F" />
              <h3 className="font-fraunces text-lg font-bold text-[#5C140F]">Chaturangam vs. Chess, at a glance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#5C140F] text-white">
                    <th className="p-2 text-left font-bold">&nbsp;</th>
                    <th className="p-2 text-left font-bold">Chaturangam</th>
                    <th className="p-2 text-left font-bold">Chess</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map(([label, a, b], idx) => (
                    <tr key={label} className={idx % 2 === 0 ? 'bg-[#E4D19E]' : 'bg-[#F6ECD2]'}>
                      <td className="p-2 font-bold text-[#5C140F] border-t border-[#5C140F]/30">{label}</td>
                      <td className="p-2 text-[#2B1B12] border-t border-[#5C140F]/30">{a}</td>
                      <td className="p-2 text-[#2B1B12] border-t border-[#5C140F]/30">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FolkArtFrame>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D8401F] hover:bg-[#B83215] text-white border-[3px] border-[#5C140F] text-sm font-bold uppercase tracking-wider cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          Play {info.title}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
