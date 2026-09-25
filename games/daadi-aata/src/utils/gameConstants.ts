import { BoardNode } from '../types';

export const BOARD_NODES: BoardNode[] = [
  // Outer Ring (0-7)
  { id: 0, x: 60, y: 60, ring: 'OUTER', name: 'Outer Top-Left', adjacents: [1, 7] },
  { id: 1, x: 300, y: 60, ring: 'OUTER', name: 'Outer Top-Mid', adjacents: [0, 2, 9] },
  { id: 2, x: 540, y: 60, ring: 'OUTER', name: 'Outer Top-Right', adjacents: [1, 3] },
  { id: 3, x: 540, y: 300, ring: 'OUTER', name: 'Outer Right-Mid', adjacents: [2, 4, 11] },
  { id: 4, x: 540, y: 540, ring: 'OUTER', name: 'Outer Bottom-Right', adjacents: [3, 5] },
  { id: 5, x: 300, y: 540, ring: 'OUTER', name: 'Outer Bottom-Mid', adjacents: [4, 6, 13] },
  { id: 6, x: 60, y: 540, ring: 'OUTER', name: 'Outer Bottom-Left', adjacents: [5, 7] },
  { id: 7, x: 60, y: 300, ring: 'OUTER', name: 'Outer Left-Mid', adjacents: [6, 0, 15] },

  // Middle Ring (8-15)
  { id: 8, x: 140, y: 140, ring: 'MIDDLE', name: 'Middle Top-Left', adjacents: [9, 15] },
  { id: 9, x: 300, y: 140, ring: 'MIDDLE', name: 'Middle Top-Mid', adjacents: [8, 10, 1, 17] },
  { id: 10, x: 460, y: 140, ring: 'MIDDLE', name: 'Middle Top-Right', adjacents: [9, 11] },
  { id: 11, x: 460, y: 300, ring: 'MIDDLE', name: 'Middle Right-Mid', adjacents: [10, 12, 3, 19] },
  { id: 12, x: 460, y: 460, ring: 'MIDDLE', name: 'Middle Bottom-Right', adjacents: [11, 13] },
  { id: 13, x: 300, y: 460, ring: 'MIDDLE', name: 'Middle Bottom-Mid', adjacents: [12, 14, 5, 21] },
  { id: 14, x: 140, y: 460, ring: 'MIDDLE', name: 'Middle Bottom-Left', adjacents: [13, 15] },
  { id: 15, x: 140, y: 300, ring: 'MIDDLE', name: 'Middle Left-Mid', adjacents: [14, 8, 7, 23] },

  // Inner Ring (16-23)
  { id: 16, x: 220, y: 220, ring: 'INNER', name: 'Inner Top-Left', adjacents: [17, 23] },
  { id: 17, x: 300, y: 220, ring: 'INNER', name: 'Inner Top-Mid', adjacents: [16, 18, 9] },
  { id: 18, x: 380, y: 220, ring: 'INNER', name: 'Inner Top-Right', adjacents: [17, 19] },
  { id: 19, x: 380, y: 300, ring: 'INNER', name: 'Inner Right-Mid', adjacents: [18, 20, 11] },
  { id: 20, x: 380, y: 380, ring: 'INNER', name: 'Inner Bottom-Right', adjacents: [19, 21] },
  { id: 21, x: 300, y: 380, ring: 'INNER', name: 'Inner Bottom-Mid', adjacents: [20, 22, 13] },
  { id: 22, x: 220, y: 380, ring: 'INNER', name: 'Inner Bottom-Left', adjacents: [21, 23] },
  { id: 23, x: 220, y: 300, ring: 'INNER', name: 'Inner Left-Mid', adjacents: [22, 16, 15] },
];

export const ALL_MILLS: [number, number, number][] = [
  // Outer Ring Mills
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],

  // Middle Ring Mills
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],

  // Inner Ring Mills
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],

  // Cross-ring Radial Mills
  [1, 9, 17],
  [3, 11, 19],
  [5, 13, 21],
  [7, 15, 23],
];

// Helper mapping: which mills contain node i?
export const NODE_MILLS: number[][] = Array.from({ length: 24 }, (_, i) => {
  const matchingIndices: number[] = [];
  ALL_MILLS.forEach((mill, millIdx) => {
    if (mill.includes(i)) {
      matchingIndices.push(millIdx);
    }
  });
  return matchingIndices;
});

// Board line segments for rendering the board graphics
export const BOARD_SQUARE_SEGMENTS = [
  // Outer square
  { x1: 60, y1: 60, x2: 540, y2: 60 },
  { x1: 540, y1: 60, x2: 540, y2: 540 },
  { x1: 540, y1: 540, x2: 60, y2: 540 },
  { x1: 60, y1: 540, x2: 60, y2: 60 },

  // Middle square
  { x1: 140, y1: 140, x2: 460, y2: 140 },
  { x1: 460, y1: 140, x2: 460, y2: 460 },
  { x1: 460, y1: 460, x2: 140, y2: 460 },
  { x1: 140, y1: 460, x2: 140, y2: 140 },

  // Inner square
  { x1: 220, y1: 220, x2: 380, y2: 220 },
  { x1: 380, y1: 220, x2: 380, y2: 380 },
  { x1: 380, y1: 380, x2: 220, y2: 380 },
  { x1: 220, y1: 380, x2: 220, y2: 220 },

  // Midpoint radial connecting lines (NO DIAGONALS)
  { x1: 300, y1: 60, x2: 300, y2: 220 }, // Top
  { x1: 540, y1: 300, x2: 380, y2: 300 }, // Right
  { x1: 300, y1: 540, x2: 300, y2: 380 }, // Bottom
  { x1: 60, y1: 300, x2: 220, y2: 300 }, // Left
];

export const TOTAL_PIECES_PER_PLAYER = 9;
