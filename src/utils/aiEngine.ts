import { AIDifficulty, BoardState, Player } from '../types';
import { ALL_MILLS, BOARD_NODES } from './gameConstants';
import {
  countPiecesOnBoard,
  formsNewMill,
  getAllLegalMoves,
  getLegalPlacements,
  getValidCaptureTargets,
} from './gameEngine';

export interface AIMoveResult {
  action: 'PLACE' | 'MOVE';
  placementNode?: number;
  fromNode?: number;
  toNode?: number;
  captureNode?: number;
}

/**
 * Evaluates board state from perspective of AI (P2) vs Human (P1).
 */
export function evaluateBoardForAI(
  board: BoardState,
  p1Hand: number,
  p2Hand: number,
  flyingRule: boolean
): number {
  const p1Board = countPiecesOnBoard(board, 'P1');
  const p2Board = countPiecesOnBoard(board, 'P2');

  // If in movement phase and opponent has < 3 pieces
  if (p1Hand === 0 && p2Hand === 0) {
    if (p1Board < 3) return 10000;
    if (p2Board < 3) return -10000;
  }

  // 1. Material score (piece difference)
  const pieceDiff = (p2Board + p2Hand) - (p1Board + p1Hand);
  let score = pieceDiff * 100;

  // 2. Active Mills count
  let p1Mills = 0;
  let p2Mills = 0;
  let p1PotentialMills = 0;
  let p2PotentialMills = 0;

  for (const [a, b, c] of ALL_MILLS) {
    const nodes = [board[a], board[b], board[c]];
    const p1Count = nodes.filter((n) => n === 'P1').length;
    const p2Count = nodes.filter((n) => n === 'P2').length;
    const emptyCount = nodes.filter((n) => n === null).length;

    if (p2Count === 3) p2Mills++;
    else if (p1Count === 3) p1Mills++;
    else if (p2Count === 2 && emptyCount === 1) p2PotentialMills++;
    else if (p1Count === 2 && emptyCount === 1) p1PotentialMills++;
  }

  score += (p2Mills - p1Mills) * 60;
  score += (p2PotentialMills - p1PotentialMills) * 25;

  // 3. Mobility (blocked pieces) in movement phase
  if (p1Hand === 0 && p2Hand === 0) {
    const isP1Flying = flyingRule && p1Board === 3;
    const isP2Flying = flyingRule && p2Board === 3;
    const p2Moves = getAllLegalMoves(board, 'P2', isP2Flying).length;
    const p1Moves = getAllLegalMoves(board, 'P1', isP1Flying).length;

    if (p1Moves === 0) return 9000; // P1 is trapped
    if (p2Moves === 0) return -9000; // P2 is trapped

    score += (p2Moves - p1Moves) * 10;
  }

  // 4. Center/Midpoint intersection control (nodes with 4 connections: 9, 11, 13, 15, 1, 3, 5, 7)
  const strategicNodes = [9, 11, 13, 15, 1, 3, 5, 7];
  for (const sNode of strategicNodes) {
    if (board[sNode] === 'P2') score += 5;
    else if (board[sNode] === 'P1') score -= 5;
  }

  return score;
}

/**
 * Best target to capture from opponent
 */
export function selectBestCaptureTarget(
  board: BoardState,
  opponent: Player,
  difficulty: AIDifficulty
): number {
  const validTargets = getValidCaptureTargets(board, opponent);
  if (validTargets.length === 0) return -1;
  if (validTargets.length === 1 || difficulty === 'EASY') {
    return validTargets[Math.floor(Math.random() * validTargets.length)];
  }

  // Tactical selection: target opponent piece that is closest to forming a mill
  let bestTarget = validTargets[0];
  let highestThreat = -1;

  for (const target of validTargets) {
    let threat = 0;
    // Check if removing this piece breaks an opponent's 2-piece potential mill
    for (const [a, b, c] of ALL_MILLS) {
      if (a === target || b === target || c === target) {
        const others = [a, b, c].filter((n) => n !== target);
        if (board[others[0]] === opponent && board[others[1]] === opponent) {
          threat += 50; // High threat
        } else if (board[others[0]] === opponent || board[others[1]] === opponent) {
          threat += 10;
        }
      }
    }

    // Number of adjacents (mobility piece)
    threat += BOARD_NODES[target].adjacents.length * 2;

    if (threat > highestThreat) {
      highestThreat = threat;
      bestTarget = target;
    }
  }

  return bestTarget;
}

/**
 * Chooses the best Placement move for Kreedu (P2).
 */
export function getAIPlacementMove(
  board: BoardState,
  p1Hand: number,
  p2Hand: number,
  difficulty: AIDifficulty
): { placementNode: number; captureNode?: number } {
  const emptyNodes = getLegalPlacements(board);
  if (emptyNodes.length === 0) return { placementNode: -1 };

  if (difficulty === 'EASY') {
    // 35% chance random, 65% chance check immediate mill or block
    if (Math.random() < 0.35) {
      const randomNode = emptyNodes[Math.floor(Math.random() * emptyNodes.length)];
      return { placementNode: randomNode };
    }
  }

  // 1. Immediate Win: Check if any placement completes a mill for P2
  for (const node of emptyNodes) {
    const tempBoard = [...board];
    tempBoard[node] = 'P2';
    if (formsNewMill(tempBoard, 'P2', node)) {
      const cap = selectBestCaptureTarget(tempBoard, 'P1', difficulty);
      return { placementNode: node, captureNode: cap !== -1 ? cap : undefined };
    }
  }

  // 2. Immediate Block: Check if P1 can form a mill on next turn, and block them!
  for (const node of emptyNodes) {
    const tempBoard = [...board];
    tempBoard[node] = 'P1';
    if (formsNewMill(tempBoard, 'P1', node)) {
      return { placementNode: node };
    }
  }

  // 3. Strategic Placement based on 1-ply evaluation + center positioning
  let bestScore = -Infinity;
  let bestNode = emptyNodes[0];

  for (const node of emptyNodes) {
    const tempBoard = [...board];
    tempBoard[node] = 'P2';
    let score = evaluateBoardForAI(tempBoard, p1Hand, p2Hand - 1, false);

    // Give slight bonus for intersections with more adjacent connections
    score += BOARD_NODES[node].adjacents.length * 4;

    // Give slight noise in Medium mode
    if (difficulty === 'MEDIUM') {
      score += (Math.random() - 0.5) * 10;
    }

    if (score > bestScore) {
      bestScore = score;
      bestNode = node;
    }
  }

  return { placementNode: bestNode };
}

/**
 * Minimax with Alpha-Beta Pruning for Movement Phase
 */
function minimaxMove(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  flyingRule: boolean
): number {
  const p1Board = countPiecesOnBoard(board, 'P1');
  const p2Board = countPiecesOnBoard(board, 'P2');

  if (p1Board < 3) return 10000;
  if (p2Board < 3) return -10000;
  if (depth === 0) {
    return evaluateBoardForAI(board, 0, 0, flyingRule);
  }

  const isP1Flying = flyingRule && p1Board === 3;
  const isP2Flying = flyingRule && p2Board === 3;

  if (isMaximizing) {
    // P2's turn
    let maxEval = -Infinity;
    const moves = getAllLegalMoves(board, 'P2', isP2Flying);
    if (moves.length === 0) return -9000; // P2 trapped

    for (const move of moves) {
      const tempBoard = [...board];
      tempBoard[move.from] = null;
      tempBoard[move.to] = 'P2';

      let formedMill = formsNewMill(tempBoard, 'P2', move.to);
      let nextBoard = tempBoard;

      if (formedMill) {
        const cap = selectBestCaptureTarget(tempBoard, 'P1', 'HARD');
        if (cap !== -1) {
          nextBoard = [...tempBoard];
          nextBoard[cap] = null;
        }
      }

      const evaluation = minimaxMove(nextBoard, depth - 1, false, alpha, beta, flyingRule);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    // P1's turn
    let minEval = Infinity;
    const moves = getAllLegalMoves(board, 'P1', isP1Flying);
    if (moves.length === 0) return 9000; // P1 trapped

    for (const move of moves) {
      const tempBoard = [...board];
      tempBoard[move.from] = null;
      tempBoard[move.to] = 'P1';

      let formedMill = formsNewMill(tempBoard, 'P1', move.to);
      let nextBoard = tempBoard;

      if (formedMill) {
        const cap = selectBestCaptureTarget(tempBoard, 'P2', 'HARD');
        if (cap !== -1) {
          nextBoard = [...tempBoard];
          nextBoard[cap] = null;
        }
      }

      const evaluation = minimaxMove(nextBoard, depth - 1, true, alpha, beta, flyingRule);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Chooses the best Movement move for Kreedu (P2).
 */
export function getAIMovementMove(
  board: BoardState,
  difficulty: AIDifficulty,
  flyingRule: boolean
): { fromNode: number; toNode: number; captureNode?: number } {
  const p2BoardCount = countPiecesOnBoard(board, 'P2');
  const isFlying = flyingRule && p2BoardCount === 3;
  const legalMoves = getAllLegalMoves(board, 'P2', isFlying);

  if (legalMoves.length === 0) {
    return { fromNode: -1, toNode: -1 };
  }

  if (difficulty === 'EASY') {
    // 40% random move
    if (Math.random() < 0.4) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      const tempBoard = [...board];
      tempBoard[randomMove.from] = null;
      tempBoard[randomMove.to] = 'P2';
      let cap: number | undefined = undefined;
      if (formsNewMill(tempBoard, 'P2', randomMove.to)) {
        const c = selectBestCaptureTarget(tempBoard, 'P1', 'EASY');
        if (c !== -1) cap = c;
      }
      return { fromNode: randomMove.from, toNode: randomMove.to, captureNode: cap };
    }
  }

  // 1. Direct check: can any move immediately complete a mill for P2?
  for (const move of legalMoves) {
    const tempBoard = [...board];
    tempBoard[move.from] = null;
    tempBoard[move.to] = 'P2';
    if (formsNewMill(tempBoard, 'P2', move.to)) {
      const cap = selectBestCaptureTarget(tempBoard, 'P1', difficulty);
      return {
        fromNode: move.from,
        toNode: move.to,
        captureNode: cap !== -1 ? cap : undefined,
      };
    }
  }

  // 2. Direct check: can P1 form a mill on their next turn? If so, prioritize blocking or removing
  const p1BoardCount = countPiecesOnBoard(board, 'P1');
  const isP1Flying = flyingRule && p1BoardCount === 3;
  const p1Moves = getAllLegalMoves(board, 'P1', isP1Flying);
  const threateningDestinations = new Set<number>();
  for (const p1M of p1Moves) {
    const temp = [...board];
    temp[p1M.from] = null;
    temp[p1M.to] = 'P1';
    if (formsNewMill(temp, 'P1', p1M.to)) {
      threateningDestinations.add(p1M.to);
    }
  }

  // If a P2 move can occupy that threatening destination, do it!
  if (difficulty !== 'EASY') {
    for (const move of legalMoves) {
      if (threateningDestinations.has(move.to)) {
        return { fromNode: move.from, toNode: move.to };
      }
    }
  }

  // 3. Minimax evaluation
  const searchDepth = difficulty === 'HARD' ? 3 : 2;
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];

  for (const move of legalMoves) {
    const tempBoard = [...board];
    tempBoard[move.from] = null;
    tempBoard[move.to] = 'P2';

    let formedMill = formsNewMill(tempBoard, 'P2', move.to);
    let nextBoard = tempBoard;
    let capNode: number | undefined = undefined;

    if (formedMill) {
      const cap = selectBestCaptureTarget(tempBoard, 'P1', difficulty);
      if (cap !== -1) {
        nextBoard = [...tempBoard];
        nextBoard[cap] = null;
        capNode = cap;
      }
    }

    let score = minimaxMove(nextBoard, searchDepth - 1, false, -Infinity, Infinity, flyingRule);

    if (difficulty === 'MEDIUM') {
      score += (Math.random() - 0.5) * 8;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  // If the chosen best move creates a mill, compute the capture
  const finalTempBoard = [...board];
  finalTempBoard[bestMove.from] = null;
  finalTempBoard[bestMove.to] = 'P2';
  let finalCap: number | undefined = undefined;
  if (formsNewMill(finalTempBoard, 'P2', bestMove.to)) {
    const c = selectBestCaptureTarget(finalTempBoard, 'P1', difficulty);
    if (c !== -1) finalCap = c;
  }

  return { fromNode: bestMove.from, toNode: bestMove.to, captureNode: finalCap };
}
