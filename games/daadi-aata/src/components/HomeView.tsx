import React, { useState } from 'react';
import { AIDifficulty, GameMode, ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, KolamCorner, LotusIcon } from './FolkArtMotifs';
import { GameBoard } from './GameBoard';
import { KreeduMascot } from './KreeduMascot';
import { Play, BookOpen, Compass, Sparkles, Users, Bot, Shield, Zap, Flame } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: ViewTab) => void;
  onStartGame: (mode: GameMode, difficulty?: AIDifficulty) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onStartGame }) => {
  // Sample decorative board preview for hero art
  const heroBoard = [
    'P1', null, 'P2',
    null, 'P1', null,
    'P2', null,
    null, 'P1', null,
    'P2', null, 'P1',
    null, null,
    'P2', null, 'P1',
    null, 'P2', null,
    null, null,
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Hero Content */}
        <div className="lg:col-span-6 flex flex-col items-start">
          {/* Traditional Tag */}
          <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1.5 mb-3 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
            <LotusIcon size={18} color="#D8401F" />
            Ancient Indian Strategy Board Game
          </div>

          {/* Large Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold font-fraunces text-[#5C140F] tracking-tight leading-none mb-1">
            DAADI AATA
          </h1>

          {/* Telugu Title */}
          <div className="font-telugu text-2xl sm:text-3xl font-bold text-[#D8401F] mb-3">
            దాడి ఆట
          </div>

          {/* Subtitle */}
          <p className="font-fraunces italic text-lg sm:text-xl text-[#6B4E3D] mb-4">
            “An Indian game of strategy, patience and positioning.”
          </p>

          <FolkDivider className="mb-4" />

          {/* Short Description */}
          <p className="text-base sm:text-lg text-[#2B1B12] font-medium leading-relaxed mb-6">
            <strong className="text-[#D8401F] font-bold">Place. Align. Capture.</strong> Outthink your opponent in an ancient alignment game that has tested tactical minds across generations.
          </p>

          {/* Match Setup / Action Hub Card (Light Cream #F6ECD2) */}
          <div className="w-full bg-[#F6ECD2] border-[3px] border-[#5C140F] p-5 mb-6 relative">
            <div className="flex items-center justify-between border-b-[2px] border-[#5C140F] pb-2.5 mb-4">
              <span className="font-fraunces font-bold text-base text-[#5C140F] uppercase tracking-wide">
                Start Playing • ఆట ప్రారంభించండి
              </span>
              <span className="text-xs font-telugu font-bold text-[#D8401F]">
                మోడ్ ఎంచుకోండి
              </span>
            </div>

            {/* Big Primary Play Button (Terracotta #D8401F) -> opens dedicated Mode Selection page */}
            <button
              type="button"
              onClick={() => onNavigate('MODE_SELECT')}
              className="w-full mb-3 flex items-center justify-center gap-2.5 py-3.5 bg-[#D8401F] hover:bg-[#B83215] text-white border-[2px] border-[#5C140F] font-bold text-base tracking-wide uppercase transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-none cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play Daadi Aata (Choose Mode)</span>
            </button>

            {/* Quick 1-Click Launch Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-2">
              <button
                type="button"
                onClick={() => onStartGame('PVP')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[2px] border-[#5C140F] font-bold text-xs text-[#2B1B12] transition-colors cursor-pointer"
                title="Immediately launch 2-Player Pass & Play"
              >
                <Users className="w-4 h-4 text-[#D8401F]" />
                <div className="text-left">
                  <div className="leading-tight">2 Players</div>
                  <div className="text-[9px] text-[#6B4E3D] font-normal">Pass & Play</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('MODE_SELECT')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[2px] border-[#5C140F] font-bold text-xs text-[#2B1B12] transition-colors cursor-pointer"
                title="Select difficulty and play vs Kreedu AI"
              >
                <Bot className="w-4 h-4 text-[#0E5C58]" />
                <div className="text-left">
                  <div className="leading-tight">vs Kreedu AI</div>
                  <div className="text-[9px] text-[#6B4E3D] font-normal">Select Difficulty</div>
                </div>
              </button>
            </div>
          </div>

          {/* Secondary Action Buttons (Teal & Cream) */}
          <div className="w-full flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('TUTORIAL')}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E5C58] hover:bg-[#094340] text-white border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EFA90C]" />
              <span>Interactive Tutorial</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('HOW_TO_PLAY')}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F6ECD2] hover:bg-white text-[#5C140F] border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#5C140F]" />
              <span>Rules Guide</span>
            </button>
          </div>
        </div>

        {/* Right Hero Board Illustration */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-[460px] relative">
            <GameBoard
              board={heroBoard}
              activePlayer="P1"
              selectedNode={null}
              legalMoveTargets={[]}
              validCaptureTargets={[]}
              activeMills={[[0, 1, 2]]}
              isCapturing={false}
              onNodeClick={() => {}}
              disabled={true}
            />

            {/* Floating pieces showcase */}
            <div className="mt-4 flex items-center justify-around bg-[#F6ECD2] border-[3px] border-[#5C140F] p-3 text-xs font-bold text-[#2B1B12]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#D8401F] border-2 border-[#5C140F]" />
                <span>Player 1: Terracotta (9)</span>
              </div>
              <div className="h-4 w-[2px] bg-[#5C140F]" />
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#5C140F] border-2 border-[#EFA90C]" />
                <span>P2 / Kreedu: Maroon (9)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cultural Pillars Bento */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FolkArtFrame>
          <div className="flex items-center gap-2 mb-2 text-[#D8401F]">
            <LotusIcon size={22} color="#D8401F" />
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F]">
              Deep Strategy
            </h3>
          </div>
          <p className="text-xs text-[#2B1B12] leading-relaxed">
            Zero dice, zero random cards. Victory is won purely through positional balance, trapping maneuvers, and foresight.
          </p>
        </FolkArtFrame>

        <FolkArtFrame>
          <div className="flex items-center gap-2 mb-2">
            <KreeduMascot size={36} mood="HAPPY" />
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F]">
              Kreedu AI
            </h3>
          </div>
          <p className="text-xs text-[#2B1B12] leading-relaxed">
            Play 100% offline against our tactical Minimax engine across Easy, Medium, and Master difficulties.
          </p>
        </FolkArtFrame>

        <FolkArtFrame>
          <div className="flex items-center gap-2 mb-2 text-[#EFA90C]">
            <div className="w-5 h-5 rotate-45 bg-[#EFA90C] border-2 border-[#5C140F]" />
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F]">
              Cultural Lineage
            </h3>
          </div>
          <p className="text-xs text-[#2B1B12] leading-relaxed">
            Known as Navakankari, Saalu Mane Aata, and Daadi — carved into temple floors, verandas, and woven cloth boards for centuries.
          </p>
        </FolkArtFrame>
      </div>
    </div>
  );
};
