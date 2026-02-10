import { create } from "zustand";
import type { CryptarithmPuzzle } from "@/types";
import { loadCryptarithmProgress, saveCryptarithmProgress } from "@/lib/persistence";

const PUZZLES: CryptarithmPuzzle[] = [
  {
    id: "1",
    words: ["TWO", "TWO"],
    operator: "+",
    result: "FOUR",
    hint: "T is an odd number",
    difficulty: "easy",
  },
  {
    id: "2",
    words: ["SEND", "MORE"],
    operator: "+",
    result: "MONEY",
    hint: "M must be 1 (carrying from leftmost column)",
    difficulty: "hard",
  },
  {
    id: "3",
    words: ["AB", "CD"],
    operator: "+",
    result: "EF",
    hint: "Result EF should be a prime number",
    difficulty: "easy",
  },
  {
    id: "4",
    words: ["ONE", "ONE"],
    operator: "+",
    result: "TWO",
    hint: "The result TWO is a prime number representation",
    difficulty: "medium",
  },
  {
    id: "5",
    words: ["AB", "BA"],
    operator: "+",
    result: "CDC",
    hint: "Try making the sum just over 100",
    difficulty: "easy",
  },
  {
    id: "6",
    words: ["AAA", "BBB"],
    operator: "+",
    result: "CCCC",
    hint: "A and B together make a carrying chain",
    difficulty: "medium",
  },
  {
    id: "7",
    words: ["CROSS", "ROADS"],
    operator: "+",
    result: "DANGER",
    hint: "D is 1 from the carry",
    difficulty: "hard",
  },
  {
    id: "8",
    words: ["EAT", "THAT"],
    operator: "+",
    result: "APPLE",
    hint: "The result should decode to a prime",
    difficulty: "medium",
  },
  {
    id: "9",
    words: ["ABC"],
    operator: "*",
    result: "CBA",
    hint: "Try small values for A",
    difficulty: "hard",
  },
  {
    id: "10",
    words: ["FORTY", "TEN", "TEN"],
    operator: "+",
    result: "SIXTY",
    hint: "F must be greater than S by exactly 1",
    difficulty: "hard",
  },
];

interface CryptarithmState {
  currentPuzzle: CryptarithmPuzzle | null;
  puzzleIndex: number;
  letterMapping: Record<string, number | null>;
  isSolved: boolean;
  hintsUsed: number;
  showHint: boolean;
  totalSolved: number;
  solvedPuzzleIds: string[];

  loadPuzzle: (index: number) => void;
  nextPuzzle: () => void;
  setLetterValue: (letter: string, value: number | null) => void;
  checkSolution: () => boolean;
  toggleHint: () => void;
  resetPuzzle: () => void;
  loadProgress: () => void;
  completionPercent: () => number;
}

function getUniqueLetters(puzzle: CryptarithmPuzzle): string[] {
  const allText = [...puzzle.words, puzzle.result].join("");
  return Array.from(new Set(allText.split("")));
}

function evaluateWord(word: string, mapping: Record<string, number | null>): number | null {
  let value = 0;
  for (let i = 0; i < word.length; i++) {
    const digit = mapping[word[i]];
    if (digit === null || digit === undefined) return null;
    value = value * 10 + digit;
  }
  return value;
}

export const useCryptarithmStore = create<CryptarithmState>((set, get) => ({
  currentPuzzle: null,
  puzzleIndex: 0,
  letterMapping: {},
  isSolved: false,
  hintsUsed: 0,
  showHint: false,
  totalSolved: 0,
  solvedPuzzleIds: [],

  loadPuzzle: (index) => {
    const puzzle = PUZZLES[index % PUZZLES.length];
    const letters = getUniqueLetters(puzzle);
    const mapping: Record<string, number | null> = {};
    letters.forEach((l) => (mapping[l] = null));

    set({
      currentPuzzle: puzzle,
      puzzleIndex: index,
      letterMapping: mapping,
      isSolved: false,
      showHint: false,
    });
  },

  nextPuzzle: () => {
    const state = get();
    get().loadPuzzle(state.puzzleIndex + 1);
  },

  setLetterValue: (letter, value) => {
    const state = get();
    if (state.isSolved) return;

    // Check if value is already used by another letter
    if (value !== null) {
      const existingLetter = Object.entries(state.letterMapping).find(
        ([l, v]) => v === value && l !== letter
      );
      if (existingLetter) {
        // Swap values
        set({
          letterMapping: {
            ...state.letterMapping,
            [letter]: value,
            [existingLetter[0]]: state.letterMapping[letter],
          },
        });
        return;
      }
    }

    set({
      letterMapping: {
        ...state.letterMapping,
        [letter]: value,
      },
    });
  },

  checkSolution: () => {
    const state = get();
    if (!state.currentPuzzle) return false;

    const { words, operator, result } = state.currentPuzzle;
    const mapping = state.letterMapping;

    // Check if all letters are assigned
    const allAssigned = Object.values(mapping).every((v) => v !== null);
    if (!allAssigned) return false;

    // Check leading zeros
    for (const word of [...words, result]) {
      if (mapping[word[0]] === 0) return false;
    }

    // Evaluate
    const wordValues = words.map((w) => evaluateWord(w, mapping));
    const resultValue = evaluateWord(result, mapping);

    if (wordValues.some((v) => v === null) || resultValue === null) return false;

    // After the null check, we know all values are numbers
    const validWordValues = wordValues as number[];

    let computed: number;
    switch (operator) {
      case "+":
        computed = validWordValues.reduce((a, b) => a + b, 0);
        break;
      case "-":
        computed = validWordValues.reduce((a, b, i) =>
          i === 0 ? b : a - b
        , 0);
        break;
      case "*":
        computed = validWordValues.reduce((a, b) => a * b, 1);
        break;
      default:
        return false;
    }

    const solved = computed === resultValue;

    if (solved) {
      const puzzleId = state.currentPuzzle!.id;
      const alreadySolved = state.solvedPuzzleIds.includes(puzzleId);
      const newSolvedIds = alreadySolved
        ? state.solvedPuzzleIds
        : [...state.solvedPuzzleIds, puzzleId];
      saveCryptarithmProgress({ solvedPuzzleIds: newSolvedIds });
      set({
        isSolved: true,
        totalSolved: alreadySolved ? state.totalSolved : state.totalSolved + 1,
        solvedPuzzleIds: newSolvedIds,
      });
    }

    return solved;
  },

  toggleHint: () => {
    const state = get();
    if (!state.showHint) {
      set({
        showHint: true,
        hintsUsed: state.hintsUsed + 1,
      });
    } else {
      set({ showHint: false });
    }
  },

  resetPuzzle: () => {
    const state = get();
    if (state.currentPuzzle) {
      const letters = getUniqueLetters(state.currentPuzzle);
      const mapping: Record<string, number | null> = {};
      letters.forEach((l) => (mapping[l] = null));

      set({
        letterMapping: mapping,
        isSolved: false,
        showHint: false,
      });
    }
  },

  loadProgress: () => {
    const progress = loadCryptarithmProgress();
    set({
      solvedPuzzleIds: progress.solvedPuzzleIds,
      totalSolved: progress.solvedPuzzleIds.length,
    });
  },

  completionPercent: () => {
    return Math.round((get().solvedPuzzleIds.length / PUZZLES.length) * 100);
  },
}));

export { PUZZLES };
