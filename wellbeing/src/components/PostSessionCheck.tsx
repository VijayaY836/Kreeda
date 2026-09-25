import React, { useState } from 'react';
import { FeedbackRating, Mood } from '../types';
import { KreeduMascot, KreeduMood } from './KreeduMascot';

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'great', emoji: '😄', label: 'Great' },
  { key: 'good', emoji: '🙂', label: 'Good' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'low', emoji: '😔', label: 'Low' },
  { key: 'stressed', emoji: '😣', label: 'Stressed' },
];

const RATINGS: { key: FeedbackRating; label: string; mood: KreeduMood }[] = [
  { key: 'too_easy', label: 'Too Easy', mood: 'HAPPY' },
  { key: 'about_right', label: 'About Right', mood: 'IDLE' },
  { key: 'too_hard', label: 'Too Hard', mood: 'WORRIED' },
];

interface PostSessionCheckProps {
  onSubmit: (rating: FeedbackRating, moodAfter: Mood) => void;
}

export const PostSessionCheck: React.FC<PostSessionCheckProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-center wb-fade-in">
      <KreeduMascot size={84} mood={rating ? RATINGS.find(r => r.key === rating)!.mood : 'CELEBRATE'} className="mx-auto mb-4" />
      <h2 className="font-fraunces text-2xl font-semibold text-[#1F3B2E] mb-1">Session Complete!</h2>
      <p className="text-sm text-[#5C5142] font-semibold mb-6">A couple of quick questions and you're done.</p>

      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1F3B2E] mb-2.5">How did the intensity feel?</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {RATINGS.map(r => (
            <button
              key={r.key}
              onClick={() => setRating(r.key)}
              className={`px-4 py-2.5 border border-[#C7A467]/70 rounded-xl text-xs font-bold cursor-pointer ${rating === r.key ? 'bg-[#1F3B2E] text-white' : 'bg-[#F6EFDE] hover:bg-white'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1F3B2E] mb-2.5">How do you feel now?</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {MOODS.map(m => (
            <button
              key={m.key}
              onClick={() => setMood(m.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2.5 border border-[#C7A467]/70 rounded-xl cursor-pointer ${mood === m.key ? 'bg-[#1F3B2E] text-white' : 'bg-[#F6EFDE] hover:bg-white'}`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[10px] font-bold">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => rating && mood && onSubmit(rating, mood)}
        disabled={!rating || !mood}
        className="px-8 py-3 bg-[#3F6B4F] text-white border border-[#C7A467]/70 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Done
      </button>
    </div>
  );
};
