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
  lastMove: { from: number; to: number } | null;
  checkedSq: number;
  flipped: boolean;
  hints: boolean;
  disabled?: boolean;
  onSquareClick: (i: number) => void;
  letterOf: (piece: number) => PieceLetter;
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
  lastMove, checkedSq, flipped, hints, disabled, onSquareClick, letterOf,
}) => {
  const order = viewOrder(flipped);
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const checkered = boardStyle === 'checkered';

  return (
    <div className="w-full max-w-140 mx-auto select-none">
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
            <div className="w-full h-full border-[1.5px] border-[#5C140F] grid grid-cols-8 grid-rows-8">
              {order.map((i) => {
                const piece = board[i];
                const dark = (FILE(i) + RANK(i)) % 2 === 0;
                const isSel = selected === i;
                const isTarget = targetSquares.has(i);
                const isCapture = captureSquares.has(i);
                const isLast = !!lastMove && (i === lastMove.from || i === lastMove.to);
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

                    {piece !== 0 && letter && (
                      <PieceIcon
                        variant={variant}
                        letter={letter}
                        ivory={ivory}
                        small={letter === 'P' && variant === 'chaturanga'}
                        className="w-[72%] h-[72%] drop-shadow-sm"
                      />
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
