import { create } from "zustand";

interface SpiralState {
  spiralType: "ulam" | "sacks";
  size: number;
  zoom: number;
  highlightTwins: boolean;
  highlightSophieGermain: boolean;
  hoveredNumber: number | null;
  setSpiralType: (type: "ulam" | "sacks") => void;
  setSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setHighlightTwins: (highlight: boolean) => void;
  setHighlightSophieGermain: (highlight: boolean) => void;
  setHoveredNumber: (n: number | null) => void;
}

export const useSpiralStore = create<SpiralState>((set) => ({
  spiralType: "ulam",
  size: 10000,
  zoom: 1,
  highlightTwins: false,
  highlightSophieGermain: false,
  hoveredNumber: null,
  setSpiralType: (spiralType) => set({ spiralType }),
  setSize: (size) => set({ size }),
  setZoom: (zoom) => set({ zoom }),
  setHighlightTwins: (highlightTwins) => set({ highlightTwins }),
  setHighlightSophieGermain: (highlightSophieGermain) =>
    set({ highlightSophieGermain }),
  setHoveredNumber: (hoveredNumber) => set({ hoveredNumber }),
}));
