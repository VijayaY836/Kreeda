export type Side = 'PULI' | 'MEKA';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type Winner = Side | 'DRAW' | null;



export interface NodePosition {

  x: number;

  y: number;

}



export interface Piece {

  type: Side;

  id: string;

}



export interface Variant {

  id: 'puli_meka' | 'bagh_chal';

  name: string;

  tagline: string;

  blurb: string;

  boardType: 'puli_meka' | 'bagh_chal';

  tigerCount: number;

  goatCount: number;

  tigerCaptureWinCount: number;

  tigerStart: number[];

  tigerLabel: string;

  goatLabel: string;

  rules: string[];

}



export interface BoardDefinition {

  nodes: Record<number, NodePosition>;

  lines: number[][];

  adj: Record<number, Set<number>>;

  captures: Record<string, number>;

}



export interface GameState {

  variant: Variant;

  humanSide: Side;

  KreeduSide: Side;

  difficulty: Difficulty;

  currentPlayer: Side;

  phase: 'PLACEMENT' | 'MOVEMENT';

  board: Record<number, Piece | null>;

  goatsRemainingToPlace: number;

  goatsCaptured: number;

  tigersCornered: number;

  selectedPiece: number | null;

  winner: Winner;

  gameOver: boolean;

  isKreeduThinking: boolean;

  lastMove: { from?: number; to: number; captured?: number } | null;

  positionHistory: string[];

}



export type AIAction =

  | { kind: 'place'; to: number }

  | { kind: 'move'; from: number; to: number }

  | { kind: 'capture'; from: number; over: number; to: number };



const PULI_NODES: Record<number, NodePosition> = {

  0: { x: 49.5, y: 6.8 },

  1: { x: 4.7, y: 38.2 }, 2: { x: 32.8, y: 38.2 }, 3: { x: 43.3, y: 38.2 },

  4: { x: 55.4, y: 38.2 }, 5: { x: 66.1, y: 38.2 }, 6: { x: 94.4, y: 38.2 },

  7: { x: 4.5, y: 52.6 }, 8: { x: 25, y: 52.6 }, 9: { x: 40.4, y: 52.6 },

  10: { x: 58.2, y: 52.6 }, 11: { x: 73.9, y: 52.6 }, 12: { x: 94.8, y: 52.6 },

  13: { x: 4.3, y: 66.6 }, 14: { x: 17.5, y: 66.6 }, 15: { x: 37.7, y: 66.6 },

  16: { x: 61, y: 66.6 }, 17: { x: 81.5, y: 66.6 }, 18: { x: 94.4, y: 66.6 },

  19: { x: 3.6, y: 92.5 }, 20: { x: 32.5, y: 92.5 }, 21: { x: 66, y: 92.5 }, 22: { x: 95.5, y: 92.5 },

};



const PULI_LINES = [

  [0, 2, 8, 14, 19], [0, 3, 9, 15, 20], [0, 4, 10, 16, 21], [0, 5, 11, 17, 22],

  [1, 7, 13], [6, 12, 18], [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12],

  [13, 14, 15, 16, 17, 18], [19, 20, 21, 22],

];



const BAGH_NODES: Record<number, NodePosition> = {};

for (let row = 0; row < 5; row += 1) {

  for (let column = 0; column < 5; column += 1) {

    BAGH_NODES[row * 5 + column] = { x: 10 + column * 20, y: 10 + row * 20 };

  }

}



const BAGH_LINES = (() => {

  const lines: number[][] = [];

  for (let row = 0; row < 5; row += 1) lines.push(Array.from({ length: 5 }, (_, column) => row * 5 + column));

  for (let column = 0; column < 5; column += 1) lines.push(Array.from({ length: 5 }, (_, row) => row * 5 + column));

  for (let offset = -3; offset <= 3; offset += 1) {

    const line: number[] = [];

    for (let row = 0; row < 5; row += 1) {

      const column = row - offset;

      if (column >= 0 && column < 5) line.push(row * 5 + column);

    }

    if (line.length >= 2) lines.push(line);

  }

  for (let offset = 1; offset <= 7; offset += 1) {

    const line: number[] = [];

    for (let row = 0; row < 5; row += 1) {

      const column = offset - row;

      if (column >= 0 && column < 5) line.push(row * 5 + column);

    }

    if (line.length >= 2) lines.push(line);

  }

  return lines;

})();



function buildGraph(nodes: Record<number, NodePosition>, lines: number[][]): BoardDefinition {

  const adj: Record<number, Set<number>> = {};

  const captures: Record<string, number> = {};

  Object.keys(nodes).forEach((id) => { adj[Number(id)] = new Set<number>(); });

  lines.forEach((line) => {

    for (let index = 0; index < line.length - 1; index += 1) {

      adj[line[index]].add(line[index + 1]);

      adj[line[index + 1]].add(line[index]);

    }

    for (let index = 0; index < line.length - 2; index += 1) {

      const a = line[index];

      const b = line[index + 1];

      const c = line[index + 2];

      captures[`${a}-${b}`] = c;

      captures[`${c}-${b}`] = a;

    }

  });

  return { nodes, lines, adj, captures };

}



export const BOARD_DEFS: Record<'puli_meka' | 'bagh_chal', BoardDefinition> = {

  puli_meka: buildGraph(PULI_NODES, PULI_LINES),

  bagh_chal: buildGraph(BAGH_NODES, BAGH_LINES),

};



export const VARIANTS: Record<Variant['id'], Variant> = {

  puli_meka: {

    id: 'puli_meka', name: 'Puli Meka', tagline: 'Traditional Tiger & Goat game',

    blurb: '3 Puli. 15 Meka. One battle of strategy.', boardType: 'puli_meka',

    tigerCount: 3, goatCount: 15, tigerCaptureWinCount: 15, tigerStart: [0, 3, 4],

    tigerLabel: 'PULI', goatLabel: 'MEKA',

    rules: [

      'Puli start at the apex and the two points flanking it just below; Meka begin off-board.',

      'Meka place one at a time on any empty point.',

      'Puli may move and capture while Meka are still being placed.',

      'A Puli captures by jumping a Meka in a straight line onto an empty point beyond it.',

      'Once all 15 Meka are placed, Meka may move one step along a connected line.',

      'Puli win by capturing all 15 Meka. Meka win by cornering all 3 Puli.',

    ],

  },

  bagh_chal: {

    id: 'bagh_chal', name: 'Bagh-Chal', tagline: 'Traditional Nepali board game',

    blurb: '4 Tigers. 20 Goats. One battle of wits.', boardType: 'bagh_chal',

    tigerCount: 4, goatCount: 20, tigerCaptureWinCount: 5, tigerStart: [0, 4, 20, 24],

    tigerLabel: 'TIGERS', goatLabel: 'GOATS',

    rules: [

      '4 Tigers start at the four corners of a 5x5 grid; 20 Goats begin off-board.',

      'Goats place one at a time on any empty intersection.',

      'Tigers may move and capture during the Goat placement phase.',

      'Existing Goats cannot move until all 20 have been placed.',

      'A Tiger captures by jumping a Goat in a straight line onto an empty point beyond it.',

      'Tigers win by capturing 5 Goats. Goats win by blocking all 4 Tigers completely.',

    ],

  },

};



export const GameEngine = {

  newState(variantId: Variant['id'], humanSide: Side, difficulty: Difficulty): GameState {

    const variant = VARIANTS[variantId];

    const board: Record<number, Piece | null> = {};

    Object.keys(BOARD_DEFS[variant.boardType].nodes).forEach((id) => { board[Number(id)] = null; });

    variant.tigerStart.forEach((node, index) => { board[node] = { type: 'PULI', id: `T${index + 1}` }; });

    return {

      variant, humanSide, KreeduSide: humanSide === 'PULI' ? 'MEKA' : 'PULI', difficulty,

      currentPlayer: 'MEKA', phase: 'PLACEMENT', board, goatsRemainingToPlace: variant.goatCount,

      goatsCaptured: 0, tigersCornered: 0, selectedPiece: null, winner: null, gameOver: false,

      isKreeduThinking: false, lastMove: null, positionHistory: [],

    };

  },

  boardDef(state: GameState) { return BOARD_DEFS[state.variant.boardType]; },

  neighbors(state: GameState, node: number) { return Array.from(this.boardDef(state).adj[node] || []); },

  allTigerNodes(state: GameState) { return Object.keys(state.board).map(Number).filter((node) => state.board[node]?.type === 'PULI'); },

  allGoatNodes(state: GameState) { return Object.keys(state.board).map(Number).filter((node) => state.board[node]?.type === 'MEKA'); },

  tigerMoves(state: GameState, node: number) {

    const moves: number[] = [];

    const captures: { over: number; to: number }[] = [];

    this.neighbors(state, node).forEach((neighbor) => {

      const piece = state.board[neighbor];

      if (!piece) moves.push(neighbor);

      else if (piece.type === 'MEKA') {

        const landing = this.boardDef(state).captures[`${node}-${neighbor}`];

        if (landing !== undefined && !state.board[landing]) captures.push({ over: neighbor, to: landing });

      }

    });

    return { moves, captures };

  },

  goatMoves(state: GameState, node: number) { return this.neighbors(state, node).filter((neighbor) => !state.board[neighbor]); },

  isTigerCornered(state: GameState, node: number) { const result = this.tigerMoves(state, node); return result.moves.length === 0 && result.captures.length === 0; },

  calculateCounters(state: GameState) { state.tigersCornered = this.allTigerNodes(state).filter((node) => this.isTigerCornered(state, node)).length; },

  checkWinner(state: GameState): Winner {

    if (state.goatsCaptured >= state.variant.tigerCaptureWinCount) return 'PULI';

    if (state.tigersCornered >= state.variant.tigerCount) return 'MEKA';

    return null;

  },

  positionHash(state: GameState) {

    let hash = `${state.currentPlayer[0]}|`;

    Object.keys(this.boardDef(state).nodes).forEach((id) => { const piece = state.board[Number(id)]; hash += piece ? (piece.type === 'PULI' ? 'T' : 'G') : '.'; });

    return hash;

  },

  afterMove(state: GameState) {

    this.calculateCounters(state);

    state.winner = this.checkWinner(state);

    if (!state.winner) {

      state.currentPlayer = state.currentPlayer === 'MEKA' ? 'PULI' : 'MEKA';

      const hash = this.positionHash(state);

      state.positionHistory.push(hash);

      if (state.positionHistory.filter((item) => item === hash).length >= 3) state.winner = 'DRAW';

    }

    state.gameOver = Boolean(state.winner);

    state.selectedPiece = null;

  },

  placeGoat(state: GameState, node: number) {

    state.board[node] = { type: 'MEKA', id: `G${state.variant.goatCount - state.goatsRemainingToPlace + 1}` };

    state.goatsRemainingToPlace -= 1;

    if (state.goatsRemainingToPlace === 0) state.phase = 'MOVEMENT';

    state.lastMove = { to: node };

    this.afterMove(state);

  },

  moveGoat(state: GameState, from: number, to: number) { state.board[to] = state.board[from]; state.board[from] = null; state.lastMove = { from, to }; this.afterMove(state); },

  moveTiger(state: GameState, from: number, to: number, captureOver?: number) {

    state.board[to] = state.board[from]; state.board[from] = null;

    if (captureOver !== undefined) { state.board[captureOver] = null; state.goatsCaptured += 1; }

    state.lastMove = { from, to, captured: captureOver }; this.afterMove(state);

  },

};



export function cloneState(state: GameState): GameState { return JSON.parse(JSON.stringify(state)) as GameState; }



export function legalAIActions(state: GameState): AIAction[] {

  if (state.currentPlayer === 'MEKA' && state.phase === 'PLACEMENT') return Object.keys(state.board).map(Number).filter((node) => !state.board[node]).map((to) => ({ kind: 'place', to }));

  if (state.currentPlayer === 'MEKA') return GameEngine.allGoatNodes(state).flatMap((from) => GameEngine.goatMoves(state, from).map((to) => ({ kind: 'move', from, to })));

  return GameEngine.allTigerNodes(state).flatMap((from) => {

    const moves = GameEngine.tigerMoves(state, from);

    return [...moves.captures.map(({ over, to }) => ({ kind: 'capture' as const, from, over, to })), ...moves.moves.map((to) => ({ kind: 'move' as const, from, to }))];

  });

}



export function randomAIAction(state: GameState): AIAction | null {

  if (state.currentPlayer === 'MEKA') {

    if (state.phase === 'PLACEMENT') {

      const emptyNodes = Object.keys(state.board).map(Number).filter((node) => !state.board[node]);

      if (!emptyNodes.length) return null;

      return { kind: 'place', to: emptyNodes[Math.floor(Math.random() * emptyNodes.length)] };

    }

    const movableGoats = GameEngine.allGoatNodes(state).filter((node) => GameEngine.goatMoves(state, node).length > 0);

    if (!movableGoats.length) return null;

    const from = movableGoats[Math.floor(Math.random() * movableGoats.length)];

    const destinations = GameEngine.goatMoves(state, from);

    return { kind: 'move', from, to: destinations[Math.floor(Math.random() * destinations.length)] };

  }

  const actions = legalAIActions(state);

  const captureActions = actions.filter((action) => action.kind === 'capture');

  if (state.currentPlayer === 'PULI' && captureActions.length) {

    return captureActions[Math.floor(Math.random() * captureActions.length)];

  }

  return actions.length ? actions[Math.floor(Math.random() * actions.length)] : null;

}



export function applyAIAction(state: GameState, action: AIAction) {

  if (action.kind === 'place') GameEngine.placeGoat(state, action.to);

  else if (action.kind === 'capture') GameEngine.moveTiger(state, action.from, action.to, action.over);

  else if (state.board[action.from]?.type === 'PULI') GameEngine.moveTiger(state, action.from, action.to);

  else GameEngine.moveGoat(state, action.from, action.to);

}



/* =====================================================================

   AI SEARCH

   Ported from the working HTML build (KreeduAI): the previous version of

   this file reset alpha/beta to +/-Infinity for every root move (losing

   almost all pruning across sibling moves), had no transposition table

   (re-evaluating identical positions from scratch), and checked

   Date.now() on every single recursive call while deep-cloning the whole

   state via JSON on every node. Those three problems combined starved

   the search of its time budget and produced weak/inconsistent play.

   This version fixes all three: alpha/beta now persist across root

   siblings, a per-depth transposition table (keyed on board+turn+phase+

   goats-remaining+depth) avoids re-work, the deadline is checked only

   every 512 nodes via a counter, and cloning for search uses a cheap

   shallow copy of the board map instead of a full JSON round-trip.

===================================================================== */



// Thrown to unwind the recursion the instant the time budget is spent,

// rather than only checking between root moves.

const TIME_UP = Symbol('kreedu-ai-time-up');



const nodeOrderCache: Partial<Record<Variant['boardType'], number[]>> = {};

function nodeOrder(state: GameState): number[] {

  const key = state.variant.boardType;

  if (!nodeOrderCache[key]) nodeOrderCache[key] = Object.keys(BOARD_DEFS[key].nodes).map(Number);

  return nodeOrderCache[key] as number[];

}



// A compact key for (board layout + whose turn + phase + goats left);

// combined with remaining search depth this is the transposition-table

// key, so the same position reached by different move orders at the

// same depth is only ever evaluated once.

function hashState(state: GameState): string {

  let hash = `${state.currentPlayer[0]}${state.phase[0]}${state.goatsRemainingToPlace}|`;

  const order = nodeOrder(state);

  for (let index = 0; index < order.length; index += 1) {

    const piece = state.board[order[index]];

    hash += piece ? (piece.type === 'PULI' ? 'T' : 'G') : '.';

  }

  return hash;

}



function evaluate(state: GameState): number {

  const captureWeight = 100 / state.variant.tigerCaptureWinCount;

  const cornerWeight = 100 / state.variant.tigerCount;

  let score = state.goatsCaptured * captureWeight - state.tigersCornered * cornerWeight;

  GameEngine.allTigerNodes(state).forEach((node) => {

    const moves = GameEngine.tigerMoves(state, node);

    score += (moves.moves.length + moves.captures.length * 2) * 1.5;

  });

  return score;

}



// Lightweight clone used only inside the search: GameEngine never

// mutates a piece object in place (moves always reassign board[id]),

// so a shallow copy of the board map is safe here and far cheaper than

// a full JSON.parse(JSON.stringify(...)) clone across thousands of

// search nodes. cloneState() above is left untouched for external use

// (e.g. undo/redo, saving state) where a true deep clone is wanted.

function cloneForSearch(state: GameState): GameState {

  return {

    variant: state.variant,

    humanSide: state.humanSide,

    KreeduSide: state.KreeduSide,

    difficulty: state.difficulty,

    currentPlayer: state.currentPlayer,

    phase: state.phase,

    board: { ...state.board },

    goatsRemainingToPlace: state.goatsRemainingToPlace,

    goatsCaptured: state.goatsCaptured,

    tigersCornered: state.tigersCornered,

    selectedPiece: null,

    winner: null,

    gameOver: false,

    isKreeduThinking: false,

    lastMove: null,

    // Copied (not shared) so the AI's own lookahead can detect

    // repetition draws several moves deep without ever writing back

    // into the real game's history.

    positionHistory: state.positionHistory.slice(),

  };

}



function simulate(state: GameState, action: AIAction): GameState {

  const next = cloneForSearch(state);

  applyAIAction(next, action);

  return next;

}



function terminalScore(state: GameState, depthRemaining: number): number {

  const BIG = 100000;

  if (state.winner === 'PULI') return BIG + depthRemaining; // prefer a faster tiger win

  if (state.winner === 'MEKA') return -(BIG + depthRemaining); // prefer a faster goat win too

  return 0; // DRAW: neutral — better than losing, worse than winning

}



function minimax(

  state: GameState,

  depthRemaining: number,

  alpha: number,

  beta: number,

  tt: Map<string, number>,

  deadline: number,

  counter: { n: number },

): number {

  counter.n += 1;

  if ((counter.n & 511) === 0 && Date.now() > deadline) throw TIME_UP;



  if (state.gameOver) return terminalScore(state, depthRemaining);

  if (depthRemaining === 0) return evaluate(state);



  const key = `${hashState(state)}#${depthRemaining}`;

  const cached = tt.get(key);

  if (cached !== undefined) return cached;



  const actions = legalAIActions(state);

  if (!actions.length) {

    const value = evaluate(state);

    tt.set(key, value);

    return value;

  }

  actions.sort((a, b) => Number(b.kind === 'capture') - Number(a.kind === 'capture'));



  const maximizing = state.currentPlayer === 'PULI';

  let best = maximizing ? -Infinity : Infinity;

  for (const action of actions) {

    const value = minimax(simulate(state, action), depthRemaining - 1, alpha, beta, tt, deadline, counter);

    if (maximizing) {

      if (value > best) best = value;

      alpha = Math.max(alpha, best);

    } else {

      if (value < best) best = value;

      beta = Math.min(beta, best);

    }

    if (beta <= alpha) break; // prune

  }

  tt.set(key, best);

  return best;

}



// Iterative deepening at the root: search depth 1, then 2, and so on,

// keeping the best move found at the last FULLY completed depth. alpha

// and beta are declared OUTSIDE the loop over root actions and updated

// after each one, so — unlike the previous version of this file — the

// search window actually carries across sibling root moves instead of

// being reset to +/-Infinity for each one. If the clock runs out

// partway through a depth, that partial depth is discarded (its move

// ordering could be biased) and the previous depth's move is used

// instead.

function searchAIAction(state: GameState, maxDepth: number, timeMs: number): AIAction | null {

  const depthLimit = state.phase === 'PLACEMENT' ? Math.min(maxDepth, 3) : maxDepth;

  const deadline = Date.now() + timeMs;

  const maximizing = state.currentPlayer === 'PULI';

  const counter = { n: 0 };

  let bestAction: AIAction | null = null;



  for (let depth = 1; depth <= depthLimit; depth += 1) {

    const tt = new Map<string, number>();

    const actions = legalAIActions(state).sort((a, b) => Number(b.kind === 'capture') - Number(a.kind === 'capture'));

    if (!actions.length) break;



    let best = maximizing ? -Infinity : Infinity;

    let localBest: AIAction = actions[0];

    let alpha = -Infinity;

    let beta = Infinity;

    let timedOut = false;

    try {

      for (const action of actions) {

        const score = minimax(simulate(state, action), depth - 1, alpha, beta, tt, deadline, counter);

        if (maximizing) {

          if (score > best) { best = score; localBest = action; }

          alpha = Math.max(alpha, best);

        } else {

          if (score < best) { best = score; localBest = action; }

          beta = Math.min(beta, best);

        }

      }

    } catch (err) {

      if (err === TIME_UP) timedOut = true; else throw err;

    }



    if (!timedOut) {

      bestAction = localBest;

      if (Math.abs(best) >= 99000) break; // forced win/loss located, no need to go deeper

    }

    if (timedOut || Date.now() >= deadline) break;

  }

  return bestAction;

}



export function chooseAIAction(state: GameState): AIAction | null {

  if (state.difficulty === 'EASY') return randomAIAction(state);

  const budget = state.difficulty === 'HARD' ? { maxDepth: 7, timeMs: 900 } : { maxDepth: 4, timeMs: 450 };

  try {

    const found = searchAIAction(state, budget.maxDepth, budget.timeMs);

    if (found) return found;

  } catch (err) {

    // Any unexpected error inside the search (not just a time-out,

    // which searchAIAction already handles internally) falls back to

    // a random legal move rather than crashing Kreedu's turn.

    // eslint-disable-next-line no-console

    console.error('Kreedu search failed, falling back to a random move:', err);

  }

  return randomAIAction(state);

}