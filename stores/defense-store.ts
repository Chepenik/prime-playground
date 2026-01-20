import { create } from "zustand";
import type { Tower, Enemy } from "@/types";

const GRID_SIZE = 15;
const CELL_SIZE = 40;

// Pre-defined path through the grid
const DEFAULT_PATH = [
  { x: 0, y: 7 },
  { x: 1, y: 7 },
  { x: 2, y: 7 },
  { x: 3, y: 7 },
  { x: 4, y: 7 },
  { x: 4, y: 6 },
  { x: 4, y: 5 },
  { x: 4, y: 4 },
  { x: 5, y: 4 },
  { x: 6, y: 4 },
  { x: 7, y: 4 },
  { x: 7, y: 5 },
  { x: 7, y: 6 },
  { x: 7, y: 7 },
  { x: 7, y: 8 },
  { x: 7, y: 9 },
  { x: 7, y: 10 },
  { x: 8, y: 10 },
  { x: 9, y: 10 },
  { x: 10, y: 10 },
  { x: 10, y: 9 },
  { x: 10, y: 8 },
  { x: 10, y: 7 },
  { x: 10, y: 6 },
  { x: 10, y: 5 },
  { x: 11, y: 5 },
  { x: 12, y: 5 },
  { x: 13, y: 5 },
  { x: 14, y: 5 },
];

const TOWER_CONFIGS = {
  2: { range: 100, damage: 2, attackSpeed: 500, cost: 50 },
  3: { range: 120, damage: 3, attackSpeed: 600, cost: 75 },
  5: { range: 150, damage: 5, attackSpeed: 800, cost: 100 },
  7: { range: 130, damage: 7, attackSpeed: 700, cost: 125 },
  11: { range: 180, damage: 11, attackSpeed: 1000, cost: 175 },
  13: { range: 160, damage: 13, attackSpeed: 900, cost: 200 },
};

interface DefenseState {
  towers: Tower[];
  enemies: Enemy[];
  money: number;
  lives: number;
  wave: number;
  waveInProgress: boolean;
  gameStatus: "playing" | "won" | "lost" | "idle";
  path: { x: number; y: number }[];
  selectedTowerPrime: number | null;
  gridSize: number;
  cellSize: number;

  initGame: () => void;
  placeTower: (x: number, y: number) => boolean;
  selectTowerPrime: (prime: number | null) => void;
  startWave: () => void;
  updateGame: (deltaTime: number) => void;
  removeTower: (id: string) => void;
  resetGame: () => void;
}

export const useDefenseStore = create<DefenseState>((set, get) => ({
  towers: [],
  enemies: [],
  money: 200,
  lives: 20,
  wave: 0,
  waveInProgress: false,
  gameStatus: "idle",
  path: DEFAULT_PATH,
  selectedTowerPrime: null,
  gridSize: GRID_SIZE,
  cellSize: CELL_SIZE,

  initGame: () => {
    set({
      towers: [],
      enemies: [],
      money: 200,
      lives: 20,
      wave: 0,
      waveInProgress: false,
      gameStatus: "playing",
      path: DEFAULT_PATH,
      selectedTowerPrime: null,
    });
  },

  placeTower: (x, y) => {
    const state = get();
    const { selectedTowerPrime, money, towers, path } = state;

    if (!selectedTowerPrime || state.gameStatus !== "playing") return false;

    const config = TOWER_CONFIGS[selectedTowerPrime as keyof typeof TOWER_CONFIGS];
    if (!config || money < config.cost) return false;

    // Check if position is on path
    const isOnPath = path.some((p) => p.x === x && p.y === y);
    if (isOnPath) return false;

    // Check if tower already exists at position
    const existingTower = towers.find((t) => t.x === x && t.y === y);
    if (existingTower) return false;

    const newTower: Tower = {
      id: `tower-${Date.now()}`,
      prime: selectedTowerPrime,
      x,
      y,
      range: config.range,
      damage: config.damage,
      attackSpeed: config.attackSpeed,
      lastAttack: 0,
    };

    set({
      towers: [...towers, newTower],
      money: money - config.cost,
      selectedTowerPrime: null,
    });

    return true;
  },

  selectTowerPrime: (prime) => {
    set({ selectedTowerPrime: prime });
  },

  startWave: () => {
    const state = get();
    if (state.waveInProgress || state.gameStatus !== "playing") return;

    const newWave = state.wave + 1;
    const enemyCount = 5 + newWave * 2;
    const enemies: Enemy[] = [];

    for (let i = 0; i < enemyCount; i++) {
      // Generate HP values that are divisible by various primes
      const baseHp = 10 + newWave * 5;
      const multipliers = [2, 3, 5, 6, 7, 10, 14, 15, 21, 35];
      const hp = baseHp * multipliers[Math.floor(Math.random() * multipliers.length)];

      enemies.push({
        id: `enemy-${Date.now()}-${i}`,
        hp,
        maxHp: hp,
        x: state.path[0].x * CELL_SIZE + CELL_SIZE / 2,
        y: state.path[0].y * CELL_SIZE + CELL_SIZE / 2,
        speed: 30 + newWave * 5,
        pathIndex: 0,
        reward: Math.floor(hp / 10),
      });
    }

    set({
      wave: newWave,
      enemies,
      waveInProgress: true,
    });
  },

  updateGame: (deltaTime) => {
    const state = get();
    if (state.gameStatus !== "playing" || !state.waveInProgress) return;

    const { enemies, towers, path, lives, money } = state;
    let newEnemies = [...enemies];
    let newLives = lives;
    let newMoney = money;
    const newTowers = towers.map((t) => ({ ...t }));

    // Update enemy positions
    newEnemies = newEnemies.map((enemy) => {
      const targetPoint = path[enemy.pathIndex];
      if (!targetPoint) return enemy;

      const targetX = targetPoint.x * CELL_SIZE + CELL_SIZE / 2;
      const targetY = targetPoint.y * CELL_SIZE + CELL_SIZE / 2;

      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // Reached waypoint
        if (enemy.pathIndex >= path.length - 1) {
          // Reached end
          newLives--;
          return null;
        }
        return { ...enemy, pathIndex: enemy.pathIndex + 1 };
      }

      // Move towards target
      const moveDistance = enemy.speed * (deltaTime / 1000);
      const ratio = moveDistance / distance;

      return {
        ...enemy,
        x: enemy.x + dx * ratio,
        y: enemy.y + dy * ratio,
      };
    }).filter((e): e is Enemy => e !== null);

    // Tower attacks
    const now = Date.now();
    newTowers.forEach((tower) => {
      if (now - tower.lastAttack < tower.attackSpeed) return;

      // Find enemy in range that tower can damage
      const towerCenterX = tower.x * CELL_SIZE + CELL_SIZE / 2;
      const towerCenterY = tower.y * CELL_SIZE + CELL_SIZE / 2;

      for (const enemy of newEnemies) {
        const dx = enemy.x - towerCenterX;
        const dy = enemy.y - towerCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= tower.range && enemy.hp % tower.prime === 0) {
          // Can attack this enemy
          enemy.hp -= tower.damage;
          tower.lastAttack = now;

          if (enemy.hp <= 0) {
            newMoney += enemy.reward;
            newEnemies = newEnemies.filter((e) => e.id !== enemy.id);
          }
          break;
        }
      }
    });

    // Check game state
    let newGameStatus: "playing" | "won" | "lost" | "idle" = state.gameStatus;
    let newWaveInProgress: boolean = state.waveInProgress;

    if (newLives <= 0) {
      newGameStatus = "lost";
      newWaveInProgress = false;
    } else if (newEnemies.length === 0) {
      newWaveInProgress = false;
      if (state.wave >= 10) {
        newGameStatus = "won";
      }
    }

    set({
      enemies: newEnemies,
      towers: newTowers,
      lives: newLives,
      money: newMoney,
      gameStatus: newGameStatus,
      waveInProgress: newWaveInProgress,
    });
  },

  removeTower: (id) => {
    const state = get();
    const tower = state.towers.find((t) => t.id === id);
    if (!tower) return;

    const config = TOWER_CONFIGS[tower.prime as keyof typeof TOWER_CONFIGS];
    const refund = Math.floor(config.cost * 0.5);

    set({
      towers: state.towers.filter((t) => t.id !== id),
      money: state.money + refund,
    });
  },

  resetGame: () => {
    set({
      towers: [],
      enemies: [],
      money: 200,
      lives: 20,
      wave: 0,
      waveInProgress: false,
      gameStatus: "idle",
      selectedTowerPrime: null,
    });
  },
}));

export { TOWER_CONFIGS };
