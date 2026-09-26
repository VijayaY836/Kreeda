import React, { useState } from 'react';
import { ArrowLeft, Check, NotebookPen } from 'lucide-react';
import { Mood, MoodLogEntry } from '../types';
import { FolkArtFrame } from './FolkArtFrame';

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'great', emoji: '😄', label: 'Great' },
  { key: 'good', emoji: '🙂', label: 'Good' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'low', emoji: '😔', label: 'Low' },
  { key: 'stressed', emoji: '😣', label: 'Stressed' },
];

interface MoodLogProps {
  entries: MoodLogEntry[];
  onBack: () => void;
  onSave: (mood: Mood, note: string) => void;
}

export const MoodLog: React.FC<MoodLogProps> = ({ entries, onBack, onSave }) => {
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
    <div className="max-w-2xl mx-auto px-4 py-6 wb-fade-in">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[#1F3B2E] font-bold text-sm mb-5 cursor-pointer hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Exercises
      </button>

      <div className="flex items-start gap-3 mb-6">
        <div className="w-11 h-11 rounded-full bg-[#1F3B2E] text-white flex items-center justify-center shrink-0">
          <NotebookPen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-fraunces text-2xl font-semibold text-[#1F3B2E]">Mood Log</h1>
          <p className="text-sm text-[#5C5142]">Record how you feel. Your entry will not change your plan or recommend exercises.</p>
        </div>
      </div>

      <FolkArtFrame className="mb-6">
        <p className="text-sm font-bold text-[#1F3B2E] mb-3">How are you feeling right now?</p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {MOODS.map(option => (
            <button
              key={option.key}
              type="button"
              aria-pressed={mood === option.key}
              onClick={() => setMood(option.key)}
              className={`flex flex-col items-center gap-1 px-2 py-3 border rounded-xl cursor-pointer transition-colors ${
                mood === option.key
                  ? 'bg-[#1F3B2E] border-[#1F3B2E] text-white'
                  : 'bg-white border-[#C7A467]/70 text-[#2A241E] hover:bg-[#F6EFDE]'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{option.emoji}</span>
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
          disabled={!mood}
          onClick={submit}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1F3B2E] text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save mood'}
        </button>
      </FolkArtFrame>

      <section aria-labelledby="mood-history-heading">
        <h2 id="mood-history-heading" className="font-fraunces text-lg font-bold text-[#1F3B2E] mb-3">Recent entries</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-[#5C5142] bg-[#F6EFDE] border border-[#C7A467]/70 rounded-xl p-4">No moods recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {[...entries].reverse().slice(0, 12).map(entry => {
              const option = MOODS.find(item => item.key === entry.mood)!;
              return (
                <article key={entry.id} className="flex gap-3 rounded-xl border border-[#C7A467]/70 bg-[#F6EFDE] p-3">
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
  );
};
