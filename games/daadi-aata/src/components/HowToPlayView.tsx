import React from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, LotusIcon } from './FolkArtMotifs';
import { Play, Sparkles, ArrowRight, ShieldAlert, CheckCircle, Users } from 'lucide-react';

interface HowToPlayViewProps {
  onNavigate: (tab: ViewTab) => void;
  onStartGame: (mode: 'PVC' | 'PVP') => void;
}

export const HowToPlayView: React.FC<HowToPlayViewProps> = ({ onNavigate, onStartGame }) => {
  const rules = [
    {
      step: 'STEP 1',
      title: 'Each Player Gets 9 Pieces',
      subtitle: 'తొమ్మిది కాయలు',
      description:
        'Player 1 holds 9 Terracotta counters and Player 2 (or Kreedu AI) holds 9 Maroon counters. The board starts completely empty.',
      icon: (
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#D8401F] border-2 border-[#5C140F]" />
          <span className="text-xs font-bold font-fraunces text-[#5C140F]">×9</span>
        </div>
      ),
    },
    {
      step: 'STEP 2',
      title: 'Three Concentric Squares',
      subtitle: 'మూడు చతురస్రాల గ్రిడ్',
      description:
        'The board features 3 nested concentric squares joined by 4 midpoint lines, forming exactly 24 playable intersection nodes. There are NO diagonal lines.',
      icon: (
        <div className="w-5 h-5 border-2 border-[#5C140F] flex items-center justify-center p-0.5">
          <div className="w-2.5 h-2.5 border-[1.5px] border-[#D8401F]" />
        </div>
      ),
    },
    {
      step: 'STEP 3',
      title: 'Placement Phase',
      subtitle: 'కాయలు పెట్టే దశ',
      description:
        'Players alternate placing one counter per turn on any vacant intersection point on the board until all 18 pieces have entered play.',
      icon: <CheckCircle className="w-4 h-4 text-[#5F8F3B]" />,
    },
    {
      step: 'STEP 4',
      title: 'Forming a Mill (Daadi)',
      subtitle: 'దాడి ఏర్పడటం',
      description:
        'Aligning three of your pieces in a straight line along the marked grid creates a Mill (Daadi). This is the key strategic goal of the game.',
      icon: (
        <div className="flex items-center gap-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D8401F] border border-[#5C140F]" />
          <div className="w-2 h-[2px] bg-[#5C140F]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#D8401F] border border-[#5C140F]" />
          <div className="w-2 h-[2px] bg-[#5C140F]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#D8401F] border border-[#5C140F]" />
        </div>
      ),
    },
    {
      step: 'STEP 5',
      title: 'Capturing an Opponent Piece',
      subtitle: 'ప్రత్యర్థి కాయను తీసివేయడం',
      description:
        'When you form a Mill, remove one of your opponent’s pieces from the board. Rule: You cannot capture a piece that is in an active mill, unless ALL their pieces are in mills.',
      icon: <ShieldAlert className="w-4 h-4 text-[#D8401F]" />,
    },
    {
      step: 'STEP 6',
      title: 'Movement Phase',
      subtitle: 'కాయలను కదిలించే దశ',
      description:
        'After all 18 pieces are placed, players alternate sliding one piece along marked lines to an adjacent vacant intersection. Jumping is forbidden.',
      icon: <ArrowRight className="w-4 h-4 text-[#5C140F]" />,
    },
    {
      step: 'STEP 7',
      title: 'Block and Outmaneuver',
      subtitle: 'ప్రత్యర్థిని అడ్డుకోవడం',
      description:
        'Strategically open and close mills (oscillating mills), control 4-way intersection nodes, and trap opponent pieces so they have no room to move.',
      icon: <LotusIcon size={18} color="#D8401F" />,
    },
    {
      step: 'STEP 8',
      title: 'Victory Conditions',
      subtitle: 'విజయ నియమం',
      description:
        'You win immediately when your opponent is reduced to fewer than 3 pieces (cannot form mills) OR when the opponent has no legal moves on their turn.',
      icon: <Sparkles className="w-4 h-4 text-[#EFA90C]" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1 mb-2 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
          <LotusIcon size={18} color="#D8401F" />
          Official Rules Guide
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-fraunces text-[#5C140F] mb-1">
          HOW TO PLAY DAADI AATA
        </h2>
        <div className="font-telugu text-xl sm:text-2xl font-bold text-[#D8401F] mb-2">
          ఆట నియమాలు మరియు వ్యూహాలు
        </div>
        <p className="font-fraunces italic text-base sm:text-lg text-[#6B4E3D] max-w-2xl mx-auto">
          Master the ancient art of alignment and capture in 8 simple principles
        </p>
        <FolkDivider className="my-3" />
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {rules.map((rule, idx) => (
          <FolkArtFrame key={`rule-${idx}`} bg="bg-[#F6ECD2]" className="p-4 sm:p-5">
            <div className="flex items-start justify-between border-b-[2px] border-[#5C140F] pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#5C140F] text-white text-[11px] font-bold">
                  {rule.step}
                </span>
                <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#5C140F]">
                  {rule.title}
                </h3>
              </div>
              <div className="p-1 bg-[#E4D19E] border-[1.5px] border-[#5C140F]">
                {rule.icon}
              </div>
            </div>

            <div className="font-telugu text-xs font-bold text-[#D8401F] mb-1.5">
              {rule.subtitle}
            </div>

            <p className="text-xs text-[#2B1B12] leading-relaxed">
              {rule.description}
            </p>
          </FolkArtFrame>
        ))}
      </div>

      {/* Action Banner */}
      <FolkArtFrame bg="bg-[#F6ECD2]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-fraunces text-xl font-bold text-[#5C140F] mb-1">
              Want to see it in action?
            </h4>
            <p className="text-xs text-[#2B1B12]">
              Try our step-by-step interactive mini board before jumping into a full match.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('TUTORIAL')}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#E4D19E] hover:bg-[#FAF4E5] border-[2px] border-[#5C140F] text-xs font-bold text-[#2B1B12] uppercase cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D8401F]" />
              Tutorial
            </button>

            <button
              type="button"
              onClick={() => onStartGame('PVP')}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#E4D19E] hover:bg-[#FAF4E5] border-[2px] border-[#5C140F] text-xs font-bold text-[#2B1B12] uppercase cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#D8401F]" />
              2 Players
            </button>

            <button
              type="button"
              onClick={() => onNavigate('MODE_SELECT')}
              className="flex items-center gap-2 px-4 py-2 bg-[#D8401F] hover:bg-[#B83215] border-[2px] border-[#5C140F] text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Choose Mode & Play
            </button>
          </div>
        </div>
      </FolkArtFrame>
    </div>
  );
};
