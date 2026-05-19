import { create } from "zustand";

interface NullaChatState {
  lastAiMessage: string | null;
  setLastAiMessage: (message: string) => void;
  clearLastAiMessage: () => void;
}

export const useNullaChatStore = create<NullaChatState>((set) => ({
  lastAiMessage: null,
  setLastAiMessage: (message: string) => set({ lastAiMessage: message }),
  clearLastAiMessage: () => set({ lastAiMessage: null }),
}));
