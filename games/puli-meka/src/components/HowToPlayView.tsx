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
      title: 'Puli Start at the Apex',
      subtitle: 'పులి ఆరంభ స్థానం',
      description:
        'Three Tigers (Puli) begin on the apex of the board: one at the top, and two just below it on the inner nodes. Fifteen Goats (Meka) start completely off the board.',
      icon: (
        <div className="flex items-center gap-1">
          <span className="text-xl">🐯</span>
          <span className="text-xs font-bold font-fraunces text-[#5C140F]">×3</span>
        </div>
      ),
    },
    {
      step: 'STEP 2',
      title: 'The Game Board',
      subtitle: 'ఆట పలక నిర్మాణం',
      description:
        'The board has 23 connected nodes arranged in 4 diagonal lines crossed by a rectangle band. Nodes are linked by straight lines (no diagonal jumps).',
      icon: (
        <div className="w-5 h-5 border-2 border-[#5C140F] flex items-center justify-center p-0.5">
          <div className="w-2.5 h-2.5 border-[1.5px] border-[#0E5C58]" />
        </div>
      ),
    },
    {
      step: 'STEP 3',
      title: 'Goat Placement Phase',
      subtitle: 'మేక ఆరంభ దశ',
      description:
        'Goats place one at a time on any empty node. Tigers can move and capture while goats are still placing. Placement continues until all 15 goats are on the board.',
      icon: <CheckCircle className="w-4 h-4 text-[#5F8F3B]" />,
    },
    {
      step: 'STEP 4',
      title: 'Tigers Hunt by Jumping',
      subtitle: 'పులి దూకుట కాపరి',
      description:
        'A Tiger captures a Goat by jumping over it in a straight line onto an empty node beyond it. This is just like Checkers. Multiple jumps are NOT allowed in one turn.',
      icon: (
        <div className="flex items-center gap-0.5">
          <span className="text-lg">🐯</span>
          <div className="w-1.5 h-[1px] bg-[#5C140F]" />
          <span className="text-lg">🐐</span>
          <div className="w-1.5 h-[1px] bg-[#5C140F]" />
          <div className="w-2 h-2 border border-[#5C140F]" />
        </div>
      ),
    },
    {
      step: 'STEP 5',
      title: 'Goats Must Be Placed First',
      subtitle: 'మేక ప్రక్రియ',
      description:
        'Goats cannot move until all 15 have been placed on the board. Tigers can move and attack during this entire placement phase.',
      icon: <ShieldAlert className="w-4 h-4 text-[#D8401F]" />,
    },
    {
      step: 'STEP 6',
      title: 'Movement After Placement',
      subtitle: 'ఆట దశ కదలిక',
      description:
        'Once all goats are placed, they move one step along connected lines to adjacent empty nodes. Tigers also move one step per turn (unless jumping to capture).',
      icon: <ArrowRight className="w-4 h-4 text-[#5C140F]" />,
    },
    {
      step: 'STEP 7',
      title: 'Goats Must Coordinate',
      subtitle: 'మేక సమన్వయం',
      description:
        'Goats win by forming blockades that prevent all three tigers from moving. Control key nodes and restrict tiger mobility. Prevent tigers from accessing nodes where they can jump.',
      icon: <LotusIcon size={18} color="#D8401F" />,
    },
    {
      step: 'STEP 8',
      title: 'Victory Conditions',
      subtitle: 'విజయ నియమం',
      description:
        'Puli WIN by capturing 5 Goats. Meka WIN by cornering all 3 Tigers so they have no legal moves. A draw occurs if the same board position repeats three times.',
      icon: <Sparkles className="w-4 h-4 text-[#EFA90C]" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1 mb-2 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
          <Play className="w-4 h-4 text-[#D8401F]" />
          How It Works
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-fraunces text-[#5C140F] mb-2">
          HOW TO PLAY PULI MEKA
        </h2>
        <p className="font-fraunces italic text-base sm:text-lg text-[#6B4E3D]">
          Follow these 8 steps to master the ancient hunt.
        </p>
        <FolkDivider className="my-3" />
      </div>

      {/* Rules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {rules.map((rule, idx) => (
          <FolkArtFrame key={idx} bg="bg-[#E4D19E]">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-shrink-0 pt-1">
                {rule.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-fraunces text-xs font-bold uppercase text-[#D8401F] tracking-wide mb-0.5">
                  {rule.step}
                </h4>
                <h3 className="font-fraunces text-lg font-bold text-[#5C140F] mb-1">
                  {rule.title}
                </h3>
                <p className="font-telugu text-xs text-[#6B4E3D] mb-2">
                  {rule.subtitle}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#2B1B12] leading-relaxed">
              {rule.description}
            </p>
          </FolkArtFrame>
        ))}
      </div>

      {/* Quick Strategy Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <FolkArtFrame bg="bg-[#F6ECD2]">
          <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mb-3 flex items-center gap-2">
            <span className="text-xl">🐯</span> Puli Strategy
          </h3>
          <ul className="space-y-2 text-sm text-[#2B1B12]">
            <li className="flex gap-2">
              <span className="text-[#D8401F] font-bold flex-shrink-0">•</span>
              <span>Hunt aggressively during goat placement. Free captures!</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D8401F] font-bold flex-shrink-0">•</span>
              <span>Control central nodes with 4-way access for mobility.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D8401F] font-bold flex-shrink-0">•</span>
              <span>Capture 5 goats quickly before they organize defenses.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D8401F] font-bold flex-shrink-0">•</span>
              <span>Keep all 3 tigers active and spread out.</span>
            </li>
          </ul>
        </FolkArtFrame>

        <FolkArtFrame bg="bg-[#F6ECD2]">
          <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mb-3 flex items-center gap-2">
            <span className="text-xl">🐐</span> Meka Strategy
          </h3>
          <ul className="space-y-2 text-sm text-[#2B1B12]">
            <li className="flex gap-2">
              <span className="text-[#0E5C58] font-bold flex-shrink-0">•</span>
              <span>Place defensively. Avoid isolating goats.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#0E5C58] font-bold flex-shrink-0">•</span>
              <span>Create clusters that protect each other.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#0E5C58] font-bold flex-shrink-0">•</span>
              <span>After placement, gradually tighten the blockade.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#0E5C58] font-bold flex-shrink-0">•</span>
              <span>Trap tigers by controlling their escape routes.</span>
            </li>
          </ul>
        </FolkArtFrame>
      </div>

      {/* Call to Action */}
      <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => onStartGame('PVC')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D8401F] text-white border-[3px] border-[#5C140F] font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          <Play className="w-4 h-4 fill-current" />
          vs Kreedu AI
        </button>
        <button
          onClick={() => onStartGame('PVP')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#E4D19E] text-[#5C140F] border-[3px] border-[#5C140F] font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          <Users className="w-4 h-4" />
          2-Player Local
        </button>
      </div>
    </div>
  );
};
