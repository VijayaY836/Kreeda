import React, { useState } from 'react';
import { AIDifficulty, GameMode, GameVariant, ViewTab } from './types';
type Side = 'PULI' | 'MEKA';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ModeSelectView } from './components/ModeSelectView';
import { AboutView } from './components/AboutView';
import { HistoryView } from './components/HistoryView';
import { FactsView } from './components/FactsView';
import { HowToPlayView } from './components/HowToPlayView';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { PuliMekaGameView } from './components/PuliMekaGameView';
import { FolkArtFrame } from './components/FolkArtFrame';
import { FolkDivider, LotusIcon } from './components/FolkArtMotifs';
import { sounds } from './utils/soundEngine';
import { HelpCircle, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>(() => new URLSearchParams(window.location.search).get('play') === '1' ? 'GAME' : 'HOME');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showGlobalHelp, setShowGlobalHelp] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('PVC');
  const [gameDifficulty, setGameDifficulty] = useState<AIDifficulty>('MEDIUM');
  const [gameVariant, setGameVariant] = useState<GameVariant>('puli_meka');
  const [humanSide, setHumanSide] = useState<Side>('PULI');

  const handleToggleSound = () => {
    const isMuted = sounds.toggleMute();
    setSoundEnabled(!isMuted);
  };

  const handleStartGame = (
    variantOrMode: GameVariant | GameMode,
    modeOrDifficulty: GameMode | AIDifficulty = 'PVC',
    side: Side = 'PULI',
    difficulty: AIDifficulty = 'MEDIUM',
  ) => {
    const isLegacyCall = variantOrMode === 'PVC' || variantOrMode === 'PVP';
    const variant = isLegacyCall ? gameVariant : variantOrMode;
    const mode = isLegacyCall ? variantOrMode : modeOrDifficulty as GameMode;
    const selectedDifficulty = isLegacyCall && modeOrDifficulty !== 'PVC' && modeOrDifficulty !== 'PVP'
      ? modeOrDifficulty
      : difficulty;
    setGameVariant(variant);
    setGameMode(mode);
    setHumanSide(side);
    setGameDifficulty(selectedDifficulty);
    setCurrentTab('GAME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: ViewTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EFDFB8] text-[#5C140F] font-manrope">
      {/* Top Traditional Folk Art Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHelp={() => setShowGlobalHelp(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {currentTab === 'HOME' && (
          <HomeView
            onNavigate={handleNavigate}
            onStartGame={handleStartGame}
          />
        )}

        {currentTab === 'MODE_SELECT' && (
          <ModeSelectView
            onNavigate={handleNavigate}
            onStartGame={handleStartGame}
          />
        )}

        {currentTab === 'ABOUT' && (
          <AboutView
            onNavigate={handleNavigate}
            onStartGame={handleStartGame}
          />
        )}

        {currentTab === 'HISTORY' && (
          <HistoryView onNavigate={handleNavigate} />
        )}

        {currentTab === 'FACTS' && (
          <FactsView onNavigate={handleNavigate} />
        )}

        {currentTab === 'HOW_TO_PLAY' && (
          <HowToPlayView
            onNavigate={handleNavigate}
            onStartGame={handleStartGame}
          />
        )}

        {currentTab === 'TUTORIAL' && (
          <InteractiveTutorial
            onComplete={() => handleNavigate('MODE_SELECT')}
          />
        )}

        {currentTab === 'GAME' && (
          <PuliMekaGameView
            onNavigate={handleNavigate}
            initialMode={gameMode}
            initialDifficulty={gameDifficulty}
            initialVariant={gameVariant}
            initialHumanSide={humanSide}
          />
        )}
      </main>

      {/* Global Rules Modal */}
      {showGlobalHelp && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FAF4E5] border-[4px] border-[#5C140F] p-6 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setShowGlobalHelp(false)}
              className="absolute top-3 right-3 p-1.5 bg-[#EFDFB8] border-[2px] border-[#5C140F] text-[#5C140F]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <LotusIcon size={20} />
              <h3 className="font-fraunces text-2xl font-bold text-[#5C140F]">
                Puli Meka — Core Rules
              </h3>
            </div>
            <FolkDivider className="mb-3" />

            <div className="space-y-3 text-xs text-[#5C140F] leading-relaxed">
              <div className="p-2.5 bg-[#EFDFB8] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">1. Goat Placement Phase</h4>
                <p>Goats (Meka) place one at a time on any empty node. Tigers (Puli) start at the apex and can move/attack while goats are still placing.</p>
              </div>

              <div className="p-2.5 bg-[#EFDFB8] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">2. Tiger Hunt by Jumping</h4>
                <p>Tigers capture goats by jumping over them in a straight line to an empty node beyond (like Checkers). No multiple jumps per turn allowed.</p>
              </div>

              <div className="p-2.5 bg-[#EFDFB8] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">3. Movement & Coordination</h4>
                <p>After all goats are placed, both pieces move one step per turn along connected lines. Goats must coordinate to block tigers; tigers hunt for remaining prey.</p>
              </div>

              <div className="p-2.5 bg-[#EFDFB8] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">4. Victory</h4>
                <p>Tigers win by capturing 5 goats. Goats win by trapping all 3 tigers with no legal moves.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#5C140F] flex justify-between items-center">
              <button
                onClick={() => {
                  setShowGlobalHelp(false);
                  handleNavigate('TUTORIAL');
                }}
                className="text-xs font-bold text-[#D95B7D] hover:underline"
              >
                Try Interactive Tutorial →
              </button>

              <button
                onClick={() => setShowGlobalHelp(false)}
                className="px-5 py-2 bg-[#D95B7D] text-white border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
