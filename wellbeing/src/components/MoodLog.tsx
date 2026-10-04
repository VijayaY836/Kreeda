import React, { useState } from 'react';
import { ArrowLeft, Check, NotebookPen } from 'lucide-react';
import { Mood, MoodLogEntry } from '../types';
import { FolkArtFrame } from './FolkArtFrame';

const MOODS: { key: Mood; emoji: string; label: string; color: string }[] = [
  { key: 'great', emoji: '😄', label: 'Great', color: '#2F6B45' },
  { key: 'good', emoji: '🙂', label: 'Good', color: '#5E8A3A' },
  { key: 'okay', emoji: '😐', label: 'Okay', color: '#B07A1A' },
  { key: 'low', emoji: '😔', label: 'Low', color: '#1F3A5C' },
  { key: 'stressed', emoji: '😣', label: 'Stressed', color: '#A8402E' },
];

interface MoodLogProps {
  entries: MoodLogEntry[];
  onBack: () => void;
  onSave: (mood: Mood, note: string) => void;
  // shown in a card over the Exercises page, which has its own close button
  inCard?: boolean;
}

export const MoodLog: React.FC<MoodLogProps> = ({ entries, onBack, onSave, inCard = false }) => {
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = () => {
    if (!mood) return;
    onSave(mood, note.trim());
    setMood(null);
    setNote('');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className={`${inCard ? 'max-w-4xl px-4 sm:px-6 pt-14 pb-6 sm:pt-6' : 'max-w-2xl px-4 py-6'} mx-auto wb-fade-in`}>
      {!inCard && (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[#1F3B2E] font-bold text-sm mb-5 cursor-pointer hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Exercises
        </button>
      )}

      <div className={`flex items-start gap-3 mb-6 ${inCard ? 'sm:pr-12' : ''}`}>
        <div className="w-11 h-11 rounded-full bg-[#1F3B2E] text-white flex items-center justify-center shrink-0">
          <NotebookPen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-fraunces text-2xl font-semibold text-[#1F3B2E]">Mood Log</h1>
          <p className="text-sm text-[#5C5142]">Record how you feel. Your entry will not change your plan or recommend exercises.</p>
        </div>
      </div>

      {/* in the card: new entry on the left, recent entries on the right */}
      <div className={inCard ? 'grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-5 items-start' : ''}>
      <FolkArtFrame className={inCard ? '' : 'mb-6'}>
        <p className="text-sm font-bold text-[#1F3B2E] mb-3">How are you feeling right now?</p>
        <div className={`grid grid-cols-5 gap-2 ${inCard ? 'mb-5' : 'mb-4'}`}>
          {MOODS.map(option => (
            <button
              key={option.key}
              type="button"
              aria-pressed={mood === option.key}
              onClick={() => setMood(option.key)}
              className={`flex flex-col items-center gap-1 px-2 ${inCard ? 'py-3.5' : 'py-3'} border rounded-xl cursor-pointer transition-all ${
                mood === option.key
                  ? 'text-white shadow-[0_6px_16px_rgba(42,30,20,0.18)] -translate-y-0.5'
                  : 'bg-white border-[#C7A467]/70 text-[#2A241E] hover:bg-[#F6EFDE]'
              }`}
              style={mood === option.key ? { backgroundColor: option.color, borderColor: option.color } : undefined}
            >
              <span className={inCard ? 'text-3xl' : 'text-2xl'} aria-hidden="true">{option.emoji}</span>
              <span className="text-[10px] font-bold">{option.label}</span>
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold text-[#1F3B2E] mb-4">
          Note <span className="font-normal text-[#5C5142]">(optional)</span>
          <textarea
            value={note}
            maxLength={280}
            onChange={event => setNote(event.target.value)}
            placeholder="Anything you want to remember?"
            className="mt-1.5 w-full min-h-24 resize-y rounded-xl border border-[#C7A467]/70 bg-white px-3 py-2.5 text-sm font-normal"
          />
          <span className="block text-right text-[10px] text-[#5C5142] mt-1">{note.length}/280</span>
        </label>

        <button
          type="button"
          disabled={!mood && !saved}
          onClick={submit}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl ${saved ? 'bg-[#2F6B45]' : 'bg-[#1F3B2E]'} text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save mood'}
        </button>
      </FolkArtFrame>

      <section aria-labelledby="mood-history-heading" className={inCard ? 'md:max-h-[min(460px,calc(100dvh-240px))] md:overflow-y-auto md:pr-1' : ''}>
        <h2 id="mood-history-heading" className="font-fraunces text-lg font-bold text-[#1F3B2E] mb-3">Recent entries</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-[#5C5142] bg-[#F6EFDE] border border-[#C7A467]/70 rounded-xl p-4">No moods recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {[...entries].reverse().slice(0, 12).map(entry => {
              const option = MOODS.find(item => item.key === entry.mood)!;
              return (
                <article key={entry.id} className="flex gap-3 rounded-xl border border-[#C7A467]/70 bg-[#F6EFDE] p-3" style={{ borderLeftColor: option.color, borderLeftWidth: 4 }}>
                  <span className="text-2xl" aria-hidden="true">{option.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <strong className="text-sm text-[#1F3B2E]">{option.label}</strong>
                      <time className="text-[10px] text-[#5C5142]" dateTime={entry.recordedAt}>
                        {new Date(entry.recordedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </time>
                    </div>
                    {entry.note && <p className="text-sm text-[#2A241E] mt-1 break-words">{entry.note}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      </div>
    </div>
  );
};
