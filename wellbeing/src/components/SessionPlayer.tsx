import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DaySession, Mood, PlanSlotItem } from '../types';
import { getPractice } from '../data/practices';
import { playBell } from '../engine/audio';
import { CONTRA_LABELS } from './PracticeDetailModal';
import { KreeduMascot } from './KreeduMascot';
import { X, Pause, Play, SkipForward, Check } from 'lucide-react';

// Product decisions still marked OPEN in §7.4. Keeping them here makes the
// behavior deliberate and easy to change without rewriting the player.
export const PLAYER_CONFIG = {
  autoAdvance: false,
  restSeconds: 0,
} as const;

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
  const isRepBased = !!practice && (practice.reps != null || practice.rounds != null);
  // The countdown runs only while there is time left and it isn't paused.
  // Depending on this (not on secondsLeft itself) lets the interval start once
  // the new item's duration has been loaded, without restarting on every tick.
  const running = started && !paused && secondsLeft > 0;

  useEffect(() => {
    if (!started || !item) return;
    setSecondsLeft(item.durationSec);
    setPaused(false);
    playBell();
  }, [index, started]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          playBell();
          if (PLAYER_CONFIG.autoAdvance) window.setTimeout(() => goNext(), 300);
          else setPaused(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [running, index]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <h2 className="font-fraunces text-2xl font-semibold text-[#1F3B2E] mb-2">Before you begin</h2>
        <p className="text-sm text-[#5C5142] font-semibold mb-5">How are you feeling right now?</p>
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {MOODS.map(m => (
            <button
              key={m.key}
              onClick={() => setMoodBefore(m.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2.5 border border-[#C7A467]/70 rounded-xl cursor-pointer ${moodBefore === m.key ? 'bg-[#1F3B2E] text-white' : 'bg-[#F6EFDE] hover:bg-white'}`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[10px] font-bold">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={onExit} className="px-4 py-2.5 text-xs font-bold text-[#1F3B2E] border border-[#C7A467]/70 rounded-xl bg-[#F6EFDE] cursor-pointer">Cancel</button>
          <button onClick={() => setStarted(true)} className="px-6 py-2.5 text-xs font-bold uppercase text-white bg-[#1F3B2E] border border-[#C7A467]/70 rounded-xl cursor-pointer hover:bg-[#2C5040]">
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
        <button onClick={onExit} className="text-[#1F3B2E] cursor-pointer"><X className="w-5 h-5" /></button>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#5C5142]">
          {slotLabel(item.slot)} &middot; {index + 1} / {items.length}
        </span>
        <span />
      </div>

      <div className="h-1.5 bg-[#EADFC4] border border-[#C7A467] mb-6">
        <div className="h-full bg-[#1F3B2E] transition-all" style={{ width: `${((index) / items.length) * 100}%` }} />
      </div>

      <div className="bg-[#F6EFDE] border border-[#C7A467]/70 rounded-2xl shadow-[0_8px_24px_rgba(42,30,20,0.10)] p-6 text-center mb-5">
        <h2 className="font-fraunces text-2xl font-semibold text-[#1F3B2E] mb-0.5">{practice.name}</h2>
        <p className="text-sm text-[#5C5142] font-semibold mb-4">{practice.name_english}</p>

        <div className="font-fraunces text-5xl font-bold text-[#1F3B2E] mb-1 tabular-nums" aria-label={`${mm} minutes and ${ss} seconds remaining`}>{mm}:{ss}</div>
        {isRepBased && (
          <div className="mb-3">
            <div className="font-fraunces text-xl font-bold text-[#1F3B2E]">
              {item.reps != null ? `${item.reps} reps` : `${item.rounds} rounds`}
            </div>
            <p className="text-[11px] text-[#5C5142] font-bold uppercase tracking-wide mt-1">The timer is a guide — move at your own pace</p>
          </div>
        )}

        {practice.demoGif && (
          <div className="mb-4 bg-[#EADFC4] border border-[#C7A467]/70 rounded-xl p-2 inline-block">
            <img src={practice.demoGif} alt={`${practice.name} step-by-step demo`} className="max-w-full max-h-64 mx-auto" />
          </div>
        )}

        <ol className="text-left text-[13px] text-[#2A241E] leading-relaxed list-decimal list-inside space-y-1 max-w-md mx-auto">
          {practice.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>

        <div className="grid sm:grid-cols-2 gap-2 mt-5 text-left">
          <div className="rounded-xl border border-[#C7A467]/60 bg-white/60 p-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#1F3B2E] mb-1">Details</h3>
            <ul className="text-xs text-[#5C5142] leading-relaxed space-y-1">
              {practice.benefits.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-[#C7A467]/60 bg-white/60 p-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#A8402E] mb-1">Move safely</h3>
            {practice.cautions.length > 0 ? (
              <ul className="text-xs text-[#5C5142] leading-relaxed space-y-1">
                {practice.cautions.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            ) : (
              <p className="text-xs text-[#5C5142] leading-relaxed">Stop if you feel pain or discomfort.</p>
            )}
            {practice.contraindications.length > 0 && (
              <p className="text-[11px] text-[#A8402E] font-semibold leading-relaxed mt-1.5">
                Avoid with: {practice.contraindications.map(c => CONTRA_LABELS[c] ?? c).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2.5">
        <button
          onClick={() => secondsLeft > 0 && setPaused(p => !p)}
          disabled={secondsLeft === 0}
          aria-label={paused ? 'Resume timer' : 'Pause timer'}
          className="w-11 h-11 flex items-center justify-center border border-[#C7A467]/70 rounded-xl bg-[#F6EFDE] hover:bg-white cursor-pointer text-[#1F3B2E] disabled:opacity-40"
        >
          {paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
        </button>
        <button onClick={goNext} className="px-5 py-3 text-xs font-bold text-[#1F3B2E] border border-[#C7A467]/70 rounded-xl bg-[#F6EFDE] hover:bg-white cursor-pointer uppercase tracking-wider">
          Skip <SkipForward className="inline w-3.5 h-3.5 ml-1" />
        </button>
        <button
          onClick={goNext}
          className="inline-flex items-center gap-1.5 px-7 py-3 bg-[#3F6B4F] text-white border border-[#C7A467]/70 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <Check className="w-4 h-4" /> {index + 1 === items.length ? 'Finish' : 'Complete'}
        </button>
      </div>
    </div>
  );
};
