import React from 'react';
import { PieceIcon } from './PieceIcon';
import { CrescentStarIcon } from './FolkArtMotifs';

interface Era {
  key: string;
  name: string;
  place: string;
  when: string;
  color: string;
  icon: React.ReactNode;
}

const ERAS: Era[] = [
  {
    key: 'chaturanga', name: 'Chaturanga', place: 'Gupta India', when: '~6th c.', color: '#D8401F',
    icon: <PieceIcon variant="chaturanga" letter="K" ivory className="w-7 h-7 sm:w-8 sm:h-8" />,
  },
  {
    key: 'shatranj', name: 'Shatranj', place: 'Persia', when: '~7th c.', color: '#EFA90C',
    icon: <CrescentStarIcon size={30} />,
  },
  {
    key: 'chess', name: 'Chess', place: 'Europe', when: '15th c.', color: '#0E5C58',
    icon: <PieceIcon variant="chess" letter="K" ivory className="w-7 h-7 sm:w-8 sm:h-8" />,
  },
];

/* The whole app's premise, shown rather than told: one lineage, three stops.
   Used as the Home hero centerpiece and echoed (smaller) atop History's page. */
export const EraTimeline: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`flex items-start justify-center ${compact ? 'gap-8 sm:gap-12' : 'gap-10 sm:gap-16'} w-full`}>
    {ERAS.map((era) => (
      <div key={era.key} className="flex flex-col items-center text-center">
        <div
          className={`${compact ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-14 h-14 sm:w-16 sm:h-16'} rounded-full bg-[#F6ECD2] border-[3px] flex items-center justify-center mb-1.5`}
          style={{ borderColor: era.color }}
        >
          {era.icon}
        </div>
        <span className="font-fraunces font-extrabold text-[#5C140F] text-xs sm:text-sm leading-tight">
          {era.name}
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide" style={{ color: era.color }}>
          {era.place}
        </span>
        <span className="text-[9px] text-[#6B4E3D]">{era.when}</span>
      </div>
    ))}
  </div>
);
