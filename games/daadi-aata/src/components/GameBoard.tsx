import React from 'react';
import { BoardState, Player } from '../types';
import {
  ALL_MILLS,
  BOARD_NODES,
  BOARD_SQUARE_SEGMENTS,
} from '../utils/gameConstants';
import { isNodeInMill } from '../utils/gameEngine';

interface GameBoardProps {
  board: BoardState;
  activePlayer: Player;
  selectedNode: number | null;
  legalMoveTargets: number[];
  validCaptureTargets: number[];
  activeMills: [number, number, number][];
  isCapturing: boolean;
  onNodeClick: (nodeIndex: number) => void;
  disabled?: boolean;
  lastMovedNode?: number | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  activePlayer,
  selectedNode,
  legalMoveTargets,
  validCaptureTargets,
  activeMills,
  isCapturing,
  onNodeClick,
  disabled = false,
  lastMovedNode,
}) => {
  return (
    <div className="relative w-full max-w-[560px] aspect-square mx-auto select-none">
      {/* Outer Folk Art Board Container (Rich Teal #0E5C58 - stands out with high contrast against the paper/cream page) */}
      <div className="w-full h-full bg-[#0E5C58] border-[4px] border-[#5C140F] relative p-3 sm:p-4 box-border shadow-[4px_4px_0px_0px_#5C140F]">
        
        {/* Subtle decorative inner border line */}
        <div className="w-full h-full border-[2px] border-[#EFA90C]/60 relative bg-[#0E5C58]">
          
          <svg
            viewBox="0 0 600 600"
            className="w-full h-full"
            aria-label="Daadi Aata Game Board"
          >
            {/* Background geometric center motif */}
            <g opacity="0.25">
              <rect x="270" y="270" width="60" height="60" fill="#F6ECD2" transform="rotate(45 300 300)" />
              <circle cx="300" cy="300" r="16" fill="#EFA90C" />
            </g>

            {/* Board Structural Lines (3 Concentric Squares + 4 Midpoint Lines in Light Cream #F6ECD2) */}
            <g stroke="#F6ECD2" strokeWidth="4" strokeLinecap="square">
              {BOARD_SQUARE_SEGMENTS.map((seg, idx) => (
                <line
                  key={`seg-${idx}`}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                />
              ))}
            </g>

            {/* Corner Decorative Ornaments on the board */}
            <g fill="#EFA90C">
              <polygon points="60,60 76,60 60,76" />
              <polygon points="540,60 524,60 540,76" />
              <polygon points="540,540 524,540 540,524" />
              <polygon points="60,540 76,540 60,524" />
            </g>

            {/* Active Mills Visual Highlight Lines (Marigold #EFA90C) */}
            <g stroke="#EFA90C" strokeWidth="7" strokeLinecap="round" opacity="0.95">
              {activeMills.map((mill, idx) => {
                const nA = BOARD_NODES[mill[0]];
                const nC = BOARD_NODES[mill[2]];
                return (
                  <line
                    key={`active-mill-${idx}`}
                    x1={nA.x}
                    y1={nA.y}
                    x2={nC.x}
                    y2={nC.y}
                  />
                );
              })}
            </g>

            {/* Board Intersection Points and Pieces */}
            {BOARD_NODES.map((node) => {
              const piece = board[node.id];
              const isSelected = selectedNode === node.id;
              const isLegalTarget = legalMoveTargets.includes(node.id);
              const isCaptureTarget = validCaptureTargets.includes(node.id);
              const isRecent = lastMovedNode === node.id;
              const isInActiveMill = piece ? isNodeInMill(board, piece, node.id) : false;

              const isClickable =
                !disabled &&
                (isLegalTarget ||
                  isCaptureTarget ||
                  (piece === activePlayer && !isCapturing) ||
                  (piece === null && legalMoveTargets.length === 0 && !isCapturing && !selectedNode));

              return (
                <g
                  key={`node-${node.id}`}
                  onClick={() => !disabled && onNodeClick(node.id)}
                  className={isClickable ? 'cursor-pointer' : 'cursor-default'}
                  tabIndex={isClickable ? 0 : -1}
                  role="button"
                  aria-label={`${node.name}, ${piece ? `${piece} piece` : 'empty'}`}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
                      e.preventDefault();
                      onNodeClick(node.id);
                    }
                  }}
                >
                  {/* Enlarged hit target with pointer-events for guaranteed touch & mouse detection */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="28"
                    fill="#000000"
                    opacity="0.001"
                    style={{ pointerEvents: 'all' }}
                  />

                  {/* Empty Node Base Intersect Point */}
                  {piece === null && (
                    <>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="7"
                        fill="#F6ECD2"
                        stroke="#5C140F"
                        strokeWidth="2.5"
                      />
                      <circle cx={node.x} cy={node.y} r="2.5" fill="#5C140F" />
                    </>
                  )}

                  {/* Legal Move Target Highlight Ring (Green #5F8F3B for legal moves) */}
                  {isLegalTarget && (
                    <g>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="19"
                        fill="#5F8F3B"
                        fillOpacity="0.35"
                        stroke="#5F8F3B"
                        strokeWidth="3.5"
                        strokeDasharray="4 2"
                      />
                      <circle cx={node.x} cy={node.y} r="7" fill="#5F8F3B" stroke="#F6ECD2" strokeWidth="1.5" />
                    </g>
                  )}

                  {/* Piece Rendering */}
                  {piece !== null && (
                    <g>
                      {/* Selection Aura (Marigold #EFA90C) */}
                      {isSelected && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="26"
                          fill="none"
                          stroke="#EFA90C"
                          strokeWidth="4"
                          strokeDasharray="6 3"
                        />
                      )}

                      {/* Capture Target Highlight (Terracotta #D8401F / Maroon #5C140F) */}
                      {isCaptureTarget && (
                        <g>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="25"
                            fill="#D8401F"
                            fillOpacity="0.35"
                            stroke="#D8401F"
                            strokeWidth="3.5"
                          />
                          {/* Crosshair accents */}
                          <line
                            x1={node.x - 22}
                            y1={node.y}
                            x2={node.x - 14}
                            y2={node.y}
                            stroke="#D8401F"
                            strokeWidth="3"
                          />
                          <line
                            x1={node.x + 14}
                            y1={node.y}
                            x2={node.x + 22}
                            y2={node.y}
                            stroke="#D8401F"
                            strokeWidth="3"
                          />
                          <line
                            x1={node.x}
                            y1={node.y - 22}
                            x2={node.x}
                            y2={node.y - 14}
                            stroke="#D8401F"
                            strokeWidth="3"
                          />
                          <line
                            x1={node.x}
                            y1={node.y + 14}
                            x2={node.x}
                            y2={node.y + 22}
                            stroke="#D8401F"
                            strokeWidth="3"
                          />
                        </g>
                      )}

                      {/* Mill Indicator Crown for piece (Marigold #EFA90C) */}
                      {isInActiveMill && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="23"
                          fill="none"
                          stroke="#EFA90C"
                          strokeWidth="3"
                        />
                      )}

                      {/* PLAYER 1: TERRACOTTA (#D8401F) PIECE */}
                      {piece === 'P1' && (
                        <g>
                          {/* Outer Piece Body */}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="19"
                            fill="#D8401F"
                            stroke="#F6ECD2"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="19"
                            fill="none"
                            stroke="#5C140F"
                            strokeWidth="3"
                          />
                          {/* Inner Decorative Ring */}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="12"
                            fill="#F6ECD2"
                            stroke="#5C140F"
                            strokeWidth="1.5"
                          />
                          {/* Central Lotus Motif / Core */}
                          <circle cx={node.x} cy={node.y} r="5" fill="#D8401F" />
                          <circle cx={node.x} cy={node.y} r="2" fill="#5C140F" />
                        </g>
                      )}

                      {/* PLAYER 2 / KREEDU: DEEP MAROON (#5C140F) PIECE */}
                      {piece === 'P2' && (
                        <g>
                          {/* Outer Piece Body */}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="19"
                            fill="#5C140F"
                            stroke="#F6ECD2"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="19"
                            fill="none"
                            stroke="#5C140F"
                            strokeWidth="3"
                          />
                          {/* Inner Decorative Ring */}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="12"
                            fill="#2B1B12"
                            stroke="#EFA90C"
                            strokeWidth="1.5"
                          />
                          {/* Central Diamond Motif */}
                          <rect
                            x={node.x - 4}
                            y={node.y - 4}
                            width="8"
                            height="8"
                            fill="#EFA90C"
                            transform={`rotate(45 ${node.x} ${node.y})`}
                          />
                        </g>
                      )}

                      {/* Recent Move Indicator (Marigold #EFA90C) */}
                      {isRecent && (
                        <circle
                          cx={node.x + 12}
                          cy={node.y - 12}
                          r="4"
                          fill="#EFA90C"
                          stroke="#5C140F"
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
