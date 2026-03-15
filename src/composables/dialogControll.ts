import { create } from 'zustand';

export type DialogType = 'auth' | 'notice' | 'celebration' | 'none';

interface DialogState {
  currentDialog: DialogType;
  dialogQueue: DialogType[];
  isAuthenticated: boolean;
  hasSeenNotice: boolean;
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
  markCelebrationAsSeen: () => void;
  
  // Utility functions
  isDialogOpen: (dialog: DialogType) => boolean;
  getCurrentDialog: () => DialogType;
  shouldShowDialog: (dialog: DialogType) => boolean;
}

interface DialogStore extends DialogState, DialogActions {}

// Initial state
const initialState: DialogState = {
  currentDialog: 'none',
  dialogQueue: [],
  isAuthenticated: false,
  hasSeenNotice: false,
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
      set({ currentDialog: 'none' });
    }
  },

  closeCurrentDialog: () => {
    const { currentDialog } = get();
    
    // Mark dialogs as seen when closed
    if (currentDialog === 'notice') {
      get().markNoticeAsSeen();
    } else if (currentDialog === 'celebration') {
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
    const isGirlfriendAuth = localStorage.getItem('girlfriend-authenticated') === 'true';
    const hasSeenNoticeSession = sessionStorage.getItem('notice-seen') === 'true';
    const hasSeenCelebrationSession = sessionStorage.getItem('celebration-seen') === 'true';
    
    const queue: DialogType[] = [];
    
    // Build the dialog queue based on current state - STRICT SEQUENCE
    if (!isGirlfriendAuth) {
      // If not authenticated, ONLY show auth dialog
      queue.push('auth');
    } else {
      // Only add other dialogs if already authenticated
      if (!hasSeenNoticeSession) {
        queue.push('notice');
      }
      
      if (!hasSeenCelebrationSession) {
        queue.push('celebration');
      }
    }
    
    set({
      currentDialog: queue.length > 0 ? queue[0] : 'none',
      dialogQueue: queue.slice(1),
      isAuthenticated: isGirlfriendAuth,
      hasSeenNotice: hasSeenNoticeSession,
      hasSeenCelebration: hasSeenCelebrationSession,
    });
  },

  // Authentication flow
  setAuthenticated: (isAuth: boolean) => {
    set({ isAuthenticated: isAuth });
    if (isAuth) {
      localStorage.setItem('girlfriend-authenticated', 'true');
    } else {
      localStorage.removeItem('girlfriend-authenticated');
    }
  },

  handleAuthSuccess: () => {
    get().setAuthenticated(true);
    get().closeCurrentDialog();
  },

  // Dialog completion tracking
  markNoticeAsSeen: () => {
    set({ hasSeenNotice: true });
    sessionStorage.setItem('notice-seen', 'true');
  },

  markCelebrationAsSeen: () => {
    set({ hasSeenCelebration: true });
    sessionStorage.setItem('celebration-seen', 'true');
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
      case 'auth':
        return !state.isAuthenticated;
      case 'notice':
        return state.isAuthenticated && !state.hasSeenNotice;
      case 'celebration':
        return state.isAuthenticated && state.hasSeenNotice && !state.hasSeenCelebration;
      default:
        return false;
    }
  },
}));

// Selector hooks for better performance
export const useCurrentDialog = () => useDialogController((state) => state.currentDialog);
export const useIsDialogOpen = (dialog: DialogType) => useDialogController((state) => state.isDialogOpen(dialog));
export const useAuthenticationStatus = () => useDialogController((state) => state.isAuthenticated);

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
    markCelebrationAsSeen: store.markCelebrationAsSeen,
  };
};

// Initialize dialog flow on app startup
export const initializeDialogFlow = () => {
  useDialogController.getState().resetDialogFlow();
};

export default useDialogController;
