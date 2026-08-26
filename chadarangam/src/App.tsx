import React, { useState } from 'react';
import { GameSettings, ViewTab, Variant } from './types';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ModeSelectView } from './components/ModeSelectView';
import { AboutView } from './components/AboutView';
import { HowToPlayView } from './components/HowToPlayView';
import { GameView } from './components/GameView';
import { FolkDivider, ChariotWheelIcon } from './components/FolkArtMotifs';
import { sounds } from './utils/soundEngine';
import { X } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  variant: 'chaturanga',
  gameMode: 'PVC',
  difficulty: 'MEDIUM',
  humanSide: 1,
  boardStyle: 'ashtapada',
  hints: true,
  soundEnabled: true,
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('HOME');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGlobalHelp, setShowGlobalHelp] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [homeVariant, setHomeVariant] = useState<Variant>('chaturanga');

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setSoundEnabled(!muted);
  };

  const handleNavigate = (tab: ViewTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePickVariant = (variant: Variant) => {
    setHomeVariant(variant);
    setCurrentTab('MODE_SELECT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGame = (next: Pick<GameSettings, 'variant' | 'gameMode' | 'difficulty' | 'humanSide' | 'boardStyle'>) => {
    setSettings(prev => ({ ...prev, ...next }));
    setHomeVariant(next.variant);
    setCurrentTab('GAME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EFDFB8] text-[#5C140F] font-manrope">
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHelp={() => setShowGlobalHelp(true)}
      />

      <main className="flex-1 w-full">
        {currentTab === 'HOME' && <HomeView onNavigate={handleNavigate} onPickVariant={handlePickVariant} />}
        {currentTab === 'MODE_SELECT' && (
          <ModeSelectView onNavigate={handleNavigate} onStartGame={handleStartGame} initialVariant={homeVariant} />
        )}
        {currentTab === 'ABOUT' && <AboutView onNavigate={handleNavigate} />}
        {currentTab === 'HOW_TO_PLAY' && <HowToPlayView onNavigate={handleNavigate} initialVariant={homeVariant} />}
        {currentTab === 'GAME' && (
          <GameView settings={settings} onNavigate={handleNavigate} soundEnabled={soundEnabled} onToggleSound={handleToggleSound} />
        )}
      </main>

      <footer className="mt-12 bg-[#FAF4E5] border-t-[3px] border-[#5C140F] py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-[#5C140F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#EFDFB8] border-[2px] border-[#5C140F] flex items-center justify-center">
              <ChariotWheelIcon size={18} />
            </div>
            <div>
              <p className="font-fraunces font-bold text-sm">CHATURANGAM (చతురంగం)</p>
              <p className="text-[11px] text-[#5C140F]/80">6th-century Gupta-era rules, and the Chess it became — on one board.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-semibold text-[11px]">
            <button onClick={() => handleNavigate('ABOUT')} className="hover:underline hover:text-[#D95B7D]">History</button>
            <span>•</span>
            <button onClick={() => handleNavigate('HOW_TO_PLAY')} className="hover:underline hover:text-[#D95B7D]">Rules</button>
            <span>•</span>
            <button onClick={() => handleNavigate('MODE_SELECT')} className="hover:underline hover:text-[#D95B7D]">Play</button>
          </div>

          <div className="text-[10px] text-[#5C140F]/70 font-mono">100% Offline • Iterative-Deepening AI • Pure SVG Folk Art</div>
        </div>
      </footer>

      {showGlobalHelp && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FAF4E5] border-[4px] border-[#5C140F] p-6 max-h-[85vh] overflow-y-auto relative">
            <button onClick={() => setShowGlobalHelp(false)} className="absolute top-3 right-3 p-1.5 bg-[#EFDFB8] border-[2px] border-[#5C140F] text-[#5C140F]">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <ChariotWheelIcon size={20} />
              <h3 className="font-fraunces text-2xl font-bold text-[#5C140F]">Chaturangam — Quick Orientation</h3>
            </div>
            <FolkDivider className="mb-3" />
            <div className="space-y-3 text-xs text-[#5C140F] leading-relaxed">
              <div className="p-2.5 bg-[#EFDFB8] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">1. Two Games, One Board</h4>
                <p>Choose Chaturangam (the 6th-century original) or modern Chess from Play Game. Each has its own pieces and rules.</p>
              </div>
              <div className="p-2.5 bg-[#EFDFB8] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">2. Making a Move</h4>
                <p>Tap a piece to see its legal moves highlighted, then tap a highlighted square to move there.</p>
              </div>
              <div className="p-2.5 bg-[#EFDFB8] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">3. Kreedu, Your Opponent</h4>
                <p>Play against Kreedu's offline search engine at three strengths, or pass-and-play with a friend on one device.</p>
              </div>
              <div className="p-2.5 bg-[#EFDFB8] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1">4. Victory</h4>
                <p>Checkmate the enemy king/Raja to win. See the full rules page for stalemate, promotion and endgame differences.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t-[2px] border-[#5C140F] flex justify-between items-center">
              <button
                onClick={() => { setShowGlobalHelp(false); handleNavigate('HOW_TO_PLAY'); }}
                className="text-xs font-bold text-[#D95B7D] hover:underline"
              >
                Full Rules & Piece Guide →
              </button>
              <button onClick={() => setShowGlobalHelp(false)} className="px-5 py-2 bg-[#D95B7D] text-white border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-wider">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
