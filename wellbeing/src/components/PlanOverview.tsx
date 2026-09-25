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

const EMPHASIS_COLOR: Record<string, string> = { yoga: '#1F3B2E', vyayam: '#1F3B2E', rest: '#5C5142' };

export const PlanOverview: React.FC<PlanOverviewProps> = ({ plan, onBack, onStartSession, onRebuild }) => {
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 wb-fade-in">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[#1F3B2E] font-bold text-sm cursor-pointer hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Physical Wellbeing
        </button>
        <button onClick={onRebuild} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F3B2E] border border-[#C7A467]/70 rounded-xl px-3 py-1.5 bg-[#F6EFDE] hover:bg-white cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Edit Plan Inputs
        </button>
      </div>

      <h1 className="font-fraunces text-2xl font-semibold text-[#1F3B2E] mb-1">Your Weekly Plan</h1>
      <p className="text-sm text-[#5C5142] font-semibold mb-6">
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
              className={`border p-4 flex flex-col ${isToday ? 'border-[#1F3B2E]' : 'border-[#C7A467]'} ${isRest ? 'bg-[#EADFC4]' : 'bg-[#F6EFDE]'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-fraunces font-bold text-[#1F3B2E]">{label}</span>
                {isToday && <span className="text-[9px] font-semibold uppercase bg-[#1F3B2E] text-white px-1.5 py-0.5">Today</span>}
              </div>

              {isRest ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 text-[#5C5142]">
                  <Moon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Rest day</span>
                </div>
              ) : (
                <>
                  <span
                    className="inline-block self-start text-[9px] font-semibold uppercase tracking-wider text-white px-1.5 py-0.5 mb-2"
                    style={{ backgroundColor: EMPHASIS_COLOR[session!.emphasis] }}
                  >
                    {session!.emphasis}-heavy
                  </span>
                  <ul className="flex-1 space-y-1 mb-3">
                    {session!.items.map((item, i) => {
                      const p = getPractice(item.practiceId);
                      return p ? <li key={i} className="text-[11.5px] text-[#2A241E] font-semibold">&bull; {p.name}</li> : null;
                    })}
                  </ul>
                </>
              )}

              {session?.standaloneDhyana && (() => {
                const p = getPractice(session.standaloneDhyana.practiceId);
                return p ? (
                  <p className="text-[10.5px] text-[#1F3A5C] font-bold mb-2">+ Evening Dhyana: {p.name}</p>
                ) : null;
              })()}

              {((session && session.items.length > 0) || session?.standaloneDhyana) && (
                <button
                  onClick={() => onStartSession(dayIndex)}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 py-2 bg-[#1F3B2E] text-white border border-[#C7A467]/70 rounded-xl text-[11px] font-bold uppercase tracking-wide cursor-pointer hover:bg-[#2C5040]"
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
