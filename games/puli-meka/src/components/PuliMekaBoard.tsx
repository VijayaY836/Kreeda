import React from 'react';
import { BOARD_DEFS, GameState } from '../game/puliMekaEngine';

interface PuliMekaBoardProps {
  state: GameState;
  selectedPiece: number | null;
  legalTargets: number[];
  onNodeClick: (node: number) => void;
  disabled?: boolean;
}

export const PuliMekaBoard: React.FC<PuliMekaBoardProps> = ({
  state,
  selectedPiece,
  legalTargets,
  onNodeClick,
  disabled = false,
}) => {
  const definition = BOARD_DEFS[state.variant.boardType];
  const nodes = Object.entries(definition.nodes) as [string, { x: number; y: number }][];
  const lineSegments = definition.lines.flatMap((line) =>
    line.slice(0, -1).map((node, index) => ({ from: definition.nodes[node], to: definition.nodes[line[index + 1]] }))
  );

  return (
    <div className="w-full aspect-square mx-auto bg-[#E4D19E] select-none">
      <div className="relative w-full h-full bg-[#E4D19E] overflow-hidden">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-label={`${state.variant.name} game board`}>
          <g stroke="#5C140F" strokeWidth="0.65" opacity="0.7">
            {lineSegments.map((segment, index) => (
              <line key={`line-${index}`} x1={segment.from.x} y1={segment.from.y} x2={segment.to.x} y2={segment.to.y} />
            ))}
          </g>
          <g opacity="0.18" fill="#D8401F">
            <circle cx="50" cy="50" r="7" />
            <path d="M50 39 L61 50 L50 61 L39 50 Z" fill="none" stroke="#5C140F" strokeWidth="1" />
          </g>
        </svg>

        {nodes.map(([nodeId, position]) => {
          const node = Number(nodeId);
          const piece = state.board[node];
          const isSelected = selectedPiece === node;
          const isTarget = legalTargets.includes(node);
          const isMekaPlacement = state.phase === 'PLACEMENT' && state.currentPlayer === 'MEKA' && !piece;
          const canClick = !disabled && (isTarget || Boolean(piece) || isMekaPlacement);
          return (
            <button
              key={nodeId}
              type="button"
              aria-label={`${piece?.type ?? 'empty'} at board point ${node + 1}`}
              disabled={!canClick}
              onClick={() => onNodeClick(node)}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[12%] aspect-square rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#EFA90C]"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              {isTarget && <span className="absolute inset-[12%] rounded-full border-[3px] border-[#0E5C58] bg-[#0E5C58]/20 animate-pulse" />}
              {!piece && <span className="w-[28%] aspect-square rounded-full bg-[#5C140F] opacity-70" />}
              {piece && (
                <span className={`relative w-[90%] aspect-square flex items-center justify-center transition-transform ${isSelected ? 'scale-125 ring-4 ring-[#EFA90C] rounded-full' : ''}`}>
                  <img
                    src={piece.type === 'PULI' ? './tiger_face.png' : './goat_face.png'}
                    alt={piece.type === 'PULI' ? 'Puli' : 'Meka'}
                    className="w-full h-full object-contain drop-shadow-[0_2px_2px_rgba(43,27,18,0.35)]"
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};