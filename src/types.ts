export type Player = 'P1' | 'P2'; // P1: Player (Lotus Pink), P2: Opponent / Kreedu (Deep Maroon)

export type GameMode = 'PVC' | 'PVP'; // Player vs Computer | Player vs Player

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type GamePhase = 'PLACEMENT' | 'MOVEMENT' | 'FLYING';

export type TurnAction = 'PLACE' | 'SELECT_PIECE' | 'SELECT_TARGET' | 'CAPTURE';

export interface BoardNode {
  id: number;
  x: number; // 0 to 600 svg space
  y: number;
  ring: 'OUTER' | 'MIDDLE' | 'INNER';
  name: string; // e.g. "Outer Top-Left"
  adjacents: number[];
}

export type BoardState = (Player | null)[];

export interface MoveRecord {
  id: string;
  moveNumber: number;
  player: Player;
  actionType: 'PLACE' | 'MOVE' | 'CAPTURE' | 'MILL';
  fromNode?: number;
  toNode?: number;
  capturedNode?: number;
  message: string;
  timestamp: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  flyingRule: boolean; // Optional flying rule when down to 3 pieces (default false)
  difficulty: AIDifficulty;
  gameMode: GameMode;
  autoPlayKreedu: boolean;
}

export type ViewTab = 'HOME' | 'MODE_SELECT' | 'ABOUT' | 'HISTORY' | 'FACTS' | 'HOW_TO_PLAY' | 'TUTORIAL' | 'GAME';

export type KreeduMood = 'IDLE' | 'THINKING' | 'HAPPY' | 'WORRIED' | 'WIN' | 'LOSE';

export interface TutorialStep {
  id: number;
  title: string;
  phaseName: string;
  description: string;
  highlightNodes?: number[];
  millHighlight?: number[];
  initialBoard: BoardState;
  p1Hand: number;
  p2Hand: number;
  actionInstruction: string;
  targetNode?: number;
  expectedAction: 'CLICK_NODE' | 'NEXT_ONLY';
}
