import React, { useEffect, useMemo, useState } from 'react';
import { AIDifficulty, GameMode, ViewTab } from '../types';
import { applyAIAction, chooseAIAction, cloneState, Difficulty, GameEngine, GameState, Side } from '../game/puliMekaEngine';
import { PuliMekaBoard } from './PuliMekaBoard';

interface PuliMekaGameViewProps {
  onNavigate: (tab: ViewTab) => void;
  initialVariant?: 'puli_meka' | 'bagh_chal';
  initialMode?: GameMode;
  initialDifficulty?: AIDifficulty;
  initialHumanSide?: Side;
}

export const PuliMekaGameView: React.FC<PuliMekaGameViewProps> = ({ onNavigate, initialVariant = 'puli_meka', initialMode = 'PVC', initialDifficulty = 'MEDIUM', initialHumanSide = 'PULI' }) => {
  const [variant, setVariant] = useState(initialVariant);
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [difficulty, setDifficulty] = useState<AIDifficulty>(initialDifficulty);
  const [humanSide, setHumanSide] = useState<Side>(initialHumanSide);
  const [game, setGame] = useState<GameState>(() => GameEngine.newState(initialVariant, initialHumanSide, initialDifficulty as Difficulty));
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const reset = (nextMode = mode, nextDifficulty = difficulty, nextSide = humanSide, nextVariant = variant) => {
    setVariant(nextVariant);
    setMode(nextMode);
    setDifficulty(nextDifficulty);
    setHumanSide(nextSide);
    setSelected(null);
    setThinking(false);
    setGame(GameEngine.newState(nextVariant, nextSide, nextDifficulty));
  };

  const isAIActive = mode === 'PVC' && game.currentPlayer === game.KreeduSide && !game.gameOver;
  const legalTargets = useMemo(() => {
    if (selected === null || game.gameOver || thinking) return [];
    const piece = game.board[selected];
    if (!piece || piece.type !== game.currentPlayer) return [];
    if (piece.type === 'PULI') {
      const moves = GameEngine.tigerMoves(game, selected);
      return [...moves.moves, ...moves.captures.map((capture) => capture.to)];
    }
    return game.phase === 'MOVEMENT' ? GameEngine.goatMoves(game, selected) : [];
  }, [game, selected, thinking]);

  useEffect(() => {
    if (!isAIActive) return undefined;
    setThinking(true);
    const timer = window.setTimeout(() => {
      setGame((current) => {
        const next = cloneState(current);
        const action = chooseAIAction(next);
        if (action) applyAIAction(next, action);
        next.isKreeduThinking = false;
        return next;
      });
      setThinking(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isAIActive, game.positionHistory.length, game.currentPlayer]);

  const executeMove = (node: number) => {
    if (game.gameOver || thinking || (mode === 'PVC' && game.currentPlayer !== humanSide)) return;
    const currentPiece = game.board[node];
    if (game.phase === 'PLACEMENT' && game.currentPlayer === 'MEKA') {
      if (currentPiece) return;
      setGame((current) => { const next = cloneState(current); GameEngine.placeGoat(next, node); return next; });
      return;
    }
    if (currentPiece?.type === game.currentPlayer) {
      setSelected(selected === node ? null : node);
      return;
    }
    if (selected === null || !legalTargets.includes(node)) return;
    setGame((current) => {
      const next = cloneState(current);
      const piece = next.board[selected];
      if (piece?.type === 'PULI') {
        const capture = GameEngine.tigerMoves(next, selected).captures.find((item) => item.to === node);
        GameEngine.moveTiger(next, selected, node, capture?.over);
      } else {
        GameEngine.moveGoat(next, selected, node);
      }
      return next;
    });
    setSelected(null);
  };

  const playerName = (side: Side) => side === 'PULI' ? 'Puli' : 'Meka';
  const currentName = mode === 'PVC' && game.currentPlayer === game.KreeduSide ? 'Kreedu' : playerName(game.currentPlayer);
  const outcomeText = game.winner === 'DRAW'
    ? 'Draw: the same position occurred three times.'
    : game.winner === 'PULI'
      ? `Puli win: ${game.goatsCaptured} Meka captured.`
      : game.winner === 'MEKA'
        ? `Meka win: all ${game.tigersCornered} Puli are cornered.`
        : `${currentName}'s turn`;

  return (
    <div className="min-h-screen bg-[#EFDFB8] text-[#2B1B12] font-manrope">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 sm:py-4 pb-10">
        
        {/* Topbar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="font-fraunces font-bold text-xl text-[#5C140F] flex items-center gap-2">
            <svg viewBox="0 0 40 40" className="w-7 h-7">
              <circle cx="20" cy="20" r="18" fill="#EFA90C" stroke="#5C140F" strokeWidth="3"/>
              <circle cx="20" cy="20" r="6.5" fill="#D8401F" stroke="#5C140F" strokeWidth="2.4"/>
              <circle cx="20" cy="6" r="3.4" fill="#0E5C58" stroke="#5C140F" strokeWidth="2"/>
              <circle cx="20" cy="34" r="3.4" fill="#0E5C58" stroke="#5C140F" strokeWidth="2"/>
              <circle cx="6" cy="20" r="3.4" fill="#0E5C58" stroke="#5C140F" strokeWidth="2"/>
              <circle cx="34" cy="20" r="3.4" fill="#0E5C58" stroke="#5C140F" strokeWidth="2"/>
            </svg>
            KREEDA
          </div>
          <div className="ml-auto flex gap-3 text-[10px] sm:text-xs">
            <button onClick={() => setShowRules(true)} className="font-bold text-[#5C140F] hover:opacity-70">? Rules</button>
            <button onClick={() => reset()} className="font-bold text-[#5C140F] hover:opacity-70">↻ Restart</button>
            <button onClick={() => onNavigate('MODE_SELECT')} className="font-bold text-[#5C140F] hover:opacity-70">← Change Game</button>
          </div>
        </div>

        {/* Variant Pill */}
        <div className="text-center mb-3">
          <span className="inline-block bg-[#EFDFB8] border-[2px] border-[#5C140F] px-5 py-1 text-[9px] font-bold text-[#5C140F] uppercase tracking-wide rounded-full">
            {game.variant.name.toUpperCase()}
          </span>
        </div>

        {/* Player Panels */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-3">
          {(['PULI', 'MEKA'] as Side[]).map((side) => (
            <div
              key={side}
              className={`border-[2px] border-[#5C140F] p-2 sm:p-3 text-center transition-colors ${
                game.currentPlayer === side ? 'bg-[#EFA90C]' : 'bg-[#E4D19E]'
              }`}
              style={{borderRadius: '10px'}}
            >
              <div className="text-xs uppercase tracking-widest font-bold text-[#6B4E3D] mb-1">
                {side === humanSide && mode === 'PVC' ? 'You' : side === game.KreeduSide && mode === 'PVC' ? 'Kreedu' : 'Player'}
              </div>
                <div className="font-fraunces text-lg sm:text-xl font-bold text-[#5C140F]">
                  {side === 'PULI' ? game.variant.tigerLabel : game.variant.goatLabel}
              </div>
              {game.currentPlayer === side && !game.gameOver && (
                <div className="text-xs font-bold text-[#D8401F] mt-2">{mode === 'PVC' && side === game.KreeduSide ? 'Kreedu turn' : 'Your turn'}</div>
              )}
            </div>
          ))}
          <span className="font-fraunces font-bold text-[#5C140F] text-xl text-center">VS</span>
        </div>

        {/* Status Bar */}
        <div className="bg-[#F6ECD2] border-[2px] border-[#5C140F] p-2.5 mb-3 text-center rounded-[10px]">
          <div className="text-xs uppercase tracking-widest font-bold text-[#D8401F] mb-1">
            {game.gameOver ? 'Game Over' : game.phase === 'PLACEMENT' ? 'Meka Placement' : 'Movement Phase'}
          </div>
          <div className="font-fraunces font-bold text-base text-[#2B1B12]">
            {thinking ? 'Kreedu is thinking...' : outcomeText}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-[#E4D19E] border-[2px] border-[#5C140F] p-2 sm:p-3 mb-3 rounded-[10px]">
          <PuliMekaBoard
            state={game}
            selectedPiece={selected}
            legalTargets={legalTargets}
            onNodeClick={executeMove}
            disabled={game.gameOver || thinking || (mode === 'PVC' && game.currentPlayer !== humanSide)}
          />
        </div>

        {/* Match Counters */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
            <div className="bg-[#F4E0A8] border-[2px] border-[#5C140F] p-2 text-center rounded-[8px]">
              <div className="text-[8px] uppercase font-bold text-[#6B4E3D] mb-1">Tigers Cornered</div>
              <div className="font-fraunces text-xl font-bold text-[#5C140F]">
                {game.tigersCornered}/{game.variant.tigerCount}
              </div>
            </div>
            <div className="bg-[#F0C9BC] border-[2px] border-[#5C140F] p-2 text-center rounded-[8px]">
              <div className="text-[8px] uppercase font-bold text-[#6B4E3D] mb-1">Goats Captured</div>
              <div className="font-fraunces text-xl font-bold text-[#5C140F]">
                {game.goatsCaptured}/{game.variant.tigerCaptureWinCount}
              </div>
            </div>
            <div className="bg-[#DCEBE1] border-[2px] border-[#5C140F] p-2 text-center rounded-[8px]">
              <div className="text-[8px] uppercase font-bold text-[#6B4E3D] mb-1">Goats Outside</div>
              <div className="font-fraunces text-xl font-bold text-[#5C140F]">
                {game.goatsRemainingToPlace}
              </div>
            </div>
        </div>

        {/* Game End Modal */}
        {game.gameOver && (
          <div className="fixed inset-0 bg-[#2B1B12]/70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#EFDFB8] border-[4px] border-[#5C140F] p-8 max-w-md w-full text-center" style={{borderRadius: '14px'}}>
              <h2 className="font-fraunces font-bold text-4xl text-[#5C140F] mb-3">
                {game.winner === 'DRAW' ? '🤝 Draw!' : game.winner === 'PULI' ? '🐯 Puli Wins!' : '🐐 Meka Wins!'}
              </h2>
              <p className="text-sm text-[#6B4E3D] mb-8">
                {game.winner === 'DRAW'
                  ? 'Same position three times.'
                  : game.winner === 'PULI'
                    ? `${game.goatsCaptured} Meka captured.`
                    : `All ${game.tigersCornered} Puli cornered.`}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-8">
                <div className="bg-[#F4E0A8] border-[2px] border-[#5C140F] p-3 text-center" style={{borderRadius: '10px'}}>
                  <div className="text-xs font-bold uppercase text-[#6B4E3D]">Cornered</div>
                  <div className="font-fraunces font-bold text-[#5C140F]">{game.tigersCornered}</div>
                </div>
                <div className="bg-[#F0C9BC] border-[2px] border-[#5C140F] p-3 text-center" style={{borderRadius: '10px'}}>
                  <div className="text-xs font-bold uppercase text-[#6B4E3D]">Captured</div>
                  <div className="font-fraunces font-bold text-[#5C140F]">{game.goatsCaptured}</div>
                </div>
                <div className="bg-[#DCEBE1] border-[2px] border-[#5C140F] p-3 text-center" style={{borderRadius: '10px'}}>
                  <div className="text-xs font-bold uppercase text-[#6B4E3D]">Placed</div>
                  <div className="font-fraunces font-bold text-[#5C140F]">{game.variant.goatCount - game.goatsRemainingToPlace}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => reset()}
                  className="flex-1 bg-[#D8401F] text-[#EFDFB8] border-[3px] border-[#5C140F] font-bold py-3 text-sm hover:opacity-90 transition"
                  style={{borderRadius: '10px'}}
                >
                  Play Again
                </button>
                <button
                  onClick={() => onNavigate('MODE_SELECT')}
                  className="flex-1 bg-[#E4D19E] text-[#5C140F] border-[3px] border-[#5C140F] font-bold py-3 text-sm hover:opacity-90 transition"
                  style={{borderRadius: '10px'}}
                >
                  Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules Modal */}
        {showRules && (
          <div className="fixed inset-0 bg-[#2B1B12]/70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#EFDFB8] border-[4px] border-[#5C140F] p-8 max-w-md w-full max-h-[70vh] overflow-y-auto" style={{borderRadius: '14px'}}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-fraunces font-bold text-2xl text-[#5C140F]">How to Play</h2>
                <button
                  onClick={() => setShowRules(false)}
                  className="text-3xl text-[#5C140F] hover:opacity-70 leading-none"
                >
                  ×
                </button>
              </div>
              <div className="bg-[#F6ECD2] border-[2px] border-[#5C140F] p-4 mb-4" style={{borderRadius: '10px'}}>
                <p className="text-xs font-bold uppercase text-[#D8401F] mb-2">Puli (Tigers)</p>
                <ul className="space-y-1 text-xs text-[#2B1B12]">
                  <li>• Start with {game.variant.tigerCount} tigers on the board</li>
                  <li>• Move to adjacent nodes</li>
                  <li>• Jump over goats to capture them</li>
                  <li>• Win by capturing {game.variant.tigerCaptureWinCount} goats</li>
                </ul>
              </div>
              <div className="bg-[#F6ECD2] border-[2px] border-[#5C140F] p-4" style={{borderRadius: '10px'}}>
                <p className="text-xs font-bold uppercase text-[#0E5C58] mb-2">Meka (Goats)</p>
                <ul className="space-y-1 text-xs text-[#2B1B12]">
                  <li>• Start with {game.variant.goatCount} goats off the board</li>
                  <li>• Place one goat per turn</li>
                  <li>• Move to adjacent empty nodes</li>
                  <li>• Win by cornering all tigers</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};