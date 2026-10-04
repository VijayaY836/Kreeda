import React from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, LotusIcon } from './FolkArtMotifs';
import { Play, ArrowRight, Zap, Users, Target, Shield } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (tab: ViewTab) => void;
  onStartGame: (mode: 'PVC' | 'PVP') => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1 mb-2 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
          <LotusIcon size={18} color="#D8401F" />
          Cultural Introduction
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-fraunces text-[#5C140F] mb-1">
          MEET PULI MEKA
        </h2>
        <div className="font-telugu text-xl sm:text-2xl font-bold text-[#D9587B] mb-2">
          పులి మేక ఆట — ఒక అతి పురాతన వేటకల ఆట
        </div>
        <p className="font-fraunces italic text-base sm:text-lg text-[#6B4E3D] max-w-2xl mx-auto">
          "An ancient Indian game of strategy, asymmetry, and the eternal dance between predator and prey."
        </p>
        <FolkDivider className="my-3" />
      </div>

      {/* Main Story Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-7 flex flex-col gap-4">
          <FolkArtFrame bg="bg-[#F6ECD2]">
            <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-3">
              The Essence of the Game
            </h3>
            <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
              <strong>Puli Meka</strong> (పులి మేక in Telugu) is an ancient Indian predator-prey strategy game, known across South Asia by many names: <strong>Aadu Puli Aatam</strong> in Tamil and Kannada regions, and <strong>Bagh-Chal</strong> (meaning "Tiger Game") in Nepal and the Himalayas.
            </p>
            <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
              The game is fundamentally asymmetric: three powerful but isolated tigers (Puli) hunt across a 23-node board while fifteen goats (Meka) enter the board one-by-one and must coordinate to survive. Tigers win by capturing 5 goats; goats win by surrounding all 3 tigers.
            </p>
            <p className="text-sm text-[#2B1B12] leading-relaxed">
              Unlike games of abstract alignment, Puli Meka is fundamentally ecological. It captures a timeless story: individual strength versus collective survival, mobility versus numerical advantage, and the forever-tense relationship between hunter and hunted.
            </p>
          </FolkArtFrame>

          <FolkArtFrame bg="bg-[#F6ECD2]">
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mb-2">
              The Three Core Virtues
            </h3>
            <p className="text-xs text-[#6B4E3D] mb-4">
              Traditional Indian gaming philosophy treats board games as cognitive development tools:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <Zap className="w-4 h-4 text-[#D8401F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5C140F]">Strategic Asymmetry</h4>
                  <p className="text-[11px] text-[#2B1B12]/80">Playing different games simultaneously — Puli hunts; Meka defends.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <Target className="w-4 h-4 text-[#0E5C58] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5C140F]">Collective Coordination</h4>
                  <p className="text-[11px] text-[#2B1B12]/80">As goats, no single move matters — only synchronized blockades win.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <Shield className="w-4 h-4 text-[#5C140F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5C140F]">Positional Mastery</h4>
                  <p className="text-[11px] text-[#2B1B12]/80">Control high-mobility nodes. Trap opponents. Create unescapable zones.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <Users className="w-4 h-4 text-[#D9587B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5C140F]">Perspective Shift</h4>
                  <p className="text-[11px] text-[#2B1B12]/80">See the same board from radically different roles each game.</p>
                </div>
              </div>
            </div>
          </FolkArtFrame>
        </div>

        {/* Right Column: Games Before Screens */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center gap-2 border-b-[2px] border-[#5C140F] pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D8401F]">
                Living Heritage
              </span>
              <h3 className="font-fraunces text-lg font-bold text-[#5C140F]">
                GAMES BEFORE SCREENS
              </h3>
            </div>

            <p className="text-xs text-[#2B1B12] leading-relaxed mb-3">
              Long before glowing displays and digital chips existed, human gatherings buzzed with the intellectual energy of geometric board games. Puli Meka remains one of the most vibrant of these traditions.
            </p>

            <div className="space-y-2 mb-4">
              <div className="p-2.5 border-[2px] border-[#5C140F] bg-[#E4D19E]">
                <h4 className="text-xs font-bold text-[#5C140F] mb-0.5">Sacred Temple Boards</h4>
                <p className="text-[11px] text-[#2B1B12]">
                  Puli Meka boards are carved permanently into stone temple floors. Visit Chamundi Hill in Mysore, Karnataka, and you will see boards etched into 500-year-old temple stairs—still perfectly playable today.
                </p>
              </div>
              <div className="p-2.5 border-[2px] border-[#5C140F] bg-[#E4D19E]">
                <h4 className="text-xs font-bold text-[#5C140F] mb-0.5">Regional Names Across South Asia</h4>
                <p className="text-[11px] text-[#2B1B12]">
                  <strong>Puli Meka Aata</strong> (Andhra/Telangana), <strong>Aadu Puli Aatam</strong> (Tamil/Kannada), <strong>Bagh-Chal</strong> (Nepal). Each region refined the rules and strategy independently.
                </p>
              </div>
              <div className="p-2.5 border-[2px] border-[#5C140F] bg-[#E4D19E]">
                <h4 className="text-xs font-bold text-[#5C140F] mb-0.5">Still Played Competitively</h4>
                <p className="text-[11px] text-[#2B1B12]">
                  Bagh-Chal remains wildly popular in Nepal, with tournaments held in schools and communities. The game has never truly died.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={() => onNavigate('HISTORY')}
                className="text-xs font-bold text-[#D8401F] hover:underline flex items-center gap-1"
              >
                Explore Archaeological Evidence
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </FolkArtFrame>
        </div>
      </div>

      {/* Call to Action */}
      <FolkArtFrame bg="bg-[#F6ECD2]" className="mb-8">
        <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-2 text-center">
          Ready to Play?
        </h3>
        <p className="text-sm text-[#2B1B12] text-center mb-4">
          Learn the rules, then step into the hunt. Play as fearless tigers or as coordinated goats defending their herd.
        </p>
      </FolkArtFrame>
    </div>
  );
};
