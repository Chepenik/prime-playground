import { create } from "zustand";
import type { FactorTreeNode } from "@/types";

interface FactorizationState {
  inputNumber: number;
  tree: FactorTreeNode | null;
  animationLevel: number;
  isAnimating: boolean;
  setInputNumber: (n: number) => void;
  setTree: (tree: FactorTreeNode | null) => void;
  setAnimationLevel: (level: number) => void;
  setIsAnimating: (animating: boolean) => void;
  reset: () => void;
}

export const useFactorizationStore = create<FactorizationState>((set) => ({
  inputNumber: 60,
  tree: null,
  animationLevel: 0,
  isAnimating: false,
  setInputNumber: (inputNumber) => set({ inputNumber }),
  setTree: (tree) => set({ tree }),
  setAnimationLevel: (animationLevel) => set({ animationLevel }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  reset: () =>
    set({ tree: null, animationLevel: 0, isAnimating: false }),
}));
