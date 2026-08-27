import React, { useState } from 'react';
import { BoardState, Player } from '../types';
import { FolkArtFrame } from './FolkArtFrame';
import { FolkDivider, LotusIcon } from './FolkArtMotifs';
import { GameBoard } from './GameBoard';
import { sounds } from '../utils/soundEngine';
import { ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';

interface TutorialStepConfig {
  stepNumber: number;
  title: string;
  subtitle: string;
  instructions: string;
  board: BoardState;
  activePlayer: Player;
  p1Hand: number;
  p2Hand: number;
  selectedNode: number | null;
  legalTargets: number[];
  captureTargets: number[];
  activeMills: [number, number, number][];
  isCapturing: boolean;
  requiredActionText: string;
  expectedNodeClick?: number;
  successMessage: string;
}

export const InteractiveTutorial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [stepCompleted, setStepCompleted] = useState<boolean>(false);
  const [dynamicBoard, setDynamicBoard] = useState<BoardState | null>(null);

  const tutorialSteps: TutorialStepConfig[] = [
    {
      stepNumber: 1,
      title: 'PLACEMENT PHASE',
      subtitle: 'దాడి ప్రారంభం (Beginning the placement)',
      instructions:
        'The game begins with an empty board. Each player holds 9 pieces. Players take turns placing one piece at a time onto any empty intersection point.',
      board: [
        null, 'P2', null,
        null, null, null,
        'P1', null,
        null, null, null,
        null, null, null,
        null, null,
        null, null, null,
        null, null, null,
        null, null,
      ],
      activePlayer: 'P1',
      p1Hand: 8,
      p2Hand: 8,
      selectedNode: null,
      legalTargets: [0, 2, 8, 9, 10, 16],
      captureTargets: [],
      activeMills: [],
      isCapturing: false,
      expectedNodeClick: 0,
      requiredActionText: 'Tap any highlighted intersection (e.g. Outer Top-Left node) to place your Terracotta piece.',
      successMessage: 'Great job! Piece placed. Players alternate until all 18 pieces are on the board.',
    },
    {
      stepNumber: 2,
      title: 'FORMING A MILL (DAADI)',
      subtitle: 'మూడు వరుస (Three-in-a-row alignment)',
      instructions:
        'A Mill (Daadi / Saalu) is formed whenever 3 of your pieces align horizontally or vertically on a connected line. Diagonal lines are NOT allowed.',
      board: [
        'P1', 'P1', null,
        null, 'P2', null,
        null, 'P2',
        null, null, null,
        null, null, null,
        null, null,
        null, null, null,
        null, null, null,
        null, null,
      ],
      activePlayer: 'P1',
      p1Hand: 3,
      p2Hand: 3,
      selectedNode: null,
      legalTargets: [2],
      captureTargets: [],
      activeMills: [],
      isCapturing: false,
      expectedNodeClick: 2,
      requiredActionText: 'Tap node [Outer Top-Right] to complete your 3-piece Mill [0, 1, 2]!',
      successMessage: 'MILL FORMED! Notice the golden connection line. You have now earned a capture!',
    },
    {
      stepNumber: 3,
      title: 'CAPTURING AN OPPONENT PIECE',
      subtitle: 'దాడి కొట్టడం (Taking opponent counters)',
      instructions:
        'When you form a Mill, you immediately capture one of your opponent’s pieces and remove it from the board. Important rule: you cannot take a piece currently inside an active opponent mill, unless ALL their pieces are in mills.',
      board: [
        'P1', 'P1', 'P1',
        null, 'P2', null,
        null, 'P2',
        null, null, null,
        null, null, null,
        null, null,
        null, null, null,
        null, null, null,
        null, null,
      ],
      activePlayer: 'P1',
      p1Hand: 2,
      p2Hand: 3,
      selectedNode: null,
      legalTargets: [],
      captureTargets: [4, 7],
      activeMills: [[0, 1, 2]],
      isCapturing: true,
      expectedNodeClick: 4,
      requiredActionText: 'Tap either highlighted Maroon piece to capture it and remove it from the board.',
      successMessage: 'Captured! The opponent loses this piece forever, reducing their strength.',
    },
    {
      stepNumber: 4,
      title: 'MOVEMENT PHASE',
      subtitle: 'కదలిక దశ (Moving along grid lines)',
      instructions:
        'Once all 9 pieces have been placed by both players, the Movement Phase begins. On your turn, pick one of your pieces and slide it along a marked line to an adjacent empty spot.',
      board: [
        'P1', null, 'P2',
        null, 'P1', null,
        null, 'P2',
        null, 'P1', null,
        null, null, null,
        null, null,
        null, null, null,
        null, null, null,
        null, null,
      ],
      activePlayer: 'P1',
      p1Hand: 0,
      p2Hand: 0,
      selectedNode: 0,
      legalTargets: [1, 7],
      captureTargets: [],
      activeMills: [],
      isCapturing: false,
      expectedNodeClick: 1,
      requiredActionText: 'Piece at Top-Left is selected. Tap the adjacent Top-Mid node to slide it over.',
      successMessage: 'Excellent slide! Move strategically to form new mills or block your opponent.',
    },
    {
      stepNumber: 5,
      title: 'VICTORY CONDITIONS',
      subtitle: 'విజయం (Achieving victory)',
      instructions:
        'You win Daadi Aata in either of two ways: 1) Reduce your opponent to fewer than 3 pieces (since 3 are needed to form a mill), OR 2) Completely trap and block your opponent so they have zero legal moves remaining.',
      board: [
        'P1', 'P1', 'P1',
        null, 'P2', null,
        null, 'P2',
        null, null, null,
        null, null, null,
        null, null,
        null, null, null,
        null, null, null,
        null, null,
      ],
      activePlayer: 'P1',
      p1Hand: 0,
      p2Hand: 0,
      selectedNode: null,
      legalTargets: [],
      captureTargets: [],
      activeMills: [[0, 1, 2]],
      isCapturing: false,
      requiredActionText: 'You now understand all key rules! Ready to challenge Kreedu or a friend?',
      successMessage: 'You are now ready to master Daadi Aata!',
    },
  ];

  const currentStep = tutorialSteps[currentStepIdx];
  const activeBoard = dynamicBoard || currentStep.board;

  const handleNodeClick = (nodeIdx: number) => {
    if (stepCompleted) return;

    if (currentStep.expectedNodeClick !== undefined) {
      if (currentStep.expectedNodeClick === nodeIdx || currentStep.legalTargets.includes(nodeIdx) || currentStep.captureTargets.includes(nodeIdx)) {
        sounds.playPlace();
        const nextBoard = [...activeBoard];
        if (currentStep.isCapturing) {
          nextBoard[nodeIdx] = null;
          sounds.playCapture();
        } else if (currentStep.stepNumber === 4 && currentStep.selectedNode !== null) {
          nextBoard[currentStep.selectedNode] = null;
          nextBoard[nodeIdx] = 'P1';
          sounds.playMove();
        } else {
          nextBoard[nodeIdx] = 'P1';
          if (currentStep.stepNumber === 2) {
            sounds.playMill();
          }
        }
        setDynamicBoard(nextBoard);
        setStepCompleted(true);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStepIdx < tutorialSteps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setStepCompleted(false);
      setDynamicBoard(null);
    } else {
      onComplete();
    }
  };

  const handleRestartStep = () => {
    setStepCompleted(false);
    setDynamicBoard(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Title section */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1 mb-2 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
          <LotusIcon size={18} color="#D8401F" />
          Interactive Visual Tutorial
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-fraunces text-[#5C140F]">
          Learn Daadi Aata Step-by-Step
        </h2>
        <FolkDivider className="my-2" />
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center items-center gap-2 mb-6">
        {tutorialSteps.map((step, idx) => (
          <button
            key={`step-dot-${idx}`}
            onClick={() => {
              setCurrentStepIdx(idx);
              setStepCompleted(false);
              setDynamicBoard(null);
            }}
            className={`px-3 py-1.5 border-[2px] border-[#5C140F] text-xs font-bold transition-all cursor-pointer ${
              idx === currentStepIdx
                ? 'bg-[#D8401F] text-white'
                : idx < currentStepIdx
                ? 'bg-[#EFA90C] text-[#2B1B12]'
                : 'bg-[#F6ECD2] text-[#5C140F] opacity-70'
            }`}
          >
            Step {step.stepNumber}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Board */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <GameBoard
            board={activeBoard}
            activePlayer={currentStep.activePlayer}
            selectedNode={currentStep.selectedNode}
            legalMoveTargets={stepCompleted ? [] : currentStep.legalTargets}
            validCaptureTargets={stepCompleted ? [] : currentStep.captureTargets}
            activeMills={
              stepCompleted && currentStep.stepNumber === 2
                ? [[0, 1, 2]]
                : currentStep.activeMills
            }
            isCapturing={currentStep.isCapturing && !stepCompleted}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Right Instruction Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <FolkArtFrame bg="bg-[#F6ECD2]">
            <div className="flex items-center justify-between border-b-[2px] border-[#5C140F] pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D8401F]">
                Step {currentStep.stepNumber} of 5
              </span>
              <span className="font-telugu text-sm text-[#D8401F] font-bold">
                {currentStep.subtitle}
              </span>
            </div>

            <h3 className="text-2xl font-bold font-fraunces text-[#5C140F] mb-3">
              {currentStep.title}
            </h3>

            <p className="text-sm text-[#2B1B12] leading-relaxed mb-4">
              {currentStep.instructions}
            </p>

            {/* Action Box */}
            <div
              className={`p-3 border-[2px] border-[#5C140F] mb-4 ${
                stepCompleted ? 'bg-[#5F8F3B]/20' : 'bg-[#E4D19E]'
              }`}
            >
              {stepCompleted ? (
                <div className="flex items-start gap-2 text-sm font-bold text-[#5C140F]">
                  <CheckCircle2 className="w-5 h-5 text-[#5F8F3B] shrink-0 mt-0.5" />
                  <span>{currentStep.successMessage}</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs font-semibold text-[#2B1B12]">
                  <div className="w-2.5 h-2.5 bg-[#D8401F] shrink-0 mt-1" />
                  <span>{currentStep.requiredActionText}</span>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRestartStep}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border-[2px] border-[#5C140F] bg-[#E4D19E] hover:bg-[#FAF4E5] text-xs font-bold text-[#2B1B12] cursor-pointer"
                title="Reset this step"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={handleNextStep}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 border-[3px] border-[#5C140F] text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  stepCompleted || currentStep.stepNumber === 5
                    ? 'bg-[#D8401F] hover:bg-[#B83215] text-white'
                    : 'bg-[#E4D19E] text-[#2B1B12] opacity-90'
                }`}
              >
                {currentStepIdx < tutorialSteps.length - 1 ? (
                  <>
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Ready to Play!
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </FolkArtFrame>
        </div>
      </div>
    </div>
  );
};
