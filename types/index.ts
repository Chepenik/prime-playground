// Prime-related types
export interface PrimePoint {
  n: number;
  x: number;
  y: number;
  isPrime: boolean;
}

export interface UlamPoint extends PrimePoint {}

export interface SacksPoint extends PrimePoint {
  angle: number;
  radius: number;
}

// Factor Tree types
export interface FactorTreeNode {
  value: number;
  isPrime: boolean;
  children: FactorTreeNode[];
}

// Prime Hunt Game types
export interface GridCell {
  value: number;
  isPrime: boolean;
  visited: boolean;
  isPlayer: boolean;
  isGoal: boolean;
}

export interface HuntGameState {
  grid: GridCell[][];
  playerPosition: { row: number; col: number };
  goalPosition: { row: number; col: number };
  lives: number;
  score: number;
  level: number;
  gameStatus: "playing" | "won" | "lost" | "idle";
}

// Prime Defense Game types
export interface Tower {
  id: string;
  prime: number;
  x: number;
  y: number;
  range: number;
  damage: number;
  attackSpeed: number;
  lastAttack: number;
}

export interface Enemy {
  id: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  speed: number;
  pathIndex: number;
  reward: number;
}

export interface DefenseGameState {
  towers: Tower[];
  enemies: Enemy[];
  money: number;
  lives: number;
  wave: number;
  waveInProgress: boolean;
  gameStatus: "playing" | "won" | "lost" | "idle";
  path: { x: number; y: number }[];
}

// Cryptarithm Puzzle types
export interface CryptarithmPuzzle {
  id: string;
  words: string[];
  operator: "+" | "-" | "*";
  result: string;
  hint?: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface CryptarithmState {
  currentPuzzle: CryptarithmPuzzle | null;
  letterMapping: Record<string, number | null>;
  isSolved: boolean;
  hintsUsed: number;
}

// Prime Soundscape types
export interface SoundscapeSettings {
  tempo: number;
  scale: string;
  baseNote: string;
  isPlaying: boolean;
  primeSequence: number[];
}

// Prime Art types
export interface ArtSettings {
  mode: "spiral" | "particles" | "waves";
  colorScheme: string[];
  density: number;
  seed: number;
  animated: boolean;
}
