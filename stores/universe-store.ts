import { create } from "zustand";

interface UniverseState {
  pointCount: number;
  showTwinConnections: boolean;
  highlightType: "none" | "twin" | "sophie" | "mersenne";
  selectedNumber: number | null;
  autoRotate: boolean;
  pointSize: number;

  setPointCount: (count: number) => void;
  setShowTwinConnections: (show: boolean) => void;
  setHighlightType: (type: "none" | "twin" | "sophie" | "mersenne") => void;
  setSelectedNumber: (n: number | null) => void;
  setAutoRotate: (auto: boolean) => void;
  setPointSize: (size: number) => void;
}

export const useUniverseStore = create<UniverseState>((set) => ({
  pointCount: 2000,
  showTwinConnections: true,
  highlightType: "none",
  selectedNumber: null,
  autoRotate: true,
  pointSize: 1,

  setPointCount: (pointCount) => set({ pointCount }),
  setShowTwinConnections: (showTwinConnections) => set({ showTwinConnections }),
  setHighlightType: (highlightType) => set({ highlightType }),
  setSelectedNumber: (selectedNumber) => set({ selectedNumber }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setPointSize: (pointSize) => set({ pointSize }),
}));
