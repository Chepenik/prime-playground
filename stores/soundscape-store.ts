import { create } from "zustand";
import { sieveOfEratosthenes } from "@/lib/prime";

interface SoundscapeState {
  tempo: number;
  scale: string;
  baseOctave: number;
  isPlaying: boolean;
  primeSequence: number[];
  currentIndex: number;
  maxPrime: number;
  volume: number;

  setTempo: (tempo: number) => void;
  setScale: (scale: string) => void;
  setBaseOctave: (octave: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentIndex: (index: number) => void;
  setMaxPrime: (max: number) => void;
  setVolume: (volume: number) => void;
  generateSequence: () => void;
  nextNote: () => void;
  reset: () => void;
}

export const useSoundscapeStore = create<SoundscapeState>((set, get) => ({
  tempo: 120,
  scale: "pentatonic",
  baseOctave: 4,
  isPlaying: false,
  primeSequence: [],
  currentIndex: 0,
  maxPrime: 100,
  volume: 0.5,

  setTempo: (tempo) => set({ tempo }),
  setScale: (scale) => set({ scale }),
  setBaseOctave: (baseOctave) => set({ baseOctave }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setMaxPrime: (maxPrime) => {
    set({ maxPrime });
    get().generateSequence();
  },
  setVolume: (volume) => set({ volume }),

  generateSequence: () => {
    const primes = sieveOfEratosthenes(get().maxPrime);
    set({ primeSequence: primes, currentIndex: 0 });
  },

  nextNote: () => {
    const state = get();
    const nextIndex = (state.currentIndex + 1) % state.primeSequence.length;
    set({ currentIndex: nextIndex });
  },

  reset: () => {
    set({
      isPlaying: false,
      currentIndex: 0,
    });
  },
}));

// Scale definitions for mapping primes to notes
export const SCALES: Record<string, string[]> = {
  pentatonic: ["C", "D", "E", "G", "A"],
  major: ["C", "D", "E", "F", "G", "A", "B"],
  minor: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  chromatic: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  dorian: ["C", "D", "Eb", "F", "G", "A", "Bb"],
  mixolydian: ["C", "D", "E", "F", "G", "A", "Bb"],
  blues: ["C", "Eb", "F", "F#", "G", "Bb"],
};

export function primeToNote(
  prime: number,
  scale: string,
  baseOctave: number
): string {
  const notes = SCALES[scale] || SCALES.pentatonic;
  const noteIndex = prime % notes.length;
  const octaveOffset = Math.floor((prime % 24) / notes.length);
  const octave = baseOctave + octaveOffset;
  return `${notes[noteIndex]}${octave}`;
}
