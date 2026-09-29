import React, { useState } from 'react';
import { CalendarCheck, Clock, Moon, Play, RefreshCw } from 'lucide-react';
import { PlanSlotItem, WeeklyPlan, Section } from '../types';
import { DAY_LABELS } from '../engine/planEngine';
import { getPractice } from '../data/practices';
import { getImage } from '../data/images';

interface TodayPlanProps {
  plan: WeeklyPlan;
  onStartSession: (dayIndex: number) => void;
  onEditInputs: () => void;
}

const SECTION_COLOR: Record<Section, string> = { yoga: '#1F3B2E', vyayam: '#A8402E', dhyana: '#1F3A5C' };
const SECTION_LABEL: Record<Section, string> = { yoga: 'Yoga', vyayam: 'Vyayam', dhyana: 'Dhyana' };
const SLOT_LABEL: Record<PlanSlotItem['slot'], string> = { warmup: 'Warm-up', main: 'Main', cooldown: 'Cool-down', standalone: 'Evening' };
const FOCUS_LABEL = { yoga: 'Yoga focus', vyayam: 'Vyayam focus', rest: 'Rest day' };

// "90 sec", "5 min", "12 reps", "3 rounds"
function dose(item: PlanSlotItem): string {
  if (item.reps) return `${item.reps} reps`;
  if (item.rounds) return `${item.rounds} rounds`;
  return item.durationSec < 90 ? `${item.durationSec} sec` : `${Math.round(item.durationSec / 60)} min`;
}

/* Today's Plan, opened in a card over the Exercises page: what today holds,
   one button to begin, and the week at a glance (tap a day to preview it). */
export const TodayPlan: React.FC<TodayPlanProps> = ({ plan, onStartSession, onEditInputs }) => {
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [dayIndex, setDayIndex] = useState(todayIndex);
  const session = plan.days.find(d => d.dayIndex === dayIndex);
  const items = [...(session?.items ?? []), ...(session?.standaloneDhyana ? [session.standaloneDhyana] : [])];
  const isRest = !session || session.emphasis === 'rest' || items.length === 0;
  const isToday = dayIndex === todayIndex;
  const totalMin = Math.max(1, Math.round(items.reduce((s, i) => s + i.durationSec, 0) / 60));
  const focusColor = session && session.emphasis !== 'rest' ? SECTION_COLOR[session.emphasis] : '#5C5142';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-6 sm:pt-6 wb-fade-in">
      {/* heading */}
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold text-[#A8402E]">
        <CalendarCheck className="w-4 h-4" /> Today's Plan
      </p>
      <div className="flex items-end justify-between gap-3 flex-wrap mt-1 mb-4 sm:pr-12">
        <div>
          <h2 className="font-fraunces text-3xl font-semibold text-[#1F3B2E] flex items-center gap-2.5">
            {DAY_LABELS[dayIndex]}
            {isToday && <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1F3B2E] text-white px-2 py-0.5 rounded-full">Today</span>}
          </h2>
          <p className="text-xs text-[#5C5142] mt-1">
            Up to {plan.profile.dailyMinutes} min/day · {plan.profile.daysPerWeek} days/week · {plan.profile.fitnessLevel} level
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wide text-white px-3 py-1 rounded-full" style={{ backgroundColor: focusColor }}>
            {FOCUS_LABEL[isRest ? 'rest' : session!.emphasis]}
          </span>
          {!isRest && (
            <button
              type="button"
              onClick={() => onStartSession(dayIndex)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F3B2E] hover:bg-[#2C5040] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_6px_18px_rgba(31,59,46,0.25)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> {isToday ? 'Begin today’s practice' : `Start ${DAY_LABELS[dayIndex]}’s session`}
            </button>
          )}
        </div>
      </div>

      {/* the week: tap a day to preview it */}
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#5C5142] mb-2">This week</p>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="tablist" aria-label="Days of the week">
        {DAY_LABELS.map((label, d) => {
          const s = plan.days.find(x => x.dayIndex === d);
          const rest = !s || s.emphasis === 'rest' || (s.items.length === 0 && !s.standaloneDhyana);
          const color = rest ? '#B8AC94' : SECTION_COLOR[s!.emphasis as Section];
          const selected = d === dayIndex;
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${label}${d === todayIndex ? ' (today)' : ''}: ${rest ? 'rest' : FOCUS_LABEL[s!.emphasis as 'yoga' | 'vyayam']}`}
              onClick={() => setDayIndex(d)}
              className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                selected ? 'bg-[#1F3B2E] border-[#1F3B2E] text-white' : 'bg-[#F6EFDE] border-[#C7A467]/70 text-[#1F3B2E] hover:bg-white'
              } ${d === todayIndex && !selected ? 'ring-2 ring-[#C4881F] ring-offset-1 ring-offset-[#F1E8D2]' : ''}`}
            >
              <span className="text-[11px] font-bold">{label.slice(0, 3)}</span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selected ? '#FBF3E2' : color }} />
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 flex-wrap mt-2 mb-5 text-[10.5px] text-[#5C5142]">
        {(['yoga', 'vyayam'] as const).map(k => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLOR[k] }} />{FOCUS_LABEL[k]}</span>
        ))}
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#B8AC94]" />Rest</span>
      </div>

      {/* the chosen day */}
      <div className="bg-[#FBF3E2] border border-[#C7A467]/80 rounded-2xl shadow-[0_8px_24px_rgba(42,30,20,0.08)] overflow-hidden">
        {isRest ? (
          <div className="py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EADFC4] mx-auto mb-3 flex items-center justify-center">
              <Moon className="w-6 h-6 text-[#5C5142]" />
            </div>
            <p className="font-fraunces text-xl text-[#1F3B2E]">Rest day</p>
            <p className="text-sm text-[#5C5142] mt-1">Recovery is part of the practice. Pick another day above to preview it.</p>
            <button type="button" onClick={onEditInputs} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F3B2E] border border-[#C7A467]/70 rounded-xl px-3 py-1.5 bg-[#F6EFDE] hover:bg-white cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Edit plan inputs
            </button>
          </div>
        ) : (
          <>
            <ol className="divide-y divide-[#C7A467]/40">
              {items.map((item, i) => {
                const p = getPractice(item.practiceId);
                if (!p) return null;
                const img = getImage(item.practiceId);
                const evening = item.slot === 'standalone';
                return (
                  <li key={i} className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 ${evening ? 'bg-[#EEF1F5]/60' : ''}`}>
                    <span className="w-6 text-center text-xs font-bold text-[#5C5142] shrink-0">{i + 1}</span>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#EADFC4] border border-[#C7A467]/60 flex items-center justify-center overflow-hidden shrink-0">
                      {img
                        ? <img src={img} alt="" className="max-w-full max-h-full object-contain" />
                        : evening ? <Moon className="w-5 h-5 text-[#1F3A5C]" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-fraunces font-bold text-[#1F3B2E] leading-tight truncate">{p.name}</p>
                      <p className="text-[11.5px] text-[#5C5142] truncate">{p.name_english}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: SECTION_COLOR[p.section] }}>
                          {SECTION_LABEL[p.section]}
                        </span>
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#5C5142] border border-[#C7A467]/70 px-1.5 py-0.5 rounded">
                          {SLOT_LABEL[item.slot]}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#1F3B2E] whitespace-nowrap shrink-0">{dose(item)}</span>
                  </li>
                );
              })}
            </ol>
            <div className="flex items-center justify-between gap-3 flex-wrap px-4 sm:px-5 py-3 bg-[#EADFC4]/60 border-t border-[#C7A467]/50">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C5142]">
                <Clock className="w-4 h-4" /> About {totalMin} min · {items.length} {items.length === 1 ? 'practice' : 'practices'}
              </span>
              <button type="button" onClick={onEditInputs} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F3B2E] border border-[#C7A467]/70 rounded-xl px-3 py-1.5 bg-[#F6EFDE] hover:bg-white cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> Edit plan inputs
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
