import React from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, LotusIcon } from './FolkArtMotifs';
import { Play, BookOpen, ArrowRight } from 'lucide-react';

interface InteractiveTutorialProps {
  onComplete: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onComplete }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1 mb-2 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
          <BookOpen className="w-4 h-4 text-[#D8401F]" />
          Step-by-Step Learning
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-fraunces text-[#5C140F] mb-2">
          LEARN PULI MEKA
        </h2>
        <p className="font-fraunces italic text-base sm:text-lg text-[#6B4E3D]">
          Master the hunt through interactive learning.
        </p>
        <FolkDivider className="my-4" />
      </div>

      <FolkArtFrame bg="bg-[#F6ECD2]" className="mb-8">
        <div className="space-y-4">
          <div>
            <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-3">
              Ready to Learn?
            </h3>
            <p className="text-sm text-[#2B1B12] leading-relaxed mb-4">
              Puli Meka is a fascinating game of asymmetric strategy. The best way to learn is by doing!
            </p>
            <p className="text-sm text-[#2B1B12] leading-relaxed">
              Start with the <strong>How to Play</strong> section to understand the rules, then jump right into a game. Play against Kreedu AI and learn as you go — our AI is smart enough to challenge you but also gives helpful feedback.
            </p>
          </div>

          <div className="border-t-[2px] border-[#5C140F] pt-4">
            <h4 className="font-bold text-[#5C140F] mb-2">Key Learning Stages:</h4>
            <div className="space-y-2">
              <div className="p-3 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <p className="text-xs font-bold text-[#5C140F] mb-1">STAGE 1: Placement Phase</p>
                <p className="text-xs text-[#2B1B12]">Watch how Goats enter the board while Tigers look for early hunting opportunities.</p>
              </div>
              <div className="p-3 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <p className="text-xs font-bold text-[#5C140F] mb-1">STAGE 2: Movement & Capture</p>
                <p className="text-xs text-[#2B1B12]">Once all pieces are placed, the real battle begins. Jump over Goats or form blockades.</p>
              </div>
              <div className="p-3 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <p className="text-xs font-bold text-[#5C140F] mb-1">STAGE 3: Strategic Mastery</p>
                <p className="text-xs text-[#2B1B12]">After a few games, you'll understand node values, attack patterns, and defensive formations.</p>
              </div>
            </div>
          </div>
        </div>
      </FolkArtFrame>

      <FolkArtFrame bg="bg-[#E4D19E]" className="mb-8">
        <h3 className="font-fraunces text-lg font-bold text-[#5C140F] mb-3">Pro Tips for Learning</h3>
        <ul className="space-y-2 text-sm text-[#2B1B12]">
          <li className="flex gap-2">
            <span className="text-[#D8401F] font-bold">🐯</span>
            <span><strong>As Puli (Tigers):</strong> Aggressively hunt during goat placement. It's your advantage window!</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#0E5C58] font-bold">🐐</span>
            <span><strong>As Meka (Goats):</strong> Place defensively and cluster together. Prevent tiger mobility.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#EFA90C] font-bold">📍</span>
            <span><strong>Control Key Nodes:</strong> 4-way intersections give maximum movement flexibility.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#5C140F] font-bold">🎯</span>
            <span><strong>Think Ahead:</strong> Always anticipate where your opponent wants to move next turn.</span>
          </li>
        </ul>
      </FolkArtFrame>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onComplete}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D8401F] text-white border-[3px] border-[#5C140F] font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          <Play className="w-4 h-4 fill-current" />
          Play Now
        </button>
      </div>
    </div>
  );
};
