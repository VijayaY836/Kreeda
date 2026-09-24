import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DaySession, Mood, PlanSlotItem } from '../types';
import { getPractice } from '../data/practices';
import { playBell } from '../engine/audio';
import { KreeduMascot } from './KreeduMascot';
import { X, Pause, Play, SkipForward, Check } from 'lucide-react';

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'great', emoji: '😄', label: 'Great' },
  { key: 'good', emoji: '🙂', label: 'Good' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'low', emoji: '😔', label: 'Low' },
  { key: 'stressed', emoji: '😣', label: 'Stressed' },
];

interface SessionPlayerProps {
  session: DaySession;
  onExit: () => void;
  onComplete: (moodBefore: Mood | null) => void;
}

function slotLabel(slot: PlanSlotItem['slot']): string {
  return { warmup: 'Warm-up', main: 'Main Practice', cooldown: 'Cool-down', standalone: 'Evening Dhyana' }[slot];
}

export const SessionPlayer: React.FC<SessionPlayerProps> = ({ session, onExit, onComplete }) => {
  const items = useMemo(
    () => [...session.items, ...(session.standaloneDhyana ? [session.standaloneDhyana] : [])],
    [session],
  );

  const [moodBefore, setMoodBefore] = useState<Mood | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const item = items[index];
  const practice = item ? getPractice(item.practiceId) : undefined;
  const isTimerMode = !!practice && practice.reps == null && practice.rounds == null;

  useEffect(() => {
    if (!started || !item) return;
    setSecondsLeft(item.durationSec);
    playBell();
  }, [index, started]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!started || paused || !isTimerMode) return;
    if (secondsLeft <= 0) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          playBell();
          window.setTimeout(() => goNext(), 300);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [started, paused, isTimerMode, index]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (index + 1 >= items.length) {
      onComplete(moodBefore);
    } else {
      setIndex(i => i + 1);
    }
  };

  if (!started) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center wb-fade-in">
        <KreeduMascot size={80} className="mx-auto mb-4" />
        <h2 className="font-fraunces text-2xl font-extrabold text-[#5C140F] mb-2">Before you begin</h2>
        <p className="text-sm text-[#6B4E3D] font-semibold mb-5">How are you feeling right now?</p>
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {MOODS.map(m => (
            <button
              key={m.key}
              onClick={() => setMoodBefore(m.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2.5 border-2 border-[#5C140F] cursor-pointer ${moodBefore === m.key ? 'bg-[#D8401F] text-white' : 'bg-[#F6ECD2] hover:bg-white'}`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[10px] font-bold">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={onExit} className="px-4 py-2.5 text-xs font-bold text-[#5C140F] border-2 border-[#5C140F] bg-[#F6ECD2] cursor-pointer">Cancel</button>
          <button onClick={() => setStarted(true)} className="px-6 py-2.5 text-xs font-bold uppercase text-white bg-[#D8401F] border-2 border-[#5C140F] cursor-pointer hover:bg-[#B83215]">
            Start Session
          </button>
        </div>
      </div>
    );
  }

  if (!item || !practice) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="max-w-xl mx-auto px-4 py-6 wb-fade-in">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onExit} className="text-[#5C140F] cursor-pointer"><X className="w-5 h-5" /></button>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#6B4E3D]">
          {slotLabel(item.slot)} &middot; {index + 1} / {items.length}
        </span>
        <span />
      </div>

      <div className="h-1.5 bg-[#E4D19E] border border-[#5C140F] mb-6">
        <div className="h-full bg-[#D8401F] transition-all" style={{ width: `${((index) / items.length) * 100}%` }} />
      </div>

      <div className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-6 text-center mb-5">
        <h2 className="font-fraunces text-2xl font-extrabold text-[#5C140F] mb-0.5">{practice.name}</h2>
        <p className="text-sm text-[#6B4E3D] font-semibold mb-4">{practice.name_english}</p>

        {isTimerMode ? (
          <div className="font-fraunces text-5xl font-black text-[#D8401F] mb-3 tabular-nums">{mm}:{ss}</div>
        ) : (
          <div className="mb-3">
            <div className="font-fraunces text-4xl font-black text-[#D8401F]">
              {item.reps != null ? `${item.reps} reps` : item.rounds != null ? `${item.rounds} rounds` : ''}
            </div>
            <p className="text-[11px] text-[#6B4E3D] font-bold uppercase tracking-wide mt-1">Go at your own pace — ardhashakti, not maximum effort</p>
          </div>
        )}

        <ol className="text-left text-[13px] text-[#2B1B12] leading-relaxed list-decimal list-inside space-y-1 max-w-md mx-auto">
          {practice.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </div>

      <div className="flex items-center justify-center gap-2.5">
        {isTimerMode ? (
          <>
            <button onClick={() => setPaused(p => !p)} className="w-11 h-11 flex items-center justify-center border-2 border-[#5C140F] bg-[#F6ECD2] hover:bg-white cursor-pointer text-[#5C140F]">
              {paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
            <button onClick={goNext} className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#5C140F] text-white border-2 border-[#5C140F] font-bold text-xs uppercase tracking-wider cursor-pointer">
              Skip <SkipForward className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button onClick={goNext} className="px-5 py-3 text-xs font-bold text-[#5C140F] border-2 border-[#5C140F] bg-[#F6ECD2] hover:bg-white cursor-pointer uppercase tracking-wider">
              Skip
            </button>
            <button
              onClick={goNext}
              className="inline-flex items-center gap-1.5 px-7 py-3 bg-[#5F8F3B] text-white border-2 border-[#5C140F] font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <Check className="w-4 h-4" /> Mark Complete
            </button>
          </>
        )}
      </div>
    </div>
  );
};
