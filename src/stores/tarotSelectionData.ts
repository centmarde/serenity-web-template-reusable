import { create } from 'zustand';
import type { TarotCard } from '../composables/tarotConstant';
import type { TarotReadingSession } from '../lib/AiTarotReading';
import { useTarotCardsDataStore } from './tarotCardsData';

interface TarotSelectionData {
  selectedCards: TarotCard[];
  selectionTimestamp: number | null;
  isReadingGenerated: boolean;
  aiReadingSession: TarotReadingSession | null;
  isGfReading: boolean;
  lastSavedSessionId: string | null; // Track last saved session to prevent duplicates
}

interface TarotSelectionStore {
  selectionData: TarotSelectionData;
  isLoading: boolean;
  
  // Actions
  setSelectedCards: (cards: TarotCard[]) => void;
  setSelectedCardsForReading: (cards: TarotCard[]) => void;
  clearSelection: () => void;
  markReadingGenerated: () => void;
  getSelectedCards: () => TarotCard[];
  hasValidSelection: () => boolean;
  getSelectionAge: () => number | null;
  

  
  // AI Reading Management
  setAiReadingSession: (session: TarotReadingSession, isGf?: boolean) => void;
  getAiReadingSession: () => TarotReadingSession | null;
  clearAiReading: () => void;
  hasAiReading: () => boolean;
  setReadingContext: (isGf: boolean) => void;
  getReadingContext: () => boolean;
 
  
  // Cache validation
  isSelectionExpired: (maxAgeMinutes?: number) => boolean;
}

const DEFAULT_CACHE_DURATION_MINUTES = 60; // 1 hour cache

export const useTarotSelectionStore = create<TarotSelectionStore>((set, get) => ({
  selectionData: {
    selectedCards: [],
    selectionTimestamp: null,
    isReadingGenerated: false,
    aiReadingSession: null,
    isGfReading: false,
    lastSavedSessionId: null
  },
  isLoading: false,

  setSelectedCards: (cards: TarotCard[]) => {
    if (cards.length === 6) {
      const currentData = get().selectionData;
      const selectionTimestamp = Date.now();

      set({
        selectionData: {
          selectedCards: cards,
          selectionTimestamp,
          isReadingGenerated: false,
          aiReadingSession: null, // Clear previous AI reading when new cards selected
          isGfReading: currentData.isGfReading,
          lastSavedSessionId: null // Reset when selecting new cards
        },
        isLoading: false,
      });
      
      // Optional: Store in localStorage for persistence across sessions
      try {
        localStorage.setItem('tarot_selection_cache', JSON.stringify({
          selectedCards: cards,
          selectionTimestamp,
          isReadingGenerated: false,
          aiReadingSession: null,
          isGfReading: currentData.isGfReading,
          lastSavedSessionId: null
        }));
      } catch (error) {
        console.warn('Failed to cache tarot selection to localStorage:', error);
      }
    }
  },

  setSelectedCardsForReading: (cards: TarotCard[]) => {
    // Preserve current reading context (gf vs user)
    const currentData = get().selectionData;

    // Set the new selection for reading
    if (cards.length === 6) {
      const selectionTimestamp = Date.now();

      set({
        selectionData: {
          selectedCards: cards,
          selectionTimestamp,
          isReadingGenerated: false,
          aiReadingSession: null, // Clear previous AI reading when new cards selected
          isGfReading: currentData.isGfReading,
          lastSavedSessionId: null
        },
        isLoading: false,
      });
      
      // Store in localStorage for persistence across sessions
      try {
        localStorage.setItem('tarot_selection_cache', JSON.stringify({
          selectedCards: cards,
          selectionTimestamp,
          isReadingGenerated: false,
          aiReadingSession: null,
          isGfReading: currentData.isGfReading,
          lastSavedSessionId: null
        }));
      } catch (error) {
        console.warn('Failed to cache tarot selection to localStorage:', error);
      }
    }
  },

  clearSelection: () => {
    set({
      selectionData: {
        selectedCards: [],
        selectionTimestamp: null,
        isReadingGenerated: false,
        aiReadingSession: null,
        isGfReading: false,
        lastSavedSessionId: null
      },
    });
    
    // Clear localStorage cache
    try {
      localStorage.removeItem('tarot_selection_cache');
    } catch (error) {
      console.warn('Failed to clear tarot selection from localStorage:', error);
    }
  },

  markReadingGenerated: () => {
    const currentData = get().selectionData;
    set({
      selectionData: {
        ...currentData,
        isReadingGenerated: true,
      },
    });
  },

  getSelectedCards: () => {
    const { selectionData } = get();
    
    // Try to restore from localStorage if no selection in memory
    if (selectionData.selectedCards.length === 0) {
      try {
        const cached = localStorage.getItem('tarot_selection_cache');
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (parsedCache.selectedCards && parsedCache.selectedCards.length === 6) {
            // Check if cache is not expired
            const cacheAge = Date.now() - parsedCache.selectionTimestamp;
            const maxAge = DEFAULT_CACHE_DURATION_MINUTES * 60 * 1000;
            
            if (cacheAge < maxAge) {
              // Restore valid cache to state with proper type safety
              set({
                selectionData: {
                  selectedCards: parsedCache.selectedCards,
                  selectionTimestamp: parsedCache.selectionTimestamp,
                  isReadingGenerated: parsedCache.isReadingGenerated || false,
                  aiReadingSession: parsedCache.aiReadingSession || null, // Default to null for backward compatibility
                  isGfReading: parsedCache.isGfReading || false,
                  lastSavedSessionId: parsedCache.lastSavedSessionId || null
                },
              });
              return parsedCache.selectedCards;
            } else {
              // Clear expired cache
              localStorage.removeItem('tarot_selection_cache');
            }
          }
        }
      } catch (error) {
        console.warn('Failed to restore tarot selection from localStorage:', error);
      }
    }
    
    return selectionData.selectedCards;
  },

  hasValidSelection: () => {
    const cards = get().getSelectedCards();
    return cards.length === 6;
  },

  getSelectionAge: () => {
    const { selectionData } = get();
    if (!selectionData.selectionTimestamp) return null;
    return Date.now() - selectionData.selectionTimestamp;
  },



  setAiReadingSession: (session: TarotReadingSession, isGf?: boolean) => {
    console.log('🔮 Storing AI tarot reading session:', session.sessionId);
    const currentData = get().selectionData;
    
    // Improved duplicate prevention - check session ID and if we already have a complete reading
    if (currentData.lastSavedSessionId === session.sessionId) {
      console.log('🔮 Session already processed, skipping duplicate save:', session.sessionId);
      return;
    }
    
    if (session.isComplete && currentData.aiReadingSession && currentData.aiReadingSession.sessionId === session.sessionId) {
      console.log('🔮 Complete session already stored, skipping duplicate save:', session.sessionId);
      return;
    }
    
    // Determine if this is a girlfriend's reading
    const isGfReading = isGf !== undefined ? isGf : currentData.isGfReading;
    
    set(state => ({
      selectionData: {
        ...state.selectionData,
        aiReadingSession: session,
        isReadingGenerated: true, // Mark reading as generated when AI session is stored
        isGfReading: isGfReading
      }
    }));
    
    // Also update localStorage with the new session
    try {
      const updatedData = get().selectionData;
      localStorage.setItem('tarot_selection_cache', JSON.stringify({
        selectedCards: updatedData.selectedCards,
        selectionTimestamp: updatedData.selectionTimestamp,
        isReadingGenerated: true,
        aiReadingSession: session,
        isGfReading: isGfReading,
        lastSavedSessionId: updatedData.lastSavedSessionId
      }));
    } catch (error) {
      console.warn('Failed to cache AI reading session to localStorage:', error);
    }

    // Automatically save to database when AI reading is complete
    if (session.isComplete && currentData.lastSavedSessionId !== session.sessionId) {
      console.log(`🔮 Automatically saving complete AI reading to database (isGf: ${isGfReading})`);
      
      // Get tarot cards data store and save the reading
      const tarotCardsStore = useTarotCardsDataStore.getState();
      tarotCardsStore.saveFromAiReading(session, isGfReading)
        .then((savedDeck) => {
          if (savedDeck) {
            console.log('🔮 Successfully saved AI reading to database:', savedDeck.id);
            // Mark this session as saved
            set(state => ({
              selectionData: {
                ...state.selectionData,
                lastSavedSessionId: session.sessionId
              }
            }));
          } else {
            console.warn('🔮 Failed to save AI reading to database');
          }
        })
        .catch((error) => {
          console.error('🔮 Error auto-saving AI reading to database:', error);
        });
    }
  },

  getAiReadingSession: () => {
    return get().selectionData.aiReadingSession;
  },

  clearAiReading: () => {
    console.log('🔮 Clearing AI tarot reading session');
    set(state => ({
      selectionData: {
        ...state.selectionData,
        aiReadingSession: null,
        isReadingGenerated: false,
        lastSavedSessionId: null
      }
    }));
    
    // Also clear from localStorage
    try {
      const currentData = get().selectionData;
      localStorage.setItem('tarot_selection_cache', JSON.stringify({
        selectedCards: currentData.selectedCards,
        selectionTimestamp: currentData.selectionTimestamp,
        isReadingGenerated: false,
        aiReadingSession: null,
        isGfReading: currentData.isGfReading,
        lastSavedSessionId: null
      }));
    } catch (error) {
      console.warn('Failed to clear AI reading from localStorage:', error);
    }
  },

  setReadingContext: (isGf: boolean) => {
    console.log(`🔮 Setting reading context: ${isGf ? 'girlfriend' : 'user'}`);
    set(state => ({
      selectionData: {
        ...state.selectionData,
        isGfReading: isGf
      }
    }));
  },

  getReadingContext: () => {
    return get().selectionData.isGfReading;
  },

  hasAiReading: () => {
    const session = get().selectionData.aiReadingSession;
    return session !== null && session.isComplete;
  },

  isSelectionExpired: (maxAgeMinutes: number = DEFAULT_CACHE_DURATION_MINUTES) => {
    const age = get().getSelectionAge();
    if (age === null) return true;
    return age > (maxAgeMinutes * 60 * 1000);
  },
}));