import React, { useState } from 'react';
import { AIDifficulty, GameMode, ViewTab } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, KolamCorner, LotusIcon } from './FolkArtMotifs';
import { KreeduMascot } from './KreeduMascot';
import { Users, Bot, ArrowLeft, ArrowRight, ShieldCheck, Zap, Flame, Sparkles, Trophy, BookOpen } from 'lucide-react';

interface ModeSelectViewProps {
  onStartGame: (mode: GameMode, difficulty?: AIDifficulty) => void;
  onNavigate: (tab: ViewTab) => void;
}

export const ModeSelectView: React.FC<ModeSelectViewProps> = ({
  onStartGame,
  onNavigate,
}) => {
  // Step 1: 'CHOOSE_MODE' -> Step 2 (if Kreedu): 'CHOOSE_DIFFICULTY'
  const [currentStep, setCurrentStep] = useState<'CHOOSE_MODE' | 'CHOOSE_DIFFICULTY'>('CHOOSE_MODE');

  const handleSelectKreedu = () => {
    setCurrentStep('CHOOSE_DIFFICULTY');
  };

  const handleSelectTwoPlayers = () => {
    // If 2 players selected -> Immediately launch the game board!
    onStartGame('PVP');
  };

  const handleSelectDifficulty = (difficulty: AIDifficulty) => {
    // When difficulty chosen -> Immediately launch the game board with Kreedu!
    onStartGame('PVC', difficulty);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      
      {/* Step 1: Mode Choice (2 Players vs vs Kreedu AI) */}
      {currentStep === 'CHOOSE_MODE' && (
        <div>
          {/* Header Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F6ECD2] border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-widest text-[#5C140F] mb-2">
              <LotusIcon size={14} color="#D8401F" />
              <span>Match Setup • ఆట ఎంపిక</span>
            </div>

            <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl text-[#5C140F] mb-1">
              Choose How You Want to Play
            </h1>
            <p className="font-telugu text-base sm:text-lg font-bold text-[#D8401F] mb-3">
              ఆటగాళ్లతో ఆడాలనుకుంటున్నారా లేదా క్రీడు AI తోనా?
            </p>
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#6B4E3D]">
              Select between a local 2-player duel on this device or a strategic match against our traditional Kreedu Minimax AI.
            </p>
          </div>

          {/* Selection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Card 1: 2 Players (Pass & Play) */}
            <div
              onClick={handleSelectTwoPlayers}
              className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-6 flex flex-col justify-between cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#5C140F] relative"
            >
              <KolamCorner position="top-left" size={24} className="absolute top-1.5 left-1.5 opacity-60" />
              <KolamCorner position="bottom-right" size={24} className="absolute bottom-1.5 right-1.5 opacity-60" />

              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-4 border-b-[2px] border-[#5C140F]/30 pb-2">
                  <span className="px-2.5 py-0.5 bg-[#D8401F] text-white text-[11px] font-bold uppercase tracking-wide">
                    Pass & Play
                  </span>
                  <span className="text-xs font-telugu font-bold text-[#5C140F]">
                    ఇద్దరు ఆటగాళ్లు
                  </span>
                </div>

                {/* Visual Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-[#E4D19E] border-[3px] border-[#5C140F] flex items-center justify-center group-hover:bg-[#D8401F] group-hover:text-white transition-colors text-[#5C140F]">
                  <Users className="w-8 h-8" />
                </div>

                {/* Titles */}
                <h3 className="font-fraunces font-extrabold text-2xl text-center text-[#5C140F] mb-1">
                  2 Players (Local)
                </h3>
                <p className="text-xs text-center font-bold text-[#D8401F] mb-4">
                  Player 1 (Terracotta) vs Player 2 (Deep Maroon)
                </p>

                {/* Description */}
                <p className="text-xs text-[#2B1B12] leading-relaxed mb-6 text-center">
                  Play with a friend, family member, or rival on the same screen. Take turns placing tokens and making strategic alignments.
                </p>

                {/* Features List */}
                <div className="bg-[#E4D19E] border-[2px] border-[#5C140F] p-3 text-xs text-[#2B1B12] space-y-1.5 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#D8401F]" />
                    <span>Instant match setup — board opens immediately</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#5C140F]" />
                    <span>Real-time turn indicator & move history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#EFA90C]" />
                    <span>No timer pressure — perfect for social duels</span>
                  </div>
                </div>
              </div>

              {/* Action Button (Terracotta #D8401F) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTwoPlayers();
                }}
                className="w-full py-3 bg-[#D8401F] group-hover:bg-[#B83215] text-white border-[2px] border-[#5C140F] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Start 2-Player Game</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: vs Kreedu AI (Single Player) */}
            <div
              onClick={handleSelectKreedu}
              className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-6 flex flex-col justify-between cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#5C140F] relative"
            >
              <KolamCorner position="top-right" size={24} className="absolute top-1.5 right-1.5 opacity-60" />
              <KolamCorner position="bottom-left" size={24} className="absolute bottom-1.5 left-1.5 opacity-60" />

              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-4 border-b-[2px] border-[#5C140F]/30 pb-2">
                  <span className="px-2.5 py-0.5 bg-[#0E5C58] text-white text-[11px] font-bold uppercase tracking-wide">
                    Single Player AI
                  </span>
                  <span className="text-xs font-telugu font-bold text-[#0E5C58]">
                    క్రీడు AI తో ఆడండి
                  </span>
                </div>

                {/* Mascot Avatar Preview */}
                <div className="w-16 h-16 mx-auto mb-4 bg-[#E4D19E] border-[3px] border-[#5C140F] flex items-center justify-center group-hover:bg-[#F6ECD2] transition-colors p-1">
                  <KreeduMascot mood="HAPPY" size={54} />
                </div>

                {/* Titles */}
                <h3 className="font-fraunces font-extrabold text-2xl text-center text-[#5C140F] mb-1">
                  vs Kreedu AI
                </h3>
                <p className="text-xs text-center font-bold text-[#6B4E3D] mb-4">
                  Traditional Minimax Strategy Engine
                </p>

                {/* Description */}
                <p className="text-xs text-[#2B1B12] leading-relaxed mb-6 text-center">
                  Play as Player 1 (Terracotta) against Kreedu. Choose from 3 tuned difficulty levels ranging from beginner-friendly to master tactician.
                </p>

                {/* Features List */}
                <div className="bg-[#E4D19E] border-[2px] border-[#5C140F] p-3 text-xs text-[#2B1B12] space-y-1.5 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0E5C58]" />
                    <span>3 Difficulty tiers (Easy, Medium, Difficult)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#D8401F]" />
                    <span>100% Offline with instant tactical responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#EFA90C]" />
                    <span>Animated mascot emotions & reactions</span>
                  </div>
                </div>
              </div>

              {/* Action Button (Teal #0E5C58) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectKreedu();
                }}
                className="w-full py-3 bg-[#0E5C58] group-hover:bg-[#094340] text-white border-[2px] border-[#5C140F] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Select Difficulty →</span>
                <Bot className="w-4 h-4 text-[#EFA90C]" />
              </button>
            </div>

          </div>

          {/* Quick Return & Helper Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F6ECD2] border-[2px] border-[#5C140F] p-4 text-xs font-bold text-[#5C140F]">
            <button
              type="button"
              onClick={() => onNavigate('HOME')}
              className="inline-flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('HOW_TO_PLAY')}
                className="inline-flex items-center gap-1.5 hover:text-[#D8401F] cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Game Rules</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('TUTORIAL')}
                className="inline-flex items-center gap-1.5 hover:text-[#D8401F] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#EFA90C]" />
                <span>Interactive Tutorial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Choose Kreedu AI Difficulty */}
      {currentStep === 'CHOOSE_DIFFICULTY' && (
        <div>
          {/* Header Title Section */}
          <div className="text-center mb-8">
            <button
              type="button"
              onClick={() => setCurrentStep('CHOOSE_MODE')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F6ECD2] hover:bg-white border-[2px] border-[#5C140F] text-xs font-bold text-[#5C140F] uppercase tracking-wider mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Mode Selection</span>
            </button>

            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-[#F6ECD2] border-[3px] border-[#5C140F] flex items-center justify-center p-1">
                <KreeduMascot mood="THINKING" size={54} />
              </div>
            </div>

            <h1 className="font-fraunces font-extrabold text-3xl sm:text-4xl text-[#5C140F] mb-1">
              Select Kreedu AI Difficulty
            </h1>
            <p className="font-telugu text-base sm:text-lg font-bold text-[#D8401F] mb-2">
              క్రీడు సామర్థ్య స్థాయిని ఎంచుకోండి
            </p>
            <p className="max-w-md mx-auto text-xs sm:text-sm text-[#6B4E3D]">
              Click any difficulty below to immediately start the game board!
            </p>
          </div>

          {/* Difficulty Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            
            {/* 1. EASY */}
            <div
              onClick={() => handleSelectDifficulty('EASY')}
              className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-5 flex flex-col justify-between cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#5C140F] relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b-[2px] border-[#5C140F]/30 pb-2">
                  <span className="px-2 py-0.5 bg-[#E4D19E] border-[1px] border-[#5C140F] text-[10px] font-bold uppercase text-[#2B1B12]">
                    Level 1
                  </span>
                  <span className="text-xs font-telugu font-bold text-[#5C140F]">
                    ఆరంభం
                  </span>
                </div>

                <div className="text-3xl mb-2 text-center">🌱</div>
                <h3 className="font-fraunces font-extrabold text-xl text-center text-[#5C140F] mb-1">
                  Easy
                </h3>
                <p className="text-[11px] text-center font-bold text-[#5F8F3B] mb-3">
                  Casual & Learning
                </p>

                <p className="text-xs text-[#2B1B12] leading-relaxed mb-4 text-center">
                  Kreedu plays casually without looking far ahead. Ideal for beginners learning board coordinates, forming their first mills, and practicing piece movements.
                </p>

                <div className="bg-[#E4D19E] border-[1.5px] border-[#5C140F] p-2 text-[11px] text-[#2B1B12] space-y-1 mb-5">
                  <div>✓ Friendly tactical pace</div>
                  <div>✓ Great for first-time players</div>
                  <div>✓ Forgiving of player mistakes</div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDifficulty('EASY');
                }}
                className="w-full py-2.5 bg-[#5F8F3B] hover:bg-[#4A722C] text-white border-[2px] border-[#5C140F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Play Easy Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. MEDIUM */}
            <div
              onClick={() => handleSelectDifficulty('MEDIUM')}
              className="bg-[#F6ECD2] border-[3px] border-[#D8401F] p-5 flex flex-col justify-between cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#5C140F] relative ring-2 ring-[#D8401F]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b-[2px] border-[#5C140F]/30 pb-2">
                  <span className="px-2 py-0.5 bg-[#D8401F] text-white text-[10px] font-bold uppercase">
                    Recommended
                  </span>
                  <span className="text-xs font-telugu font-bold text-[#D8401F]">
                    సాధారణం
                  </span>
                </div>

                <div className="text-3xl mb-2 text-center">⚖️</div>
                <h3 className="font-fraunces font-extrabold text-xl text-center text-[#5C140F] mb-1">
                  Medium
                </h3>
                <p className="text-[11px] text-center font-bold text-[#D8401F] mb-3">
                  Balanced Minimax
                </p>

                <p className="text-xs text-[#2B1B12] leading-relaxed mb-4 text-center">
                  Kreedu uses minimax evaluation to block dangerous player mills, maintain strong board mobility, and seize tactical openings as they arise.
                </p>

                <div className="bg-[#E4D19E] border-[1.5px] border-[#5C140F] p-2 text-[11px] text-[#2B1B12] space-y-1 mb-5">
                  <div>✓ Actively blocks mills</div>
                  <div>✓ Builds tactical defenses</div>
                  <div>✓ Balanced challenge for all</div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDifficulty('MEDIUM');
                }}
                className="w-full py-2.5 bg-[#D8401F] hover:bg-[#B83215] text-white border-[2px] border-[#5C140F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Play Medium Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. DIFFICULT */}
            <div
              onClick={() => handleSelectDifficulty('HARD')}
              className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-5 flex flex-col justify-between cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#5C140F] relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b-[2px] border-[#5C140F]/30 pb-2">
                  <span className="px-2 py-0.5 bg-[#5C140F] text-white text-[10px] font-bold uppercase">
                    Level 3
                  </span>
                  <span className="text-xs font-telugu font-bold text-[#5C140F]">
                    కఠినం
                  </span>
                </div>

                <div className="text-3xl mb-2 text-center">🔥</div>
                <h3 className="font-fraunces font-extrabold text-xl text-center text-[#5C140F] mb-1">
                  Difficult
                </h3>
                <p className="text-[11px] text-center font-bold text-[#5C140F] mb-3">
                  Master Tactician
                </p>

                <p className="text-xs text-[#2B1B12] leading-relaxed mb-4 text-center">
                  Kreedu computes deep lookaheads, locks down critical ring intersections, sets up multi-turn mill traps, and penalizes every tactical slip.
                </p>

                <div className="bg-[#E4D19E] border-[1.5px] border-[#5C140F] p-2 text-[11px] text-[#2B1B12] space-y-1 mb-5">
                  <div>✓ Deep Minimax search</div>
                  <div>✓ Trapping & intersection control</div>
                  <div>✓ Relentless tactical pressure</div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDifficulty('HARD');
                }}
                className="w-full py-2.5 bg-[#5C140F] hover:bg-[#3A0C09] text-white border-[2px] border-[#5C140F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Play Difficult Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Return footer */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setCurrentStep('CHOOSE_MODE')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#5C140F] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Choose Mode (2 Players vs Kreedu)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
