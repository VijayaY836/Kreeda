import React from 'react';
import { PieceLetter, Variant } from '../types';
import { FILE, NAME_OF_SQ, RANK } from '../utils/chessEngine';
import { PIECE_INFO } from '../utils/pieceArt';
import { PieceIcon } from './PieceIcon';

export interface BoardSquareVM {
  piece: number; // signed piece code, 0 = empty
}

interface GameBoardProps {
  variant: Variant;
  board: Int8Array | number[];
  boardStyle: 'ashtapada' | 'checkered';
  selected: number | null;
  targetSquares: Set<number>;
  captureSquares: Set<number>;
  // id changes on every move so the slide animation replays; captured is the
  // piece taken on the destination square (if any), shown fading out under it.
  lastMove: { from: number; to: number; id?: number; captured?: number } | null;
  checkedSq: number;
  flipped: boolean;
  hints: boolean;
  disabled?: boolean;
  onSquareClick: (i: number) => void;
  letterOf: (piece: number) => PieceLetter;
  // Drop the 560px cap and fill whatever width the parent gives it.
  fluid?: boolean;
}

const isMarked = (i: number) => {
  const m = (x: number) => x === 0 || x === 3 || x === 4 || x === 7;
  return m(FILE(i)) && m(RANK(i));
};

function viewOrder(flipped: boolean): number[] {
  const out: number[] = [];
  for (let r = 7; r >= 0; r--) for (let f = 0; f < 8; f++) out.push(r * 8 + f);
  return flipped ? out.reverse() : out;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  variant, board, boardStyle, selected, targetSquares, captureSquares,
  lastMove, checkedSq, flipped, hints, disabled, onSquareClick, letterOf, fluid = false,
}) => {
  const order = viewOrder(flipped);
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const checkered = boardStyle === 'checkered';

  // Where a square sits on screen (column/row 0–7), for the slide and the arrow.
  const viewPos = (i: number) => { const k = order.indexOf(i); return { c: k % 8, r: Math.floor(k / 8) }; };
  const moveFrom = lastMove ? viewPos(lastMove.from) : null;
  const moveTo = lastMove ? viewPos(lastMove.to) : null;
  const animate = !!lastMove && lastMove.id !== undefined;

  return (
    <div className={`w-full ${fluid ? '' : 'max-w-140 '}mx-auto select-none`}>
      <div className="flex">
        {/* Rank labels */}
        <div className="flex flex-col justify-around pr-1.5 sm:pr-2">
          {ranks.map((r) => (
            <div key={`r-${r}`} className="flex-1 flex items-center text-[10px] sm:text-xs font-bold text-[#5C140F] font-fraunces">
              {r}
            </div>
          ))}
        </div>

        <div className="flex-1">
          {/* Board frame — same treatment as Daadi Aata's board container */}
          <div className="w-full aspect-square bg-[#F6ECD2] border-4 border-[#5C140F] p-1.5 sm:p-2 box-border relative">
            <div className="relative w-full h-full border-[1.5px] border-[#5C140F] grid grid-cols-8 grid-rows-8">
              {order.map((i) => {
                const piece = board[i];
                const dark = (FILE(i) + RANK(i)) % 2 === 0;
                const isSel = selected === i;
                const isTarget = targetSquares.has(i);
                const isCapture = captureSquares.has(i);
                const isLast = !!lastMove && (i === lastMove.from || i === lastMove.to);
                const isMoveFrom = !!lastMove && i === lastMove.from;
                const isMoveTo = !!lastMove && i === lastMove.to;
                const slide = animate && isMoveTo && moveFrom && moveTo;
                const isCheck = i === checkedSq;
                const marked = boardStyle === 'ashtapada' && isMarked(i);

                let bg = '#F6ECD2';
                if (checkered) bg = dark ? '#E4D19E' : '#F6ECD2';
                if (isCheck) bg = '#D9587B';
                else if (isSel) bg = checkered ? (dark ? '#F0DA9E' : '#FBF2DA') : '#F0DA9E';
                else if (isLast) bg = checkered ? (dark ? '#EBD9A8' : '#F8EFD8') : '#EFE3C0';

                const ivory = piece > 0;
                const letter = piece ? letterOf(piece) : null;
                const clickable = !disabled;

                return (
                  <div
                    key={`sq-${i}`}
                    role="button"
                    tabIndex={clickable ? 0 : -1}
                    aria-label={
                      NAME_OF_SQ(i) + (piece ? ` — ${ivory ? 'Ivory' : 'Ebony'} ${PIECE_INFO[variant][letter!]?.n ?? ''}` : ' — empty')
                    }
                    onClick={() => clickable && onSquareClick(i)}
                    onKeyDown={(e) => {
                      if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSquareClick(i); }
                    }}
                    className={`relative flex items-center justify-center ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{
                      backgroundColor: bg,
                      border: '0.5px solid rgba(92,20,15,0.35)',
                    }}
                  >
                    {marked && !piece && (
                      <div className="absolute w-1.5 h-1.5 rotate-45 bg-[#5C140F]/25" />
                    )}

                    {/* last move: where it came from, and where it landed */}
                    {isMoveFrom && (
                      <span className="absolute inset-[5%] border-2 border-dashed border-[#D8401F]/60 pointer-events-none" />
                    )}
                    {isMoveTo && !isCheck && (
                      <span className="absolute inset-[4%] rounded-full border-[3px] border-[#EFA90C] shadow-[0_0_0_2px_rgba(239,169,12,0.25)] pointer-events-none" />
                    )}

                    {/* the piece just taken, fading out as the attacker lands on it */}
                    {slide && lastMove!.captured ? (
                      <div key={`cap-${lastMove!.id}`} className="capture-fade absolute inset-0 flex items-center justify-center pointer-events-none">
                        <PieceIcon
                          variant={variant}
                          letter={letterOf(lastMove!.captured)}
                          ivory={lastMove!.captured > 0}
                          small={letterOf(lastMove!.captured) === 'P' && variant === 'chaturanga'}
                          className="w-[72%] h-[72%] drop-shadow-sm"
                        />
                      </div>
                    ) : null}

                    {piece !== 0 && letter && (
                      slide ? (
                        // replays on every move (keyed by its id): glides in from the start square
                        <div
                          key={`slide-${lastMove!.id}`}
                          className="piece-slide absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{ '--dx': moveFrom!.c - moveTo!.c, '--dy': moveFrom!.r - moveTo!.r } as React.CSSProperties}
                        >
                          <PieceIcon
                            variant={variant}
                            letter={letter}
                            ivory={ivory}
                            small={letter === 'P' && variant === 'chaturanga'}
                            className="w-[72%] h-[72%] drop-shadow-md"
                          />
                        </div>
                      ) : (
                        <PieceIcon
                          variant={variant}
                          letter={letter}
                          ivory={ivory}
                          small={letter === 'P' && variant === 'chaturanga'}
                          className="w-[72%] h-[72%] drop-shadow-sm"
                        />
                      )
                    )}

                    {hints && isTarget && !piece && (
                      <span className="absolute w-[28%] h-[28%] rounded-full bg-[#0E5C58]/70 border-[1.5px] border-[#5C140F]" />
                    )}
                    {hints && (isTarget || isCapture) && piece !== 0 && (
                      <span className="absolute inset-[8%] rounded-full border-[3px] border-[#D8401F]" style={{ boxShadow: '0 0 0 2px rgba(216,64,31,0.18) inset' }} />
                    )}
                    {isSel && (
                      <span className="absolute inset-[6%] rounded-none border-[2.5px] border-[#EFA90C] border-dashed" />
                    )}
                  </div>
                );
              })}

              {/* arrow for the last move, drawn once the piece has arrived */}
              {moveFrom && moveTo && (
                <svg
                  key={`arrow-${lastMove!.id ?? 'x'}`}
                  className="move-arrow absolute inset-0 w-full h-full pointer-events-none z-20"
                  viewBox="0 0 8 8"
                  aria-hidden="true"
                >
                  <defs>
                    <marker id="move-arrow-head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse">
                      <path d="M0,0 L10,5 L0,10 z" fill="#D8401F" />
                    </marker>
                  </defs>
                  {(() => {
                    const x1 = moveFrom.c + 0.5, y1 = moveFrom.r + 0.5, x2 = moveTo.c + 0.5, y2 = moveTo.r + 0.5;
                    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
                    // stop short of the destination's centre so the head doesn't cover the piece
                    const k = Math.max(0, (len - 0.42) / len);
                    return (
                      <line
                        x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k}
                        stroke="#D8401F" strokeOpacity="0.7" strokeWidth="0.1" strokeLinecap="round"
                        markerEnd="url(#move-arrow-head)"
                      />
                    );
                  })()}
                </svg>
              )}
            </div>
          </div>

          {/* File labels */}
          <div className="grid grid-cols-8 mt-1 sm:mt-1.5">
            {files.map((f) => (
              <div key={`f-${f}`} className="text-center text-[10px] sm:text-xs font-bold text-[#5C140F] font-fraunces">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
