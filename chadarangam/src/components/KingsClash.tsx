import React from 'react';
import { PieceIcon } from './PieceIcon';
import { Swords } from 'lucide-react';

/* Ivory King vs. Ebony King, mid-clash — the hero's centerpiece image.
   Crossed swords stand in for the "VS": the whole app's pitch (one board,
   two games, 1,500 years apart) rendered as a single clean picture. */
export const KingsClash: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`flex items-center justify-center ${compact ? 'gap-3 sm:gap-5' : 'gap-4 sm:gap-6'}`}>
    <PieceIcon
      variant="chess"
      letter="K"
      ivory
      className={`${compact ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-16 h-16 sm:w-20 sm:h-20'} drop-shadow-sm shrink-0`}
    />
    <div className={`${compact ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-11 h-11 sm:w-12 sm:h-12'} rounded-full bg-[#EFA90C] border-[3px] border-[#5C140F] flex items-center justify-center shrink-0`}>
      <Swords className={`${compact ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} text-[#5C140F]`} />
    </div>
    <PieceIcon
      variant="chess"
      letter="K"
      ivory={false}
      className={`${compact ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-16 h-16 sm:w-20 sm:h-20'} drop-shadow-sm shrink-0`}
    />
  </div>
);
