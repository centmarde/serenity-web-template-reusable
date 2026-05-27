import { create } from "zustand";

export type DialogType = "auth" | "notice" | "tarot" | "celebration" | "none";

interface DialogState {
  currentDialog: DialogType;
  dialogQueue: DialogType[];
  isAuthenticated: boolean;
  hasSeenNotice: boolean;
  hasSeenTarot: boolean;
  hasSeenCelebration: boolean;
}

interface DialogActions {
  // Core dialog control
  showNextDialog: () => void;
  closeCurrentDialog: () => void;
  skipToDialog: (dialog: DialogType) => void;
  resetDialogFlow: () => void;

  // Authentication flow
  setAuthenticated: (isAuth: boolean) => void;
  handleAuthSuccess: () => void;

  // Dialog completion tracking
  markNoticeAsSeen: () => void;
  markTarotAsSeen: () => void;
  markCelebrationAsSeen: () => void;

  // Utility functions
  isDialogOpen: (dialog: DialogType) => boolean;
  getCurrentDialog: () => DialogType;
  shouldShowDialog: (dialog: DialogType) => boolean;
}

interface DialogStore extends DialogState, DialogActions {}

// Initial state
const initialState: DialogState = {
  currentDialog: "none",
  dialogQueue: [],
  isAuthenticated: false,
  hasSeenNotice: false,
  hasSeenTarot: false,
  hasSeenCelebration: false,
};

export const useDialogController = create<DialogStore>((set, get) => ({
  ...initialState,

  // Core dialog control
  showNextDialog: () => {
    const { dialogQueue } = get();
    if (dialogQueue.length > 0) {
      const nextDialog = dialogQueue[0];
      const remainingQueue = dialogQueue.slice(1);
      set({
        currentDialog: nextDialog,
        dialogQueue: remainingQueue,
      });
    } else {
      set({ currentDialog: "none" });
    }
  },

  closeCurrentDialog: () => {
    const { currentDialog } = get();

    // Mark dialogs as seen when closed
    if (currentDialog === "notice") {
      get().markNoticeAsSeen();
    } else if (currentDialog === "tarot") {
      get().markTarotAsSeen();
    } else if (currentDialog === "celebration") {
      get().markCelebrationAsSeen();
    }

    // Show next dialog in queue
    get().showNextDialog();
  },

  skipToDialog: (dialog: DialogType) => {
    set({
      currentDialog: dialog,
      dialogQueue: [],
    });
  },

  resetDialogFlow: () => {
    // Reset to initial state and determine which dialogs should be shown
    const isGirlfriendAuth =
      localStorage.getItem("girlfriend-authenticated") === "true";

    const queue: DialogType[] = [];

    // Build the dialog queue based on current state - STRICT SEQUENCE
    if (!isGirlfriendAuth) {
      // If not authenticated, ONLY show auth dialog
      queue.push("auth");
    } else {
      // Always show notice, tarot, and celebration dialogs on page reload for authenticated users
      queue.push("notice");
      queue.push("tarot");
      queue.push("celebration");
    }

    set({
      currentDialog: queue.length > 0 ? queue[0] : "none",
      dialogQueue: queue.slice(1),
      isAuthenticated: isGirlfriendAuth,
      hasSeenNotice: false, // Always reset to false - no session management
      hasSeenTarot: false, // Always reset to false - no session management
      hasSeenCelebration: false, // Always reset to false - no session management
    });
  },

  // Authentication flow
  setAuthenticated: (isAuth: boolean) => {
    set({ isAuthenticated: isAuth });
    if (isAuth) {
      localStorage.setItem("girlfriend-authenticated", "true");
    } else {
      localStorage.removeItem("girlfriend-authenticated");
    }
  },

  handleAuthSuccess: () => {
    get().setAuthenticated(true);

    // After successful authentication, automatically queue the notice, tarot, and celebration dialogs
    const queue: DialogType[] = ["notice", "tarot", "celebration"];

    set({
      currentDialog: queue[0], // Start with notice dialog
      dialogQueue: queue.slice(1), // Queue celebration dialog next
      hasSeenNotice: false, // Reset to ensure they show
      hasSeenTarot: false, // Reset to ensure they show
      hasSeenCelebration: false, // Reset to ensure they show
    });
  },

  // Dialog completion tracking
  markNoticeAsSeen: () => {
    set({ hasSeenNotice: true });
    // No sessionStorage - dialogs will show again on page reload
  },

  markTarotAsSeen: () => {
    set({ hasSeenTarot: true });
    // No sessionStorage - dialogs will show again on page reload
  },

  markCelebrationAsSeen: () => {
    set({ hasSeenCelebration: true });
    // No sessionStorage - dialogs will show again on page reload
  },

  // Utility functions
  isDialogOpen: (dialog: DialogType) => {
    const { currentDialog } = get();
    return currentDialog === dialog;
  },

  getCurrentDialog: () => {
    return get().currentDialog;
  },

  shouldShowDialog: (dialog: DialogType) => {
    const state = get();

    switch (dialog) {
      case "auth":
        return !state.isAuthenticated;
      case "notice":
        return state.isAuthenticated && !state.hasSeenNotice;
      case "tarot":
        return (
          state.isAuthenticated && state.hasSeenNotice && !state.hasSeenTarot
        );
      case "celebration":
        return (
          state.isAuthenticated &&
          state.hasSeenNotice &&
          state.hasSeenTarot &&
          !state.hasSeenCelebration
        );
      default:
        return false;
    }
  },
}));

// Selector hooks for better performance
export const useCurrentDialog = () =>
  useDialogController((state) => state.currentDialog);
export const useIsDialogOpen = (dialog: DialogType) =>
  useDialogController((state) => state.isDialogOpen(dialog));
export const useAuthenticationStatus = () =>
  useDialogController((state) => state.isAuthenticated);

// Action hooks
export const useDialogActions = () => {
  const store = useDialogController.getState();
  return {
    showNextDialog: store.showNextDialog,
    closeCurrentDialog: store.closeCurrentDialog,
    skipToDialog: store.skipToDialog,
    resetDialogFlow: store.resetDialogFlow,
    setAuthenticated: store.setAuthenticated,
    handleAuthSuccess: store.handleAuthSuccess,
    markNoticeAsSeen: store.markNoticeAsSeen,
    markTarotAsSeen: store.markTarotAsSeen,
    markCelebrationAsSeen: store.markCelebrationAsSeen,
  };
};

// Initialize dialog flow on app startup
export const initializeDialogFlow = () => {
  useDialogController.getState().resetDialogFlow();
};

export default useDialogController;
