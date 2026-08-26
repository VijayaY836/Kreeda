export type Variant = 'chaturanga' | 'chess';

export type GameMode = 'PVC' | 'PVP';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD'; // Sishya / Yodha / Senapati

export type Side = 1 | -1; // 1 = Ivory/White, -1 = Ebony/Black

export type PieceLetter = 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | 'E' | 'M';

export type ViewTab = 'HOME' | 'HISTORY' | 'TUTORIAL' | 'MODE_SELECT' | 'GAME';

export type KreeduMood = 'IDLE' | 'THINKING' | 'HAPPY' | 'WORRIED' | 'WIN' | 'LOSE';

export interface MoveRecord {
  id: string;
  moveNumber: number;
  side: Side;
  san: string;
  capturedLetter: PieceLetter | null;
}

export interface GameSettings {
  variant: Variant;
  gameMode: GameMode;
  difficulty: AIDifficulty;
  humanSide: Side;
  boardStyle: 'ashtapada' | 'checkered';
  hints: boolean;
  soundEnabled: boolean;
}
