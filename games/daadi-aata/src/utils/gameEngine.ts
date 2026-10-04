import { BoardState, Player } from '../types';
import { ALL_MILLS, BOARD_NODES, NODE_MILLS } from './gameConstants';

/**
 * Checks if a specific node is part of an active 3-in-a-row mill for the given player.
 */
export function isNodeInMill(board: BoardState, player: Player, nodeIndex: number): boolean {
  if (board[nodeIndex] !== player) return false;
  const millIndices = NODE_MILLS[nodeIndex];
  for (const mIdx of millIndices) {
    const [a, b, c] = ALL_MILLS[mIdx];
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if placing/moving a piece to `nodeIndex` forms at least one NEW mill
 */
export function formsNewMill(board: BoardState, player: Player, nodeIndex: number): boolean {
  // Check all mills that include this node
  const millIndices = NODE_MILLS[nodeIndex];
  for (const mIdx of millIndices) {
    const [a, b, c] = ALL_MILLS[mIdx];
    // In the current board, is the mill complete with `player`?
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

/**
 * Returns all active 3-in-a-row mill arrays currently on the board for a player or both.
 */
export function getActiveMills(board: BoardState, player?: Player): [number, number, number][] {
  const result: [number, number, number][] = [];
  for (const mill of ALL_MILLS) {
    const [a, b, c] = mill;
    const owner = board[a];
    if (owner !== null && board[b] === owner && board[c] === owner) {
      if (!player || owner === player) {
        result.push(mill);
      }
    }
  }
  return result;
}

/**
 * Standard rule for captures:
 * A player must choose an opponent's piece that is NOT currently part of an active mill.
 * HOWEVER, if ALL opponent pieces on the board are currently part of mills,
 * any opponent piece may be captured.
 */
export function getValidCaptureTargets(board: BoardState, opponent: Player): number[] {
  const opponentNodes: number[] = [];
  const nonMillTargets: number[] = [];

  for (let i = 0; i < 24; i++) {
    if (board[i] === opponent) {
      opponentNodes.push(i);
      if (!isNodeInMill(board, opponent, i)) {
        nonMillTargets.push(i);
      }
    }
  }

  // If there are pieces not in a mill, only those can be captured
  if (nonMillTargets.length > 0) {
    return nonMillTargets;
  }

  // Otherwise, all opponent pieces are in mills, so any opponent piece is capturable
  return opponentNodes;
}

/**
 * Returns empty nodes for placement phase.
 */
export function getLegalPlacements(board: BoardState): number[] {
  const empty: number[] = [];
  for (let i = 0; i < 24; i++) {
    if (board[i] === null) {
      empty.push(i);
    }
  }
  return empty;
}

/**
 * Returns legal destinations for moving a piece from `fromNode`.
 */
export function getLegalMovesForPiece(
  board: BoardState,
  fromNode: number,
  isFlying: boolean
): number[] {
  if (fromNode < 0 || fromNode >= 24) return [];
  if (board[fromNode] === null) return [];

  if (isFlying) {
    // Can fly to any empty node
    return getLegalPlacements(board);
  }

  const adjacent = BOARD_NODES[fromNode].adjacents;
  return adjacent.filter((adjNode) => board[adjNode] === null);
}

/**
 * Returns all valid moves `{ from: number, to: number }` for a player in movement phase.
 */
export function getAllLegalMoves(
  board: BoardState,
  player: Player,
  isFlying: boolean
): { from: number; to: number }[] {
  const moves: { from: number; to: number }[] = [];

  for (let i = 0; i < 24; i++) {
    if (board[i] === player) {
      const destinations = getLegalMovesForPiece(board, i, isFlying);
      for (const dest of destinations) {
        moves.push({ from: i, to: dest });
      }
    }
  }

  return moves;
}

/**
 * Counts pieces on board for a player.
 */
export function countPiecesOnBoard(board: BoardState, player: Player): number {
  let count = 0;
  for (let i = 0; i < 24; i++) {
    if (board[i] === player) count++;
  }
  return count;
}

/**
 * Checks if a player has lost the game.
 * Conditions:
 * 1. Placement phase is done AND player has fewer than 3 pieces remaining on board.
 * 2. Placement phase is done AND player has NO legal moves available on their turn.
 */
export function evaluateGameWinner(
  board: BoardState,
  p1Hand: number,
  p2Hand: number,
  activePlayer: Player,
  flyingRuleEnabled: boolean
): { winner: Player | null; reason: string | null } {
  // If still in placement phase, no one has won yet based on count < 3
  if (p1Hand > 0 || p2Hand > 0) {
    return { winner: null, reason: null };
  }

  const p1BoardCount = countPiecesOnBoard(board, 'P1');
  const p2BoardCount = countPiecesOnBoard(board, 'P2');

  // Condition 1: Less than 3 pieces
  if (p1BoardCount < 3) {
    return { winner: 'P2', reason: 'Player 1 has fewer than 3 pieces left' };
  }
  if (p2BoardCount < 3) {
    return { winner: 'P1', reason: 'Player 2 has fewer than 3 pieces left' };
  }

  // Condition 2: Active player has no legal moves
  const isP1Flying = flyingRuleEnabled && p1BoardCount === 3;
  const isP2Flying = flyingRuleEnabled && p2BoardCount === 3;

  if (activePlayer === 'P1') {
    const p1Moves = getAllLegalMoves(board, 'P1', isP1Flying);
    if (p1Moves.length === 0) {
      return { winner: 'P2', reason: 'Player 1 has no legal moves remaining' };
    }
  } else {
    const p2Moves = getAllLegalMoves(board, 'P2', isP2Flying);
    if (p2Moves.length === 0) {
      return { winner: 'P1', reason: 'Player 2 has no legal moves remaining' };
    }
  }

  return { winner: null, reason: null };
}
