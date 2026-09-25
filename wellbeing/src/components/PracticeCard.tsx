import React from 'react';
import { Practice } from '../types';
import { Lock } from 'lucide-react';
import { LotusIcon } from './FolkArtMotifs';

const LEVEL_COLOR: Record<string, string> = { beginner: '#3F6B4F', intermediate: '#C4881F', advanced: '#1F3B2E' };

interface PracticeCardProps {
  practice: Practice;
  locked?: boolean;
  onClick: () => void;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({ practice, locked, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-left bg-[#F6EFDE] border border-[#C7A467]/70 rounded-xl cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(42,30,20,0.18)] relative overflow-hidden flex flex-col"
    >
      <div className="relative h-24 w-full bg-[#EADFC4] border-b-2 border-[#C7A467] overflow-hidden">
        {practice.image ? (
          <img
            src={practice.image}
            alt=""
            className={`w-full h-full object-cover ${locked ? 'grayscale opacity-50' : ''}`}
          />
        ) : (
          <div className="w-full h-full bg-kolam-dots flex items-center justify-center">
            <LotusIcon size={22} color="#1F3B2E" className="opacity-25" />
          </div>
        )}
        <span
          className="absolute top-1.5 left-1.5 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 text-white"
          style={{ backgroundColor: LEVEL_COLOR[practice.level] }}
        >
          {practice.level}
        </span>
        {locked && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center bg-[#2A241E]/70 text-white">
            <Lock className="w-3 h-3" />
          </span>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-fraunces font-bold text-[15px] text-[#1F3B2E] leading-tight">{practice.name}</h4>
        <p className="text-[11.5px] text-[#5C5142] font-semibold">{practice.name_english}</p>
        {locked && <p className="text-[10.5px] text-[#5C5142] mt-1">Unlocks after {practice.unlock_after_sessions} sessions</p>}
      </div>
    </button>
  );
};
