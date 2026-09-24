import React from 'react';
import { WeeklyPlan } from '../types';
import { DAY_LABELS } from '../engine/planEngine';
import { getPractice } from '../data/practices';
import { ArrowLeft, Play, Moon, RefreshCw } from 'lucide-react';

interface PlanOverviewProps {
  plan: WeeklyPlan;
  onBack: () => void;
  onStartSession: (dayIndex: number) => void;
  onRebuild: () => void;
}

const EMPHASIS_COLOR: Record<string, string> = { yoga: '#0E5C58', vyayam: '#D8401F', rest: '#6B4E3D' };

export const PlanOverview: React.FC<PlanOverviewProps> = ({ plan, onBack, onStartSession, onRebuild }) => {
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 wb-fade-in">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[#5C140F] font-bold text-sm cursor-pointer hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Physical Wellbeing
        </button>
        <button onClick={onRebuild} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C140F] border-2 border-[#5C140F] px-3 py-1.5 bg-[#F6ECD2] hover:bg-white cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Edit Plan Inputs
        </button>
      </div>

      <h1 className="font-fraunces text-2xl font-extrabold text-[#5C140F] mb-1">Your Weekly Plan</h1>
      <p className="text-sm text-[#6B4E3D] font-semibold mb-6">
        {plan.profile.yogaAsanaCount} asanas &middot; {plan.profile.vyayamItemCount} vyayam items &middot; {plan.profile.meditationMinutes} min meditation &middot; {plan.profile.daysPerWeek} days/week &middot; {plan.profile.fitnessLevel} level
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {DAY_LABELS.map((label, dayIndex) => {
          const session = plan.days.find(d => d.dayIndex === dayIndex);
          const isToday = dayIndex === todayIndex;
          const isRest = !session || session.emphasis === 'rest';

          return (
            <div
              key={dayIndex}
              className={`border-[3px] p-4 flex flex-col ${isToday ? 'border-[#D8401F]' : 'border-[#5C140F]'} ${isRest ? 'bg-[#E4D19E]' : 'bg-[#F6ECD2]'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-fraunces font-bold text-[#5C140F]">{label}</span>
                {isToday && <span className="text-[9px] font-extrabold uppercase bg-[#D8401F] text-white px-1.5 py-0.5">Today</span>}
              </div>

              {isRest ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 text-[#6B4E3D]">
                  <Moon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Rest day</span>
                </div>
              ) : (
                <>
                  <span
                    className="inline-block self-start text-[9px] font-extrabold uppercase tracking-wider text-white px-1.5 py-0.5 mb-2"
                    style={{ backgroundColor: EMPHASIS_COLOR[session!.emphasis] }}
                  >
                    {session!.emphasis}-heavy
                  </span>
                  <ul className="flex-1 space-y-1 mb-3">
                    {session!.items.map((item, i) => {
                      const p = getPractice(item.practiceId);
                      return p ? <li key={i} className="text-[11.5px] text-[#2B1B12] font-semibold">&bull; {p.name}</li> : null;
                    })}
                  </ul>
                </>
              )}

              {session?.standaloneDhyana && (() => {
                const p = getPractice(session.standaloneDhyana.practiceId);
                return p ? (
                  <p className="text-[10.5px] text-[#3E6E9E] font-bold mb-2">+ Evening Dhyana: {p.name}</p>
                ) : null;
              })()}

              {((session && session.items.length > 0) || session?.standaloneDhyana) && (
                <button
                  onClick={() => onStartSession(dayIndex)}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 py-2 bg-[#D8401F] text-white border-2 border-[#5C140F] text-[11px] font-bold uppercase tracking-wide cursor-pointer hover:bg-[#B83215]"
                >
                  <Play className="w-3 h-3 fill-current" /> Start
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
