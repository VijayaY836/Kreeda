import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DaySession, Mood, PlanSlotItem } from '../types';
import { getPractice } from '../data/practices';
import { playBell } from '../engine/audio';
import { CONTRA_LABELS } from './PracticeDetailModal';
import { StepViewer } from './StepViewer';
import { KreeduMascot } from './KreeduMascot';
import { getImage } from '../data/images';
import { X, Pause, Play, SkipForward, Check, Clock, Heart, ShieldAlert } from 'lucide-react';

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
  // played in a card over the Exercises page, which has its own close button
  inCard?: boolean;
}

const SECTION_COLOR: Record<string, string> = { yoga: '#1F3B2E', vyayam: '#A8402E', dhyana: '#1F3A5C' };
const SECTION_LABEL: Record<string, string> = { yoga: 'Yoga', vyayam: 'Vyayam', dhyana: 'Dhyana' };
const doseText = (it: PlanSlotItem) =>
  it.reps ? `${it.reps} reps` : it.rounds ? `${it.rounds} rounds` : it.durationSec < 90 ? `${it.durationSec} sec` : `${Math.round(it.durationSec / 60)} min`;

function slotLabel(slot: PlanSlotItem['slot']): string {
  return { warmup: 'Warm-up', main: 'Main Practice', cooldown: 'Cool-down', standalone: 'Evening Dhyana' }[slot];
}

export const SessionPlayer: React.FC<SessionPlayerProps> = ({ session, onExit, onComplete, inCard = false }) => {
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

  const pad = inCard ? 'px-4 sm:px-6 pt-14 pb-6 sm:pt-6' : 'px-4 py-6';
  const totalMin = Math.max(1, Math.round(items.reduce((sum, it) => sum + it.durationSec, 0) / 60));

  /* ---------- before starting: the session at a glance + mood check ---------- */
  if (!started) {
    return (
      <div className={`max-w-3xl mx-auto ${pad} wb-fade-in`}>
        {!inCard && (
          <button onClick={onExit} className="text-[#1F3B2E] cursor-pointer mb-2" aria-label="Leave session"><X className="w-5 h-5" /></button>
        )}
        <div className={`flex items-center gap-4 mb-5 ${inCard ? 'sm:pr-12' : ''}`}>
          <KreeduMascot size={72} className="shrink-0" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#A8402E]">Before you begin</p>
            <h2 className="font-fraunces text-2xl sm:text-3xl font-semibold text-[#1F3B2E]">
              {items.length === 1 ? getPractice(items[0].practiceId)?.name : 'Your session'}
            </h2>
            <p className="text-xs text-[#5C5142] mt-1 inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> About {totalMin} min · {items.length} {items.length === 1 ? 'practice' : 'practices'}
            </p>
          </div>
        </div>

        {items.length > 1 && (
          <ol className="grid sm:grid-cols-2 gap-2 mb-6">
            {items.map((it, i) => {
              const p = getPractice(it.practiceId);
              if (!p) return null;
              const img = getImage(it.practiceId);
              return (
                <li key={i} className="flex items-center gap-3 bg-[#FBF3E2] border border-[#C7A467]/70 rounded-xl px-3 py-2">
                  <span className="w-5 text-center text-[11px] font-bold text-[#5C5142]">{i + 1}</span>
                  <span className="w-10 h-10 rounded-lg bg-[#EADFC4] flex items-center justify-center overflow-hidden shrink-0">
                    {img && <img src={img} alt="" className="max-w-full max-h-full object-contain" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-fraunces font-bold text-sm text-[#1F3B2E] truncate">{p.name}</span>
                    <span className="block text-[10.5px] text-[#5C5142]">{slotLabel(it.slot)}</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#1F3B2E] whitespace-nowrap">{doseText(it)}</span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="bg-[#FBF3E2] border border-[#C7A467]/70 rounded-2xl p-5 text-center">
          <p className="text-sm text-[#1F3B2E] font-bold mb-3">How are you feeling right now?</p>
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-5">
            {MOODS.map(m => (
              <button
                key={m.key}
                onClick={() => setMoodBefore(m.key)}
                aria-pressed={moodBefore === m.key}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 border rounded-xl cursor-pointer transition-colors ${moodBefore === m.key ? 'bg-[#1F3B2E] border-[#1F3B2E] text-white' : 'bg-white border-[#C7A467]/70 hover:bg-[#F6EFDE]'}`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] font-bold">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={onExit} className="px-4 py-3 text-xs font-bold text-[#1F3B2E] border border-[#C7A467]/70 rounded-xl bg-[#F6EFDE] hover:bg-white cursor-pointer">Cancel</button>
            <button onClick={() => setStarted(true)} className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white bg-[#1F3B2E] rounded-xl cursor-pointer hover:bg-[#2C5040] shadow-[0_6px_18px_rgba(31,59,46,0.25)]">
              <Play className="w-4 h-4 fill-current" /> Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!item || !practice) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const next = items[index + 1] ? getPractice(items[index + 1].practiceId) : undefined;
  const hasMedia = practice.steps.length > 0 || !!practice.demoGif;
  // the ring empties as the time runs down
  const R = 54, C = 2 * Math.PI * R;
  const frac = item.durationSec > 0 ? secondsLeft / item.durationSec : 0;
  const accent = SECTION_COLOR[practice.section] ?? '#1F3B2E';

  // what it helps and how to stay safe: beside the timer on wide screens, after the steps on phones
  const details = (
    <div className="space-y-2">
            {practice.benefits.length > 0 && (
              <div className="rounded-xl border border-[#C7A467]/60 bg-white/60 p-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#1F3B2E] mb-1 flex items-center gap-1.5"><Heart className="w-3 h-3" /> Traditionally associated with</h3>
                <ul className="text-xs text-[#5C5142] leading-relaxed space-y-0.5">
                  {practice.benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}
            <div className="rounded-xl border border-[#C7A467]/60 bg-white/60 p-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#A8402E] mb-1 flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Move safely</h3>
              {practice.cautions.length > 0 ? (
                <ul className="text-xs text-[#5C5142] leading-relaxed space-y-0.5">
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
  );

  /* ---------- the practice: its steps / demo on the left, timer and controls on the right ---------- */
  return (
    <div className={`max-w-6xl mx-auto ${pad} wb-fade-in`}>
      {/* where you are in the session */}
      <div className={`flex items-center justify-between gap-3 mb-2 ${inCard ? 'sm:pr-12' : ''}`}>
        <div className="flex items-center gap-3">
          {!inCard && <button onClick={onExit} className="text-[#1F3B2E] cursor-pointer" aria-label="Leave session"><X className="w-5 h-5" /></button>}
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5142]">
            {slotLabel(item.slot)} · {index + 1} of {items.length}
          </span>
        </div>
        {next && <span className="text-[11px] text-[#5C5142] truncate">Up next: <strong className="text-[#1F3B2E]">{next.name}</strong></span>}
      </div>
      <div className="flex gap-1 mb-5" aria-hidden="true">
        {items.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: i < index ? '#1F3B2E' : i === index ? '#C4881F' : '#EADFC4' }} />
        ))}
      </div>

      <div className={`grid gap-5 items-start ${hasMedia ? 'lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]' : 'max-w-xl mx-auto'}`}>
        {/* how to do it: the practice's own step slider / demo GIF (fresh for each practice) */}
        {hasMedia && (
          <section className="bg-[#FBF3E2] border border-[#C7A467]/70 rounded-2xl p-3 sm:p-4 shadow-[0_8px_24px_rgba(42,30,20,0.08)]" aria-label={`How to do ${practice.name}`}>
            <StepViewer
              key={`${index}-${practice.id}`}
              practice={practice}
              imageClassName="w-full h-[34vh] lg:h-[min(46vh,420px)] object-contain rounded-xl bg-white/70"
            />
          </section>
        )}

        {/* timer, dose and controls — first on phones, so Complete is in reach without scrolling */}
        <section className="max-lg:order-first bg-[#F6EFDE] border border-[#C7A467]/70 rounded-2xl p-5 shadow-[0_8px_24px_rgba(42,30,20,0.08)]">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: accent }}>
              {SECTION_LABEL[practice.section] ?? practice.section}
            </span>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#5C5142] border border-[#C7A467]/70 px-1.5 py-0.5 rounded">{slotLabel(item.slot)}</span>
          </div>
          <h2 className="font-fraunces text-2xl sm:text-[28px] font-semibold text-[#1F3B2E] leading-tight">{practice.name}</h2>
          <p className="text-sm text-[#5C5142] font-semibold mb-4">{practice.name_english}</p>

          <div className="flex items-center gap-5 mb-4">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="60" cy="60" r={R} fill="none" stroke="#EADFC4" strokeWidth="9" />
                <circle cx="60" cy="60" r={R} fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-fraunces text-3xl font-bold text-[#1F3B2E] tabular-nums" aria-label={`${mm} minutes and ${ss} seconds remaining`}>{mm}:{ss}</span>
                {secondsLeft === 0 && <span className="text-[9px] font-bold uppercase tracking-wider text-[#3F6B4F]">Time's up</span>}
              </div>
            </div>
            <div className="min-w-0">
              {isRepBased ? (
                <>
                  <p className="font-fraunces text-2xl font-bold text-[#1F3B2E]">{item.reps != null ? `${item.reps} reps` : `${item.rounds} rounds`}</p>
                  <p className="text-[11px] text-[#5C5142] font-bold uppercase tracking-wide mt-1 leading-snug">The timer is a guide — move at your own pace</p>
                </>
              ) : (
                <p className="text-[12px] text-[#5C5142] leading-snug">Hold and breathe steadily. A bell sounds when the time is up.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => secondsLeft > 0 && setPaused(p => !p)}
              disabled={secondsLeft === 0}
              aria-label={paused ? 'Resume timer' : 'Pause timer'}
              className="w-12 h-12 flex items-center justify-center border border-[#C7A467]/70 rounded-xl bg-[#FBF3E2] hover:bg-white cursor-pointer text-[#1F3B2E] disabled:opacity-40 shrink-0"
            >
              {paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
            <button onClick={goNext} className="h-12 px-4 text-xs font-bold text-[#1F3B2E] border border-[#C7A467]/70 rounded-xl bg-[#FBF3E2] hover:bg-white cursor-pointer uppercase tracking-wider inline-flex items-center gap-1.5">
              Skip <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={goNext}
              className="h-12 flex-1 inline-flex items-center justify-center gap-1.5 px-5 bg-[#3F6B4F] hover:bg-[#355D43] text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_6px_16px_rgba(63,107,79,0.25)]"
            >
              <Check className="w-4 h-4" /> {index + 1 === items.length ? 'Finish' : 'Complete'}
            </button>
          </div>

          <div className={hasMedia ? 'max-lg:hidden' : ''}>{details}</div>
        </section>

        {hasMedia && <div className="lg:hidden">{details}</div>}
      </div>
    </div>
  );
};
