import React from 'react';
import { WellbeingState } from '../types';
import { getPractice } from '../data/practices';
import { FolkArtFrame } from './FolkArtFrame';
import { ArrowLeft, Flame, CalendarCheck, Award, Smile } from 'lucide-react';

const MOOD_EMOJI: Record<string, string> = { great: '😄', good: '🙂', okay: '😐', low: '😔', stressed: '😣' };

interface ProgressProps {
  state: WellbeingState;
  onBack: () => void;
}

export const ProgressView: React.FC<ProgressProps> = ({ state, onBack }) => {
  const totalSessions = state.history.length;
  const recentMoods = state.history.slice(-10).filter(h => h.moodAfter);
  const milestonePractices = state.unlockedMilestones.map(id => getPractice(id)).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 wb-fade-in">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[#5C140F] font-bold text-sm mb-5 cursor-pointer hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Physical Wellbeing
      </button>
      <h1 className="font-fraunces text-2xl font-extrabold text-[#5C140F] mb-6">Your Progress</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-8">
        <StatTile icon={<Flame className="w-5 h-5" />} value={state.streak} label="Day streak" color="#D8401F" />
        <StatTile icon={<CalendarCheck className="w-5 h-5" />} value={totalSessions} label="Sessions completed" color="#0E5C58" />
        <StatTile icon={<Award className="w-5 h-5" />} value={state.unlockedMilestones.length} label="Practices unlocked" color="#EFA90C" />
      </div>

      <FolkArtFrame className="mb-6">
        <h3 className="font-fraunces text-lg font-bold text-[#5C140F] mb-3 flex items-center gap-2"><Smile className="w-4 h-4" /> Mood trend</h3>
        {recentMoods.length === 0 ? (
          <p className="text-sm text-[#6B4E3D]">Complete a session to start tracking your mood.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {recentMoods.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1 bg-white border-2 border-[#5C140F]/30 px-2.5 py-2">
                <span className="text-lg">{MOOD_EMOJI[h.moodAfter!]}</span>
                <span className="text-[9px] font-bold text-[#6B4E3D]">{h.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </FolkArtFrame>

      <FolkArtFrame>
        <h3 className="font-fraunces text-lg font-bold text-[#5C140F] mb-3">Unlocked milestones</h3>
        {milestonePractices.length === 0 ? (
          <p className="text-sm text-[#6B4E3D]">Keep practicing — advanced practices unlock as milestones as you build sessions.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {milestonePractices.map(p => (
              <li key={p!.id} className="text-xs font-bold bg-[#EFA90C]/20 border-2 border-[#EFA90C] px-2.5 py-1.5 text-[#5C140F]">
                ✨ {p!.name}
              </li>
            ))}
          </ul>
        )}
      </FolkArtFrame>
    </div>
  );
};

const StatTile: React.FC<{ icon: React.ReactNode; value: number; label: string; color: string }> = ({ icon, value, label, color }) => (
  <div className="bg-[#F6ECD2] border-2 border-[#5C140F] p-4 flex flex-col items-center text-center">
    <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5 text-white" style={{ backgroundColor: color }}>{icon}</div>
    <div className="font-fraunces text-2xl font-black text-[#5C140F]">{value}</div>
    <div className="text-[11px] font-bold text-[#6B4E3D] uppercase tracking-wide">{label}</div>
  </div>
);
