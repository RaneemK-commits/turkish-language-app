import { create } from "zustand";

export type Tab = "feed" | "deck" | "stats";

interface UiState {
  tab: Tab;
  setTab: (tab: Tab) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  tab: "feed",
  setTab: (tab) => set({ tab }),
}));
