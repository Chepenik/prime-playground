import { create } from "zustand";
import type { GridCell } from "@/types";
import { isPrime } from "@/lib/prime";
import { loadHuntProgress, saveHuntProgress } from "@/lib/persistence";

interface HuntState {
  grid: GridCell[][];
  playerPosition: { row: number; col: number };
  goalPosition: { row: number; col: number };
  lives: number;
  score: number;
  level: number;
  gameStatus: "playing" | "won" | "lost" | "idle";
  lastWrongMove: { row: number; col: number } | null;
  highScore: number;
  highestLevel: number;
  initGame: (level?: number) => void;
  movePlayer: (direction: "up" | "down" | "left" | "right") => void;
  resetGame: () => void;
  clearWrongMove: () => void;
  loadProgress: () => void;
}

function hasValidPath(
  grid: GridCell[][],
  start: { row: number; col: number },
  goal: { row: number; col: number }
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const queue: { row: number; col: number }[] = [start];
  visited.add(`${start.row},${start.col}`);

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.row === goal.row && current.col === goal.col) return true;

    for (const dir of directions) {
      const nr = current.row + dir.row;
      const nc = current.col + dir.col;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(key) && grid[nr][nc].isPrime) {
        visited.add(key);
        queue.push({ row: nr, col: nc });
      }
    }
  }

  return false;
}

function generateGrid(
  size: number,
  level: number
): {
  grid: GridCell[][];
  start: { row: number; col: number };
  goal: { row: number; col: number };
} {
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid: GridCell[][] = [];
    const maxValue = 20 + level * 10;

    for (let row = 0; row < size; row++) {
      grid[row] = [];
      for (let col = 0; col < size; col++) {
        const value = Math.floor(Math.random() * maxValue) + 2;
        grid[row][col] = {
          value,
          isPrime: isPrime(value),
          visited: false,
          isPlayer: false,
          isGoal: false,
        };
      }
    }

    // Set start position (top-left area)
    const startRow = Math.floor(Math.random() * 2);
    const startCol = Math.floor(Math.random() * 2);
    grid[startRow][startCol].isPlayer = true;
    grid[startRow][startCol].visited = true;
    grid[startRow][startCol].value = 2;
    grid[startRow][startCol].isPrime = true;

    // Set goal position (bottom-right area)
    const goalRow = size - 1 - Math.floor(Math.random() * 2);
    const goalCol = size - 1 - Math.floor(Math.random() * 2);
    grid[goalRow][goalCol].isGoal = true;
    grid[goalRow][goalCol].value = 2;
    grid[goalRow][goalCol].isPrime = true;

    const start = { row: startRow, col: startCol };
    const goal = { row: goalRow, col: goalCol };

    if (hasValidPath(grid, start, goal)) {
      return { grid, start, goal };
    }
  }

  // Fallback: force a solvable grid by seeding primes along a path
  const grid: GridCell[][] = [];
  const maxValue = 20 + level * 10;

  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      const value = Math.floor(Math.random() * maxValue) + 2;
      grid[row][col] = {
        value,
        isPrime: isPrime(value),
        visited: false,
        isPlayer: false,
        isGoal: false,
      };
    }
  }

  const startRow = 0;
  const startCol = 0;
  const goalRow = size - 1;
  const goalCol = size - 1;

  // Carve a guaranteed path with primes
  const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  let r = startRow;
  let c = startCol;
  while (r < goalRow) {
    const p = smallPrimes[Math.floor(Math.random() * smallPrimes.length)];
    grid[r][c].value = p;
    grid[r][c].isPrime = true;
    r++;
  }
  while (c < goalCol) {
    const p = smallPrimes[Math.floor(Math.random() * smallPrimes.length)];
    grid[r][c].value = p;
    grid[r][c].isPrime = true;
    c++;
  }

  grid[startRow][startCol].isPlayer = true;
  grid[startRow][startCol].visited = true;
  grid[startRow][startCol].value = 2;
  grid[startRow][startCol].isPrime = true;
  grid[goalRow][goalCol].isGoal = true;
  grid[goalRow][goalCol].value = 2;
  grid[goalRow][goalCol].isPrime = true;

  return {
    grid,
    start: { row: startRow, col: startCol },
    goal: { row: goalRow, col: goalCol },
  };
}

export const useHuntStore = create<HuntState>((set, get) => ({
  grid: [],
  playerPosition: { row: 0, col: 0 },
  goalPosition: { row: 0, col: 0 },
  lives: 3,
  score: 0,
  level: 1,
  gameStatus: "idle",
  lastWrongMove: null,
  highScore: 0,
  highestLevel: 0,

  initGame: (level = 1) => {
    const size = 5 + Math.min(level - 1, 5);
    const { grid, start, goal } = generateGrid(size, level);

    set({
      grid,
      playerPosition: start,
      goalPosition: goal,
      lives: 3,
      score: get().gameStatus === "won" ? get().score : 0,
      level,
      gameStatus: "playing",
      lastWrongMove: null,
    });
  },

  movePlayer: (direction) => {
    const state = get();
    if (state.gameStatus !== "playing") return;

    const { playerPosition, grid, lives, score, level, goalPosition } = state;
    let newRow = playerPosition.row;
    let newCol = playerPosition.col;

    switch (direction) {
      case "up":
        newRow--;
        break;
      case "down":
        newRow++;
        break;
      case "left":
        newCol--;
        break;
      case "right":
        newCol++;
        break;
    }

    // Check boundaries
    if (
      newRow < 0 ||
      newRow >= grid.length ||
      newCol < 0 ||
      newCol >= grid[0].length
    ) {
      return;
    }

    const targetCell = grid[newRow][newCol];
    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

    // Clear old player position
    newGrid[playerPosition.row][playerPosition.col].isPlayer = false;

    if (targetCell.isPrime) {
      // Valid move
      newGrid[newRow][newCol].isPlayer = true;
      newGrid[newRow][newCol].visited = true;

      const newScore = score + targetCell.value;

      // Check if reached goal
      if (newRow === goalPosition.row && newCol === goalPosition.col) {
        const finalScore = newScore + level * 100;
        const { highScore, highestLevel } = get();
        const newHighScore = Math.max(highScore, finalScore);
        const newHighestLevel = Math.max(highestLevel, level);
        saveHuntProgress({ highScore: newHighScore, highestLevel: newHighestLevel });
        set({
          grid: newGrid,
          playerPosition: { row: newRow, col: newCol },
          score: finalScore,
          gameStatus: "won",
          highScore: newHighScore,
          highestLevel: newHighestLevel,
        });
      } else {
        set({
          grid: newGrid,
          playerPosition: { row: newRow, col: newCol },
          score: newScore,
        });
      }
    } else {
      // Invalid move - lose a life
      const newLives = lives - 1;

      if (newLives <= 0) {
        set({
          lives: 0,
          gameStatus: "lost",
          lastWrongMove: { row: newRow, col: newCol },
        });
      } else {
        // Flash the cell red but don't move
        set({
          lives: newLives,
          lastWrongMove: { row: newRow, col: newCol },
        });
      }
    }
  },

  resetGame: () => {
    set({
      grid: [],
      playerPosition: { row: 0, col: 0 },
      goalPosition: { row: 0, col: 0 },
      lives: 3,
      score: 0,
      level: 1,
      gameStatus: "idle",
      lastWrongMove: null,
    });
  },

  clearWrongMove: () => {
    set({ lastWrongMove: null });
  },

  loadProgress: () => {
    const progress = loadHuntProgress();
    set({ highScore: progress.highScore, highestLevel: progress.highestLevel });
  },
}));
