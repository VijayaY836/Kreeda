import React, { useState } from 'react';
import { AIDifficulty, GameMode, ViewTab } from './types';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ModeSelectView } from './components/ModeSelectView';
import { AboutView } from './components/AboutView';
import { HistoryView } from './components/HistoryView';
import { FactsView } from './components/FactsView';
import { HowToPlayView } from './components/HowToPlayView';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { GameView } from './components/GameView';
import { FolkArtFrame } from './components/FolkArtFrame';
import { FolkDivider, LotusIcon } from './components/FolkArtMotifs';
import { sounds } from './utils/soundEngine';
import { HelpCircle, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('HOME');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showGlobalHelp, setShowGlobalHelp] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('PVC');
  const [gameDifficulty, setGameDifficulty] = useState<AIDifficulty>('MEDIUM');

  const handleToggleSound = () => {
    const isMuted = sounds.toggleMute();
    setSoundEnabled(!isMuted);
  };

  const handleStartGame = (mode: GameMode = 'PVC', difficulty: AIDifficulty = 'MEDIUM') => {
    setGameMode(mode);
    setGameDifficulty(difficulty);
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
          <GameView
            onNavigate={handleNavigate}
            initialMode={gameMode}
            initialDifficulty={gameDifficulty}
          />
        )}
      </main>

      {/* Global Rules Modal */}
      {showGlobalHelp && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#F6ECD2] border-[4px] border-[#5C140F] p-6 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setShowGlobalHelp(false)}
              className="absolute top-3 right-3 p-1.5 bg-[#E4D19E] border-[2px] border-[#5C140F] text-[#5C140F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <LotusIcon size={20} color="#D8401F" />
              <h3 className="font-fraunces text-2xl font-bold text-[#5C140F]">
                Daadi Aata — Core Rules
              </h3>
            </div>
            <FolkDivider className="mb-3" />

            <div className="space-y-3 text-xs text-[#5C140F] leading-relaxed">
              <div className="p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">1. Placement Phase</h4>
                <p>Both players take turns placing one of their 9 pieces onto any vacant intersection point on the 24-point concentric grid.</p>
              </div>

              <div className="p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">2. Mill (Daadi) Formation</h4>
                <p>Forming 3 pieces in a straight row (horizontal or vertical) triggers a Mill. The player immediately captures 1 opponent counter (must target pieces outside active mills unless all opponent pieces are in mills).</p>
              </div>

              <div className="p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">3. Movement Phase</h4>
                <p>Once all 18 counters are placed, players move one piece per turn along connecting lines to an adjacent vacant intersection.</p>
              </div>

              <div className="p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">4. Victory</h4>
                <p>A player wins when the opponent is reduced to fewer than 3 pieces OR is completely blocked with no legal moves.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#5C140F] flex justify-between items-center">
              <button
                onClick={() => {
                  setShowGlobalHelp(false);
                  handleNavigate('TUTORIAL');
                }}
                className="text-xs font-bold text-[#D8401F] hover:underline cursor-pointer"
              >
                Try Interactive Tutorial →
              </button>

              <button
                onClick={() => setShowGlobalHelp(false)}
                className="px-5 py-2 bg-[#D8401F] hover:bg-[#B83215] text-white border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-wider cursor-pointer"
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
