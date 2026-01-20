import { create } from "zustand";

interface ArtState {
  mode: "spiral" | "particles" | "waves" | "mandala";
  colorScheme: string;
  density: number;
  seed: number;
  animated: boolean;
  speed: number;
  primeCount: number;
  showNumbers: boolean;

  setMode: (mode: "spiral" | "particles" | "waves" | "mandala") => void;
  setColorScheme: (scheme: string) => void;
  setDensity: (density: number) => void;
  setSeed: (seed: number) => void;
  setAnimated: (animated: boolean) => void;
  setSpeed: (speed: number) => void;
  setPrimeCount: (count: number) => void;
  setShowNumbers: (show: boolean) => void;
  randomize: () => void;
}

export const COLOR_SCHEMES: Record<string, string[]> = {
  cosmic: ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"],
  ocean: ["#0ea5e9", "#06b6d4", "#14b8a6", "#10b981", "#22c55e"],
  sunset: ["#f97316", "#f59e0b", "#eab308", "#ef4444", "#dc2626"],
  forest: ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"],
  neon: ["#ff0080", "#00ff80", "#8000ff", "#ff8000", "#00ffff"],
  monochrome: ["#ffffff", "#d1d5db", "#9ca3af", "#6b7280", "#374151"],
  rainbow: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"],
  prime: ["#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"],
};

export const useArtStore = create<ArtState>((set, get) => ({
  mode: "spiral",
  colorScheme: "cosmic",
  density: 50,
  seed: Math.floor(Math.random() * 10000),
  animated: true,
  speed: 1,
  primeCount: 1000,
  showNumbers: false,

  setMode: (mode) => set({ mode }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setDensity: (density) => set({ density }),
  setSeed: (seed) => set({ seed }),
  setAnimated: (animated) => set({ animated }),
  setSpeed: (speed) => set({ speed }),
  setPrimeCount: (primeCount) => set({ primeCount }),
  setShowNumbers: (showNumbers) => set({ showNumbers }),

  randomize: () => {
    const modes: ("spiral" | "particles" | "waves" | "mandala")[] = [
      "spiral",
      "particles",
      "waves",
      "mandala",
    ];
    const schemes = Object.keys(COLOR_SCHEMES);

    set({
      mode: modes[Math.floor(Math.random() * modes.length)],
      colorScheme: schemes[Math.floor(Math.random() * schemes.length)],
      density: Math.floor(Math.random() * 80) + 20,
      seed: Math.floor(Math.random() * 10000),
      speed: Math.random() * 2 + 0.5,
    });
  },
}));
