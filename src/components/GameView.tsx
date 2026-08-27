import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AIDifficulty,
  BoardState,
  GameMode,
  GameSettings,
  KreeduMood,
  MoveRecord,
  Player,
  ViewTab,
} from '../types';
import { TOTAL_PIECES_PER_PLAYER } from '../utils/gameConstants';
import {
  countPiecesOnBoard,
  evaluateGameWinner,
  formsNewMill,
  getActiveMills,
  getAllLegalMoves,
  getLegalMovesForPiece,
  getLegalPlacements,
  getValidCaptureTargets,
} from '../utils/gameEngine';
import { getAIMovementMove, getAIPlacementMove } from '../utils/aiEngine';
import { sounds } from '../utils/soundEngine';
import { GameBoard } from './GameBoard';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, LotusIcon, KolamCorner } from './FolkArtMotifs';
import { KreeduMascot } from './KreeduMascot';
import {
  RotateCcw,
  Sparkles,
  HelpCircle,
  Settings,
  Trophy,
  History,
  Swords,
  User,
  Users,
  Bot,
  Volume2,
  VolumeX,
  X,
  Play,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface GameViewProps {
  onNavigate: (tab: ViewTab) => void;
  initialMode?: GameMode;
  initialDifficulty?: AIDifficulty;
}

export const GameView: React.FC<GameViewProps> = ({
  onNavigate,
  initialMode = 'PVC',
  initialDifficulty = 'MEDIUM',
}) => {
  // Game State
  const [board, setBoard] = useState<BoardState>(() => Array(24).fill(null));
  const [activePlayer, setActivePlayer] = useState<Player>('P1');
  const [p1Hand, setP1Hand] = useState<number>(TOTAL_PIECES_PER_PLAYER);
  const [p2Hand, setP2Hand] = useState<number>(TOTAL_PIECES_PER_PLAYER);
  
  // Selection and Action State
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [lastMovedNode, setLastMovedNode] = useState<number | null>(null);

  // Status and History
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winReason, setWinReason] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [kreeduMood, setKreeduMood] = useState<KreeduMood>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('Your Turn: Place a piece on any empty node');

  // Modals & Panels
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Game Settings
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    flyingRule: false,
    difficulty: initialDifficulty,
    gameMode: initialMode,
    autoPlayKreedu: true,
  });

  // Ref to prevent race conditions in AI execution
  const aiTurnProcessingRef = useRef<boolean>(false);
  const prevPropsRef = useRef({ mode: initialMode, diff: initialDifficulty });

  // Helper to add history record
  const logMove = (
    player: Player,
    actionType: 'PLACE' | 'MOVE' | 'CAPTURE' | 'MILL',
    text: string,
    from?: number,
    to?: number,
    captured?: number
  ) => {
    const newRecord: MoveRecord = {
      id: Math.random().toString(36).substring(2, 9),
      moveNumber: moveHistory.length + 1,
      player,
      actionType,
      fromNode: from,
      toNode: to,
      capturedNode: captured,
      message: text,
      timestamp: Date.now(),
    };
    setMoveHistory((prev) => [newRecord, ...prev]);
  };

  // Reset entire game
  const resetGame = useCallback((newMode?: GameMode, newDiff?: AIDifficulty) => {
    setBoard(Array(24).fill(null));
    setActivePlayer('P1');
    setP1Hand(TOTAL_PIECES_PER_PLAYER);
    setP2Hand(TOTAL_PIECES_PER_PLAYER);
    setSelectedNode(null);
    setIsCapturing(false);
    setLastMovedNode(null);
    setMoveHistory([]);
    setWinner(null);
    setWinReason(null);
    setAiThinking(false);
    setKreeduMood('IDLE');
    aiTurnProcessingRef.current = false;

    setSettings((prev) => {
      const mode = newMode ?? prev.gameMode;
      const diff = newDiff ?? prev.difficulty;
      setStatusMessage(
        mode === 'PVC'
          ? 'Your Turn: Place a piece on any empty node'
          : 'Player 1 Turn (Terracotta): Place a piece on any empty node'
      );
      return {
        ...prev,
        gameMode: mode,
        difficulty: diff,
      };
    });
  }, []);

  // Sync initialMode and initialDifficulty when passed as props
  useEffect(() => {
    if (
      prevPropsRef.current.mode !== initialMode ||
      prevPropsRef.current.diff !== initialDifficulty
    ) {
      prevPropsRef.current = { mode: initialMode, diff: initialDifficulty };
      resetGame(initialMode, initialDifficulty);
    }
  }, [initialMode, initialDifficulty, resetGame]);

  // Change mode on the fly
  const handleModeChange = (mode: GameMode) => {
    if (mode === settings.gameMode) return;
    resetGame(mode, settings.difficulty);
  };

  // Change difficulty on the fly
  const handleDifficultyChange = (diff: AIDifficulty) => {
    if (diff === settings.difficulty && settings.gameMode === 'PVC') return;
    resetGame('PVC', diff);
  };

  const isPlacementPhase = p1Hand > 0 || p2Hand > 0;
  const p1BoardCount = countPiecesOnBoard(board, 'P1');
  const p2BoardCount = countPiecesOnBoard(board, 'P2');

  const p1Captured = TOTAL_PIECES_PER_PLAYER - p1Hand - p1BoardCount;
  const p2Captured = TOTAL_PIECES_PER_PLAYER - p2Hand - p2BoardCount;

  const isP1Flying = settings.flyingRule && !isPlacementPhase && p1BoardCount === 3;
  const isP2Flying = settings.flyingRule && !isPlacementPhase && p2BoardCount === 3;

  const activeMills = getActiveMills(board);

  // Legal moves calculation for current selection
  const legalMoveTargets =
    !isCapturing && !winner && selectedNode !== null
      ? getLegalMovesForPiece(
          board,
          selectedNode,
          activePlayer === 'P1' ? isP1Flying : isP2Flying
        )
      : [];

  // Valid capture targets when capturing
  const validCaptureTargets =
    isCapturing && !winner
      ? getValidCaptureTargets(board, activePlayer === 'P1' ? 'P2' : 'P1')
      : [];

  // Check victory after turn
  const verifyVictory = (currentBoard: BoardState, nextPlayer: Player): boolean => {
    const outcome = evaluateGameWinner(
      currentBoard,
      p1Hand,
      p2Hand,
      nextPlayer,
      settings.flyingRule
    );

    if (outcome.winner) {
      setWinner(outcome.winner);
      setWinReason(outcome.reason);
      if (outcome.winner === 'P1') {
        sounds.playVictory();
        setKreeduMood('LOSE');
        setStatusMessage('VICTORY! You have outthought your opponent!');
      } else {
        sounds.playDefeat();
        setKreeduMood('WIN');
        setStatusMessage(
          settings.gameMode === 'PVC'
            ? 'GAME OVER: Kreedu found the winning path.'
            : 'GAME OVER: Player 2 Wins!'
        );
      }
      return true;
    }
    return false;
  };

  // Handler for executing piece capture
  const handleCapture = (targetNode: number, capturingPlayer: Player) => {
    const opponent = capturingPlayer === 'P1' ? 'P2' : 'P1';
    const nextBoard = [...board];
    nextBoard[targetNode] = null;
    setBoard(nextBoard);
    setIsCapturing(false);
    sounds.playCapture();

    const playerName =
      capturingPlayer === 'P1'
        ? 'You'
        : settings.gameMode === 'PVC'
        ? 'Kreedu'
        : 'Player 2';
    logMove(capturingPlayer, 'CAPTURE', `${playerName} captured a piece.`, undefined, undefined, targetNode);

    // After capture, check if this capture won the game
    const nextTurnPlayer = opponent;
    const hasWon = verifyVictory(nextBoard, nextTurnPlayer);
    if (!hasWon) {
      setActivePlayer(nextTurnPlayer);
      setStatusMessage(
        nextTurnPlayer === 'P1'
          ? isPlacementPhase
            ? 'Your Turn: Place a piece'
            : 'Your Turn: Select a piece to move'
          : settings.gameMode === 'PVC'
          ? 'Kreedu is thinking...'
          : 'Player 2 Turn'
      );
    }
  };

  // Human player node click handler
  const handleNodeClick = (nodeIdx: number) => {
    if (winner || aiThinking || (settings.gameMode === 'PVC' && activePlayer === 'P2')) {
      return;
    }

    // 1. CAPTURE MODE
    if (isCapturing) {
      if (validCaptureTargets.includes(nodeIdx)) {
        handleCapture(nodeIdx, activePlayer);
      }
      return;
    }

    // 2. PLACEMENT PHASE
    if (isPlacementPhase) {
      const currentHand = activePlayer === 'P1' ? p1Hand : p2Hand;
      if (currentHand > 0 && board[nodeIdx] === null) {
        const nextBoard = [...board];
        nextBoard[nodeIdx] = activePlayer;
        setBoard(nextBoard);
        setLastMovedNode(nodeIdx);
        sounds.playPlace();

        if (activePlayer === 'P1') {
          setP1Hand((prev) => prev - 1);
        } else {
          setP2Hand((prev) => prev - 1);
        }

        const playerName = activePlayer === 'P1' ? 'You' : 'Player 2';
        logMove(activePlayer, 'PLACE', `${playerName} placed a piece.`, undefined, nodeIdx);

        // Check if placed piece forms a Mill
        if (formsNewMill(nextBoard, activePlayer, nodeIdx)) {
          sounds.playMill();
          setIsCapturing(true);
          setKreeduMood(activePlayer === 'P1' ? 'WORRIED' : 'HAPPY');
          logMove(activePlayer, 'MILL', `${playerName} formed a Daadi (Mill)!`);
          setStatusMessage(`${playerName} formed a Mill! Choose an opponent piece to capture.`);
        } else {
          // Switch turn
          const nextPlayer: Player = activePlayer === 'P1' ? 'P2' : 'P1';
          setActivePlayer(nextPlayer);
          setStatusMessage(
            nextPlayer === 'P1'
              ? 'Your Turn: Place a piece'
              : settings.gameMode === 'PVC'
              ? 'Kreedu is thinking...'
              : 'Player 2 Turn: Place a piece'
          );
        }
      }
      return;
    }

    // 3. MOVEMENT PHASE
    // A) If a piece is already selected:
    if (selectedNode !== null) {
      // If clicking same piece again -> deselect
      if (nodeIdx === selectedNode) {
        setSelectedNode(null);
        return;
      }

      // If clicking another piece of the same player -> switch selection
      if (board[nodeIdx] === activePlayer) {
        setSelectedNode(nodeIdx);
        return;
      }

      // If clicking a valid legal destination -> move piece!
      if (legalMoveTargets.includes(nodeIdx)) {
        const nextBoard = [...board];
        nextBoard[selectedNode] = null;
        nextBoard[nodeIdx] = activePlayer;
        setBoard(nextBoard);
        setLastMovedNode(nodeIdx);
        setSelectedNode(null);
        sounds.playMove();

        const playerName = activePlayer === 'P1' ? 'You' : 'Player 2';
        logMove(activePlayer, 'MOVE', `${playerName} moved a piece.`, selectedNode, nodeIdx);

        // Check if moved piece forms a Mill
        if (formsNewMill(nextBoard, activePlayer, nodeIdx)) {
          sounds.playMill();
          setIsCapturing(true);
          setKreeduMood(activePlayer === 'P1' ? 'WORRIED' : 'HAPPY');
          logMove(activePlayer, 'MILL', `${playerName} formed a Daadi (Mill)!`);
          setStatusMessage(`${playerName} formed a Mill! Choose an opponent piece to capture.`);
        } else {
          // Switch turn and check if opponent is blocked
          const nextPlayer: Player = activePlayer === 'P1' ? 'P2' : 'P1';
          const hasWon = verifyVictory(nextBoard, nextPlayer);
          if (!hasWon) {
            setActivePlayer(nextPlayer);
            setStatusMessage(
              nextPlayer === 'P1'
                ? 'Your Turn: Select a piece to move'
                : settings.gameMode === 'PVC'
                ? 'Kreedu is thinking...'
                : 'Player 2 Turn: Select a piece to move'
            );
          }
        }
      }
    } else {
      // B) No piece currently selected: select this player's piece
      if (board[nodeIdx] === activePlayer) {
        setSelectedNode(nodeIdx);
      }
    }
  };

  // AI Turn Execution Effect
  useEffect(() => {
    if (
      settings.gameMode !== 'PVC' ||
      activePlayer !== 'P2' ||
      winner ||
      isCapturing ||
      aiTurnProcessingRef.current
    ) {
      return;
    }

    aiTurnProcessingRef.current = true;
    setAiThinking(true);
    setKreeduMood('THINKING');

    const timer = setTimeout(() => {
      if (isPlacementPhase) {
        // AI Placement
        const aiMove = getAIPlacementMove(
          board,
          p1Hand,
          p2Hand,
          settings.difficulty
        );

        if (aiMove.placementNode !== -1) {
          const nextBoard = [...board];
          nextBoard[aiMove.placementNode] = 'P2';
          setBoard(nextBoard);
          setLastMovedNode(aiMove.placementNode);
          setP2Hand((prev) => prev - 1);
          sounds.playPlace();
          logMove('P2', 'PLACE', 'Kreedu placed a piece.', undefined, aiMove.placementNode);

          // Did AI form a mill?
          if (formsNewMill(nextBoard, 'P2', aiMove.placementNode)) {
            sounds.playMill();
            setKreeduMood('HAPPY');
            logMove('P2', 'MILL', 'Kreedu formed a Daadi (Mill)!');

            // AI captures
            if (aiMove.captureNode !== undefined && aiMove.captureNode !== -1) {
              setTimeout(() => {
                nextBoard[aiMove.captureNode!] = null;
                setBoard([...nextBoard]);
                sounds.playCapture();
                logMove('P2', 'CAPTURE', 'Kreedu captured your piece.', undefined, undefined, aiMove.captureNode);

                // Switch turn to P1
                setActivePlayer('P1');
                setAiThinking(false);
                setKreeduMood('IDLE');
                aiTurnProcessingRef.current = false;
                setStatusMessage('Your Turn: Place a piece');
              }, 450);
              return;
            }
          }

          // Normal switch
          setActivePlayer('P1');
          setAiThinking(false);
          setKreeduMood('IDLE');
          aiTurnProcessingRef.current = false;
          setStatusMessage('Your Turn: Place a piece');
        }
      } else {
        // AI Movement Phase
        const aiMove = getAIMovementMove(
          board,
          settings.difficulty,
          settings.flyingRule
        );

        if (aiMove.fromNode !== -1 && aiMove.toNode !== -1) {
          const nextBoard = [...board];
          nextBoard[aiMove.fromNode] = null;
          nextBoard[aiMove.toNode] = 'P2';
          setBoard(nextBoard);
          setLastMovedNode(aiMove.toNode);
          sounds.playMove();
          logMove('P2', 'MOVE', 'Kreedu moved a piece.', aiMove.fromNode, aiMove.toNode);

          // Did AI form a mill?
          if (formsNewMill(nextBoard, 'P2', aiMove.toNode)) {
            sounds.playMill();
            setKreeduMood('HAPPY');
            logMove('P2', 'MILL', 'Kreedu formed a Daadi (Mill)!');

            if (aiMove.captureNode !== undefined && aiMove.captureNode !== -1) {
              setTimeout(() => {
                nextBoard[aiMove.captureNode!] = null;
                setBoard([...nextBoard]);
                sounds.playCapture();
                logMove('P2', 'CAPTURE', 'Kreedu captured your piece.', undefined, undefined, aiMove.captureNode);

                const hasWon = verifyVictory(nextBoard, 'P1');
                if (!hasWon) {
                  setActivePlayer('P1');
                  setStatusMessage('Your Turn: Select a piece to move');
                }
                setAiThinking(false);
                setKreeduMood('IDLE');
                aiTurnProcessingRef.current = false;
              }, 450);
              return;
            }
          }

          // Check if P1 is trapped or defeated
          const hasWon = verifyVictory(nextBoard, 'P1');
          if (!hasWon) {
            setActivePlayer('P1');
            setStatusMessage('Your Turn: Select a piece to move');
          }
          setAiThinking(false);
          setKreeduMood('IDLE');
          aiTurnProcessingRef.current = false;
        } else {
          // Kreedu has no moves left -> P1 wins
          verifyVictory(board, 'P2');
          setAiThinking(false);
          aiTurnProcessingRef.current = false;
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    activePlayer,
    settings.gameMode,
    settings.difficulty,
    isPlacementPhase,
    p1Hand,
    p2Hand,
    board,
    winner,
    isCapturing,
  ]);

  return (
    <div className="max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6">
      
      {/* Interactive Mode & Difficulty Switcher Bar */}
      <div className="mb-4 bg-[#FAF4E5] border-[3px] border-[#5C140F] p-3 sm:p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Game Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="font-fraunces font-bold text-xs sm:text-sm text-[#5C140F] uppercase tracking-wider shrink-0">
              Mode:
            </span>
            <div className="grid grid-cols-2 gap-1.5 flex-1 sm:flex-initial">
              <button
                onClick={() => handleModeChange('PVC')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border-[2px] border-[#5C140F] text-xs font-bold transition-colors ${
                  settings.gameMode === 'PVC'
                    ? 'bg-[#5C140F] text-white shadow-none'
                    : 'bg-[#EFDFB8] text-[#5C140F] hover:bg-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>vs Kreedu (AI)</span>
              </button>

              <button
                onClick={() => handleModeChange('PVP')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border-[2px] border-[#5C140F] text-xs font-bold transition-colors ${
                  settings.gameMode === 'PVP'
                    ? 'bg-[#D8401F] text-white shadow-none'
                    : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-[#F6ECD2]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-white sm:text-inherit" />
                <span>2 Players (Local)</span>
              </button>
            </div>
          </div>

          {/* Difficulty Selector (when in AI Mode) */}
          {settings.gameMode === 'PVC' ? (
            <div className="flex items-center gap-2">
              <span className="font-fraunces font-bold text-xs sm:text-sm text-[#5C140F] uppercase tracking-wider shrink-0">
                Difficulty:
              </span>
              <div className="grid grid-cols-3 gap-1.5 flex-1 sm:flex-initial">
                <button
                  onClick={() => handleDifficultyChange('EASY')}
                  className={`px-2.5 py-1.5 border-[1.5px] border-[#5C140F] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    settings.difficulty === 'EASY'
                      ? 'bg-[#5F8F3B] text-white'
                      : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-[#F6ECD2]'
                  }`}
                  title="Easy: Casual & Learning mode"
                >
                  <span>🌱</span>
                  <span>Easy</span>
                </button>

                <button
                  onClick={() => handleDifficultyChange('MEDIUM')}
                  className={`px-2.5 py-1.5 border-[1.5px] border-[#5C140F] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    settings.difficulty === 'MEDIUM'
                      ? 'bg-[#D8401F] text-white'
                      : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-[#F6ECD2]'
                  }`}
                  title="Medium: Balanced tactical Minimax engine"
                >
                  <span>⚖️</span>
                  <span>Medium</span>
                </button>

                <button
                  onClick={() => handleDifficultyChange('HARD')}
                  className={`px-2.5 py-1.5 border-[1.5px] border-[#5C140F] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    settings.difficulty === 'HARD'
                      ? 'bg-[#5C140F] text-white'
                      : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-[#F6ECD2]'
                  }`}
                  title="Difficult: Master level Minimax evaluation"
                >
                  <span>🔥</span>
                  <span>Difficult</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs font-semibold text-[#2B1B12] bg-[#E4D19E] border-[1.5px] border-[#5C140F] px-3 py-1.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D8401F]" />
              <span>Pass & Play on Same Device</span>
            </div>
          )}

          {/* Quick Utility Controls */}
          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => onNavigate('MODE_SELECT')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F6ECD2] hover:bg-white border-[1.5px] border-[#5C140F] text-xs font-bold text-[#5C140F] cursor-pointer"
              title="Change Match Mode or AI Difficulty"
            >
              <Users className="w-3.5 h-3.5 text-[#D8401F]" />
              <span>Change Mode</span>
            </button>

            <button
              type="button"
              onClick={() => resetGame()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer"
              title="Reset Board"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F6ECD2] hover:bg-white border-[1.5px] border-[#5C140F] text-xs font-bold text-[#5C140F] cursor-pointer"
              title="Rules Help"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Game Status Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#F6ECD2] border-[3px] border-[#5C140F] p-3 sm:p-4">
        {/* Active Phase & Player Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 border-[#5C140F] shrink-0 transition-transform ${
              activePlayer === 'P1'
                ? 'bg-[#D8401F] ring-2 ring-[#D8401F]/50 ring-offset-2'
                : 'bg-[#5C140F] ring-2 ring-[#5C140F]/50 ring-offset-2'
            }`}
          />
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-fraunces font-bold text-base sm:text-lg text-[#5C140F]">
                {settings.gameMode === 'PVC'
                  ? activePlayer === 'P1'
                    ? 'Your Turn (Terracotta)'
                    : 'Kreedu’s Turn (Deep Maroon)'
                  : activePlayer === 'P1'
                  ? 'Player 1 Turn (Terracotta • ఎరుపు)'
                  : 'Player 2 Turn (Deep Maroon • ముదురు ఎరుపు)'}
              </span>
              <span className="px-2 py-0.5 bg-[#E4D19E] border-[1px] border-[#5C140F] text-[10px] font-bold text-[#2B1B12] uppercase">
                {isPlacementPhase ? 'Placement Phase' : 'Movement Phase'}
              </span>
              {settings.flyingRule && ((activePlayer === 'P1' && isP1Flying) || (activePlayer === 'P2' && isP2Flying)) && (
                <span className="px-2 py-0.5 bg-[#EFA90C] text-[#2B1B12] text-[10px] font-bold uppercase">
                  Flying Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B4E3D] font-medium">{statusMessage}</p>
          </div>
        </div>

        {/* Game Mode Status Tag */}
        <div className="flex items-center gap-2">
          {settings.gameMode === 'PVC' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E4D19E] border-[1.5px] border-[#5C140F] text-xs font-bold text-[#2B1B12]">
              <Bot className="w-3.5 h-3.5 text-[#0E5C58]" />
              <span>Kreedu ({settings.difficulty.toLowerCase()})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#D8401F]/15 border-[1.5px] border-[#5C140F] text-xs font-bold text-[#5C140F]">
              <User className="w-3.5 h-3.5 text-[#D8401F]" />
              <span>2 Players Pass & Play</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Game Layout: Board on left/center + Info Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Center / Left: Interactive Board */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <GameBoard
            board={board}
            activePlayer={activePlayer}
            selectedNode={selectedNode}
            legalMoveTargets={legalMoveTargets}
            validCaptureTargets={validCaptureTargets}
            activeMills={activeMills}
            isCapturing={isCapturing}
            onNodeClick={handleNodeClick}
            disabled={winner !== null || (settings.gameMode === 'PVC' && activePlayer === 'P2')}
            lastMovedNode={lastMovedNode}
          />

          {/* Bottom Inventory Bar on Mobile/Tablet */}
          <div className="w-full max-w-[560px] mt-4 grid grid-cols-2 gap-3">
            {/* Player 1 Inventory */}
            <div
              className={`border-[2px] p-2.5 flex items-center justify-between transition-colors ${
                activePlayer === 'P1'
                  ? 'bg-[#F6ECD2] border-[#D8401F] ring-2 ring-[#D8401F]/40'
                  : 'bg-[#F6ECD2] border-[#5C140F]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#D8401F] border-2 border-[#5C140F]" />
                <span className="text-xs font-bold text-[#5C140F]">
                  {settings.gameMode === 'PVC' ? 'You' : 'Player 1'}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#2B1B12] flex gap-2">
                <span>Hand: {p1Hand}</span>
                <span>Board: {p1BoardCount}</span>
                <span className="text-[#D8401F]">Lost: {p1Captured}</span>
              </div>
            </div>

            {/* Player 2 Inventory */}
            <div
              className={`border-[2px] p-2.5 flex items-center justify-between transition-colors ${
                activePlayer === 'P2'
                  ? 'bg-[#F6ECD2] border-[#5C140F] ring-2 ring-[#5C140F]/40'
                  : 'bg-[#F6ECD2] border-[#5C140F]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#5C140F] border-2 border-[#EFA90C]" />
                <span className="text-xs font-bold text-[#5C140F]">
                  {settings.gameMode === 'PVC' ? 'Kreedu' : 'Player 2'}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#2B1B12] flex gap-2">
                <span>Hand: {p2Hand}</span>
                <span>Board: {p2BoardCount}</span>
                <span className="text-[#5C140F]">Lost: {p2Captured}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Mascot / 2-Player Match Card & Move History */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Opponent Mascot Card (vs Kreedu AI) */}
          {settings.gameMode === 'PVC' ? (
            <FolkArtFrame bg="bg-[#F6ECD2]" className="p-4 sm:p-5">
              <div className="flex items-center justify-between border-b-[2px] border-[#5C140F] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#0E5C58]" />
                  <span className="font-fraunces font-bold text-sm text-[#5C140F]">
                    AI Opponent: Kreedu
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#E4D19E] border-[1px] border-[#5C140F] text-[10px] font-bold text-[#2B1B12] uppercase">
                  {settings.difficulty === 'EASY' && '🌱 Easy'}
                  {settings.difficulty === 'MEDIUM' && '⚖️ Medium'}
                  {settings.difficulty === 'HARD' && '🔥 Difficult'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <KreeduMascot
                  mood={kreeduMood}
                  size={64}
                  showDialogBubble={true}
                  dialogText={
                    aiThinking
                      ? 'Studying the grid...'
                      : isCapturing && activePlayer === 'P1'
                      ? 'Oh, a fine Daadi!'
                      : kreeduMood === 'HAPPY'
                      ? 'Strategic move!'
                      : settings.difficulty === 'HARD'
                      ? 'Calculating all counter moves...'
                      : 'Your turn to strike.'
                  }
                />
                <div className="text-xs text-[#2B1B12] space-y-1">
                  <p className="font-bold text-[#5C140F]">Offline Minimax AI</p>
                  <p className="text-[11px] text-[#6B4E3D]">
                    {settings.difficulty === 'EASY' && 'Relaxed play with learning-friendly moves.'}
                    {settings.difficulty === 'MEDIUM' && 'Balanced evaluation of mill threats and traps.'}
                    {settings.difficulty === 'HARD' && 'Deep minimax lookahead with aggressive mill trapping.'}
                  </p>
                </div>
              </div>
            </FolkArtFrame>
          ) : (
            /* 2-Player Match Card (Local Pass & Play) */
            <FolkArtFrame bg="bg-[#F6ECD2]" className="p-4 sm:p-5">
              <div className="flex items-center justify-between border-b-[2px] border-[#5C140F] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D8401F]" />
                  <span className="font-fraunces font-bold text-sm text-[#5C140F]">
                    2-Player Local Match
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#D8401F] text-white text-[10px] font-bold uppercase">
                  Pass & Play
                </span>
              </div>

              {/* Both Player Status Cards */}
              <div className="space-y-2.5">
                {/* Player 1 Banner */}
                <div
                  className={`p-2.5 border-[2px] transition-all ${
                    activePlayer === 'P1'
                      ? 'bg-[#D8401F]/15 border-[#D8401F] shadow-sm'
                      : 'bg-[#E4D19E] border-[#5C140F]/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#D8401F] border-2 border-[#5C140F]" />
                      <span className="font-bold text-xs text-[#5C140F]">
                        Player 1 (Terracotta)
                      </span>
                    </div>
                    {activePlayer === 'P1' && (
                      <span className="px-1.5 py-0.5 bg-[#D8401F] text-white text-[9px] font-bold uppercase">
                        Active Turn
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#2B1B12] flex justify-between font-semibold">
                    <span>In Hand: {p1Hand}</span>
                    <span>On Board: {p1BoardCount}</span>
                    <span className="text-[#D8401F]">Lost: {p1Captured}</span>
                  </div>
                </div>

                {/* Player 2 Banner */}
                <div
                  className={`p-2.5 border-[2px] transition-all ${
                    activePlayer === 'P2'
                      ? 'bg-[#5C140F]/15 border-[#5C140F] shadow-sm'
                      : 'bg-[#E4D19E] border-[#5C140F]/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5C140F] border-2 border-[#EFA90C]" />
                      <span className="font-bold text-xs text-[#5C140F]">
                        Player 2 (Deep Maroon)
                      </span>
                    </div>
                    {activePlayer === 'P2' && (
                      <span className="px-1.5 py-0.5 bg-[#5C140F] text-white text-[9px] font-bold uppercase">
                        Active Turn
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#2B1B12] flex justify-between font-semibold">
                    <span>In Hand: {p2Hand}</span>
                    <span>On Board: {p2BoardCount}</span>
                    <span className="text-[#5C140F]">Lost: {p2Captured}</span>
                  </div>
                </div>
              </div>
            </FolkArtFrame>
          )}

          {/* Move History Log */}
          <FolkArtFrame bg="bg-[#F6ECD2]" className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b-[2px] border-[#5C140F] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#5C140F]" />
                <h4 className="font-fraunces text-sm font-bold text-[#5C140F]">
                  Move History ({moveHistory.length})
                </h4>
              </div>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {moveHistory.length === 0 ? (
                <p className="text-center py-4 text-xs italic text-[#6B4E3D]">
                  Moves will appear here as you play...
                </p>
              ) : (
                moveHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-2 border-[1.5px] border-[#5C140F] flex items-center justify-between ${
                      rec.actionType === 'MILL'
                        ? 'bg-[#EFA90C]/25'
                        : rec.actionType === 'CAPTURE'
                        ? 'bg-[#D8401F]/20'
                        : 'bg-[#E4D19E]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#6B4E3D]">
                        #{rec.moveNumber}
                      </span>
                      <span className="font-bold text-[#2B1B12]">
                        {rec.message}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border-[1px] border-[#5C140F] ${
                        rec.player === 'P1'
                          ? 'bg-[#D8401F] text-white'
                          : 'bg-[#5C140F] text-white'
                      }`}
                    >
                      {rec.player === 'P1' ? 'P1' : settings.gameMode === 'PVC' ? 'Kreedu' : 'P2'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </FolkArtFrame>
        </div>
      </div>

      {/* WINNER / GAME OVER MODAL */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#F6ECD2] border-[4px] border-[#5C140F] p-6 text-center relative shadow-none">
            <KolamCorner position="top-left" size={28} className="absolute top-1 left-1" />
            <KolamCorner position="top-right" size={28} className="absolute top-1 right-1" />
            <KolamCorner position="bottom-left" size={28} className="absolute bottom-1 left-1" />
            <KolamCorner position="bottom-right" size={28} className="absolute bottom-1 right-1" />

            <div className="flex justify-center mb-3">
              {winner === 'P1' || settings.gameMode === 'PVP' ? (
                <div className="p-3 bg-[#D8401F] border-[2px] border-[#5C140F] text-white">
                  <Trophy className="w-10 h-10" />
                </div>
              ) : (
                <KreeduMascot mood="WIN" size={72} />
              )}
            </div>

            <h3 className="font-fraunces text-3xl font-extrabold text-[#5C140F] mb-1">
              {settings.gameMode === 'PVC'
                ? winner === 'P1'
                  ? 'VICTORY!'
                  : 'GAME OVER'
                : winner === 'P1'
                ? 'PLAYER 1 WINS!'
                : 'PLAYER 2 WINS!'}
            </h3>
            <div className="font-telugu text-lg font-bold text-[#D8401F] mb-2">
              {settings.gameMode === 'PVC'
                ? winner === 'P1'
                  ? 'మీ వ్యూహం గెలిచింది!'
                  : 'ఆట ముగిసింది'
                : winner === 'P1'
                ? 'ప్లేయర్ 1 గెలిచారు!'
                : 'ప్లేయర్ 2 గెలిచారు!'}
            </div>

            <p className="text-sm text-[#2B1B12] font-medium mb-4">
              {settings.gameMode === 'PVC'
                ? winner === 'P1'
                  ? 'Your strategy has prevailed. You outmaneuvered Kreedu!'
                  : 'Kreedu found the winning path. Better luck in the next duel!'
                : winner === 'P1'
                ? 'Player 1 outthought their opponent in tactical alignment!'
                : 'Player 2 outthought their opponent in tactical alignment!'}
            </p>

            {winReason && (
              <div className="mb-6 p-2 bg-[#E4D19E] border-[2px] border-[#5C140F] text-xs font-semibold text-[#2B1B12]">
                Reason: {winReason}
              </div>
            )}

            {/* Final Pieces Counts */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-2 border-[2px] border-[#5C140F] bg-[#E4D19E]">
                <span className="block text-[11px] font-bold text-[#5C140F]">
                  {settings.gameMode === 'PVC' ? 'YOU' : 'PLAYER 1'}
                </span>
                <span className="text-lg font-bold font-fraunces text-[#D8401F]">
                  {p1BoardCount} pieces
                </span>
              </div>
              <div className="p-2 border-[2px] border-[#5C140F] bg-[#E4D19E]">
                <span className="block text-[11px] font-bold text-[#5C140F]">
                  {settings.gameMode === 'PVC' ? 'KREEDU' : 'PLAYER 2'}
                </span>
                <span className="text-lg font-bold font-fraunces text-[#5C140F]">
                  {p2BoardCount} pieces
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => resetGame()}
                className="w-full py-3 bg-[#D8401F] hover:bg-[#B83215] text-white border-[3px] border-[#5C140F] font-bold text-sm tracking-wide cursor-pointer uppercase"
              >
                Play Again (Same Mode)
              </button>

              <button
                type="button"
                onClick={() => {
                  setWinner(null);
                  onNavigate('MODE_SELECT');
                }}
                className="w-full py-2.5 bg-[#F6ECD2] hover:bg-white border-[2px] border-[#5C140F] text-xs font-bold text-[#5C140F] flex items-center justify-center gap-1.5 cursor-pointer uppercase"
              >
                <Users className="w-3.5 h-3.5 text-[#D8401F]" />
                <span>Change Mode / Difficulty</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWinner(null);
                    onNavigate('HOW_TO_PLAY');
                  }}
                  className="flex-1 py-2 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[2px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer"
                >
                  Rules
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWinner(null);
                    onNavigate('HOME');
                  }}
                  className="flex-1 py-2 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[2px] border-[#5C140F] text-xs font-bold text-[#2B1B12] cursor-pointer"
                >
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#F6ECD2] border-[4px] border-[#5C140F] p-6 relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-3 right-3 p-1.5 bg-[#E4D19E] border-[2px] border-[#5C140F] text-[#5C140F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-fraunces text-2xl font-bold text-[#5C140F] mb-4">
              Game Settings & Options
            </h3>

            <div className="space-y-4 mb-6 text-xs text-[#2B1B12]">
              {/* Opponent Mode */}
              <div>
                <label className="block font-bold mb-1.5 text-[#5C140F]">Select Game Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, gameMode: 'PVC' }))}
                    className={`py-2 border-[2px] border-[#5C140F] font-bold cursor-pointer ${
                      settings.gameMode === 'PVC'
                        ? 'bg-[#0E5C58] text-white'
                        : 'bg-[#E4D19E] text-[#2B1B12]'
                    }`}
                  >
                    🤖 vs Kreedu AI
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, gameMode: 'PVP' }))}
                    className={`py-2 border-[2px] border-[#5C140F] font-bold cursor-pointer ${
                      settings.gameMode === 'PVP'
                        ? 'bg-[#D8401F] text-white'
                        : 'bg-[#E4D19E] text-[#2B1B12]'
                    }`}
                  >
                    👥 2 Players (Local)
                  </button>
                </div>
              </div>

              {/* AI Difficulty */}
              {settings.gameMode === 'PVC' && (
                <div>
                  <label className="block font-bold mb-1.5 text-[#5C140F]">Kreedu AI Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSettings((s) => ({ ...s, difficulty: 'EASY' }))}
                      className={`py-2 border-[2px] border-[#5C140F] font-bold text-center cursor-pointer ${
                        settings.difficulty === 'EASY'
                          ? 'bg-[#5F8F3B] text-white'
                          : 'bg-[#E4D19E] text-[#2B1B12]'
                      }`}
                    >
                      <div>🌱 Easy</div>
                      <div className="text-[9px] opacity-80">Casual</div>
                    </button>

                    <button
                      onClick={() => setSettings((s) => ({ ...s, difficulty: 'MEDIUM' }))}
                      className={`py-2 border-[2px] border-[#5C140F] font-bold text-center cursor-pointer ${
                        settings.difficulty === 'MEDIUM'
                          ? 'bg-[#D8401F] text-white'
                          : 'bg-[#E4D19E] text-[#2B1B12]'
                      }`}
                    >
                      <div>⚖️ Medium</div>
                      <div className="text-[9px] opacity-80">Balanced</div>
                    </button>

                    <button
                      onClick={() => setSettings((s) => ({ ...s, difficulty: 'HARD' }))}
                      className={`py-2 border-[2px] border-[#5C140F] font-bold text-center cursor-pointer ${
                        settings.difficulty === 'HARD'
                          ? 'bg-[#5C140F] text-white'
                          : 'bg-[#E4D19E] text-[#2B1B12]'
                      }`}
                    >
                      <div>🔥 Difficult</div>
                      <div className="text-[9px] opacity-80">Master</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Flying Rule */}
              <div className="p-3 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#5C140F]">Optional "Flying" Rule</span>
                  <input
                    type="checkbox"
                    checked={settings.flyingRule}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, flyingRule: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#D8401F] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[#6B4E3D]">
                  When a player is down to exactly 3 pieces, their pieces can "fly" to any empty node instead of only adjacent nodes. (Default: Off).
                </p>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <span className="font-bold text-[#5C140F]">Sound Effects</span>
                <button
                  onClick={() => {
                    const next = sounds.toggleMute();
                    setSettings((s) => ({ ...s, soundEnabled: !next }));
                  }}
                  className="px-3 py-1 bg-[#F6ECD2] border-[1.5px] border-[#5C140F] font-bold text-xs cursor-pointer text-[#2B1B12]"
                >
                  {settings.soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  resetGame(settings.gameMode, settings.difficulty);
                }}
                className="flex-1 py-2.5 bg-[#D8401F] hover:bg-[#B83215] text-white border-[2px] border-[#5C140F] font-bold text-xs uppercase tracking-wide cursor-pointer"
              >
                Apply & Restart Match
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2.5 bg-[#E4D19E] hover:bg-[#F6ECD2] border-[2px] border-[#5C140F] font-bold text-xs cursor-pointer text-[#2B1B12]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK IN-GAME HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#F6ECD2] border-[4px] border-[#5C140F] p-6 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-3 right-3 p-1.5 bg-[#E4D19E] border-[2px] border-[#5C140F] text-[#5C140F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <LotusIcon size={20} color="#D8401F" />
              <h3 className="font-fraunces text-2xl font-bold text-[#5C140F]">
                Quick Rules Reference
              </h3>
            </div>
            <FolkDivider className="mb-3" />

            <div className="space-y-3 text-xs text-[#2B1B12] leading-relaxed">
              <div className="p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1 text-[#5C140F]">1. Placement Phase</h4>
                <p>Each player starts with 9 pieces. Take turns placing 1 piece on any vacant node.</p>
              </div>

              <div className="p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1 text-[#5C140F]">2. Mill (Daadi) & Capture</h4>
                <p>Align 3 pieces horizontally or vertically along marked lines to form a Mill. This lets you capture 1 opponent piece (cannot take pieces in an active mill unless all are in mills).</p>
              </div>

              <div className="p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1 text-[#5C140F]">3. Movement Phase</h4>
                <p>After all 18 pieces are placed, players move 1 piece along connected grid lines to an adjacent vacant intersection.</p>
              </div>

              <div className="p-2.5 bg-[#E4D19E] border-[2px] border-[#5C140F]">
                <h4 className="font-bold text-sm mb-1 text-[#5C140F]">4. Winning</h4>
                <p>Win when the opponent is reduced to fewer than 3 pieces OR has no legal moves remaining.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#5C140F] flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 bg-[#D8401F] text-white border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Back to Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
