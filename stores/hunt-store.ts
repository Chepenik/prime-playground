import { create } from "zustand";
import type { GridCell } from "@/types";
import { isPrime } from "@/lib/prime";

interface HuntState {
  grid: GridCell[][];
  playerPosition: { row: number; col: number };
  goalPosition: { row: number; col: number };
  lives: number;
  score: number;
  level: number;
  gameStatus: "playing" | "won" | "lost" | "idle";
  initGame: (level?: number) => void;
  movePlayer: (direction: "up" | "down" | "left" | "right") => void;
  resetGame: () => void;
}

function generateGrid(
  size: number,
  level: number
): {
  grid: GridCell[][];
  start: { row: number; col: number };
  goal: { row: number; col: number };
} {
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
  grid[startRow][startCol].value = 2; // Always prime
  grid[startRow][startCol].isPrime = true;

  // Set goal position (bottom-right area)
  const goalRow = size - 1 - Math.floor(Math.random() * 2);
  const goalCol = size - 1 - Math.floor(Math.random() * 2);
  grid[goalRow][goalCol].isGoal = true;
  grid[goalRow][goalCol].value = 2; // Always prime
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
        set({
          grid: newGrid,
          playerPosition: { row: newRow, col: newCol },
          score: newScore + level * 100,
          gameStatus: "won",
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
        });
      } else {
        // Flash the cell red but don't move
        set({ lives: newLives });
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
    });
  },
}));
