const PREFIX = "prime-playground:";

export function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function removeState(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Silently ignore
  }
}

// Specific persistence shapes

export interface HuntProgress {
  highScore: number;
  highestLevel: number;
}

export interface CryptarithmProgress {
  solvedPuzzleIds: string[];
}

export interface DefenseProgress {
  highestWave: number;
  bestLivesRemaining: number;
}

export interface ArtPreset {
  id: string;
  name: string;
  mode: string;
  colorScheme: string;
  density: number;
  seed: number;
  speed: number;
  primeCount: number;
  createdAt: number;
}

export interface ArtGallery {
  presets: ArtPreset[];
}

export function loadHuntProgress(): HuntProgress {
  return loadState<HuntProgress>("hunt-progress", {
    highScore: 0,
    highestLevel: 0,
  });
}

export function saveHuntProgress(progress: HuntProgress): void {
  saveState("hunt-progress", progress);
}

export function loadCryptarithmProgress(): CryptarithmProgress {
  return loadState<CryptarithmProgress>("cryptarithm-progress", {
    solvedPuzzleIds: [],
  });
}

export function saveCryptarithmProgress(progress: CryptarithmProgress): void {
  saveState("cryptarithm-progress", progress);
}

export function loadDefenseProgress(): DefenseProgress {
  return loadState<DefenseProgress>("defense-progress", {
    highestWave: 0,
    bestLivesRemaining: 0,
  });
}

export function saveDefenseProgress(progress: DefenseProgress): void {
  saveState("defense-progress", progress);
}

export function loadArtGallery(): ArtGallery {
  return loadState<ArtGallery>("art-gallery", { presets: [] });
}

export function saveArtGallery(gallery: ArtGallery): void {
  saveState("art-gallery", gallery);
}
