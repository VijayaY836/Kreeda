import React from 'react';
import { Practice } from '../types';
import { Lock } from 'lucide-react';

const LEVEL_COLOR: Record<string, string> = { beginner: '#5F8F3B', intermediate: '#EFA90C', advanced: '#D8401F' };

interface PracticeCardProps {
  practice: Practice;
  locked?: boolean;
  onClick: () => void;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({ practice, locked, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-left bg-[#F6ECD2] border-2 border-[#5C140F] p-3.5 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#5C140F] relative"
    >
      {locked && (
        <span className="absolute top-2 right-2 text-[#6B4E3D]"><Lock className="w-3.5 h-3.5" /></span>
      )}
      <span
        className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 mb-1.5 text-white"
        style={{ backgroundColor: LEVEL_COLOR[practice.level] }}
      >
        {practice.level}
      </span>
      <h4 className="font-fraunces font-bold text-[15px] text-[#5C140F] leading-tight">{practice.name}</h4>
      <p className="text-[11.5px] text-[#6B4E3D] font-semibold">{practice.name_english}</p>
      {locked && <p className="text-[10.5px] text-[#6B4E3D] mt-1">Unlocks after {practice.unlock_after_sessions} sessions</p>}
    </button>
  );
};
