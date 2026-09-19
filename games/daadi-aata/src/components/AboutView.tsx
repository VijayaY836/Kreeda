import React from 'react';
import { ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, LotusIcon } from './FolkArtMotifs';
import { Play, ArrowRight, Brain, Target, Shield, Compass } from 'lucide-react';

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
          MEET DAADI AATA
        </h2>
        <div className="font-telugu text-xl sm:text-2xl font-bold text-[#D8401F] mb-2">
          దాడి ఆట — ఒక వ్యూహాత్మక సాంప్రదాయ క్రీడ
        </div>
        <p className="font-fraunces italic text-base sm:text-lg text-[#6B4E3D] max-w-2xl mx-auto">
          “An ancient Indian game of strategy, patience, pattern recognition, and positional wisdom.”
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
              <strong>Daadi Aata</strong> (దాడి ఆట in Telugu) is a traditional two-player Indian strategy board game deeply rooted in South Asian folklore. Across different states and languages, it is celebrated under various names including <strong>Navakankari</strong> (నవకంకరి — referring to nine pebbles), <strong>Saalu Mane Aata</strong> (ಸాలు ಮನೆ ಆಟ in Kannada), and simply <strong>Daadi</strong>.
            </p>
            <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">
              It belongs to the classical family of <em>alignment or mill games</em>. Two opponents, each commanding a set of 9 counters, alternate placing and moving their pieces across a geometric grid composed of three concentric squares connected by midpoint lines.
            </p>
            <p className="text-sm text-[#2B1B12] leading-relaxed">
              When a player aligns three pieces in an unbroken straight line (forming a <em>Daadi</em> or <em>Mill</em>), they earn the tactical right to capture one of the opponent’s pieces.
            </p>
          </FolkArtFrame>

          <FolkArtFrame bg="bg-[#F6ECD2]">
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mb-2">
              The Five Mental Virtues
            </h3>
            <p className="text-xs text-[#6B4E3D] mb-4">
              Traditional Indian gaming philosophy treats board games not merely as pastimes, but as tools for cognitive sharpening:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <Brain className="w-4 h-4 text-[#D8401F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5C140F]">Planning & Foresight</h4>
                  <p className="text-[11px] text-[#2B1B12]/80">Anticipating opponent counter-traps 3 moves ahead.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <Target className="w-4 h-4 text-[#0E5C58] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5C140F]">Positional Control</h4>
                  <p className="text-[11px] text-[#2B1B12]/80">Dominating the critical 4-way intersection nodes.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <Shield className="w-4 h-4 text-[#5C140F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5C140F]">Pattern Recognition</h4>
                  <p className="text-[11px] text-[#2B1B12]/80">Spotting double-mill and oscillating formations.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <Compass className="w-4 h-4 text-[#3E6E9E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5C140F]">Tactical Patience</h4>
                  <p className="text-[11px] text-[#2B1B12]/80">Waiting for the precise moment to spring a decisive blockade.</p>
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
              Long before glowing displays and digital chips existed, human gatherings buzzed with the intellectual energy of geometric board games.
            </p>

            <div className="space-y-2 mb-4">
              <div className="p-2.5 border-[2px] border-[#5C140F] bg-[#E4D19E]">
                <h4 className="text-xs font-bold text-[#5C140F] mb-0.5">Everyday Natural Materials</h4>
                <p className="text-[11px] text-[#2B1B12]">
                  People carved boards into stone slabs or drew them in rangoli powder on courtyards. Counters were smooth river stones, tamarind seeds, cowrie shells, or broken terracotta pottery.
                </p>
              </div>
              <div className="p-2.5 border-[2px] border-[#5C140F] bg-[#E4D19E]">
                <h4 className="text-xs font-bold text-[#5C140F] mb-0.5">Communal Gathering Spaces</h4>
                <p className="text-[11px] text-[#2B1B12]">
                  Played in temple courtyards (Mantapas), village gathering platforms (Chavadi), home verandas (Thinnai/Arugu), and breezy afternoon shade under banyan trees.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t-[2px] border-[#5C140F]">
              <button
                onClick={() => onNavigate('HISTORY')}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#E4D19E] hover:bg-[#FAF4E5] border-[2px] border-[#5C140F] text-xs font-bold text-[#2B1B12] uppercase tracking-wider cursor-pointer"
              >
                Read Archaeological History
                <ArrowRight className="w-3.5 h-3.5 text-[#5C140F]" />
              </button>
            </div>
          </FolkArtFrame>

          {/* Quick Start Card */}
          <FolkArtFrame bg="bg-[#0E5C58] text-white">
            <h4 className="font-fraunces text-xl font-bold text-white mb-2">
              Ready to Test Your Mind?
            </h4>
            <p className="text-xs text-white/90 mb-4 leading-relaxed">
              Step into the shoes of ancient players. Place your 9 counters and take on Kreedu AI or a friend.
            </p>
            <button
              onClick={() => onNavigate('MODE_SELECT')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#D8401F] hover:bg-[#B83215] text-white border-[2px] border-[#5C140F] font-bold text-sm tracking-wide cursor-pointer uppercase transition-colors"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              CHOOSE GAME MODE & PLAY
            </button>
          </FolkArtFrame>
        </div>
      </div>
    </div>
  );
};
