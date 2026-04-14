import { create } from 'zustand';
import type { TarotCard } from '../composables/tarotConstant';

interface TarotSelectionData {
  selectedCards: TarotCard[];
  selectionTimestamp: number | null;
  isReadingGenerated: boolean;
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
  
  // Cache validation
  isSelectionExpired: (maxAgeMinutes?: number) => boolean;
}

const DEFAULT_CACHE_DURATION_MINUTES = 60; // 1 hour cache

export const useTarotSelectionStore = create<TarotSelectionStore>((set, get) => ({
  selectionData: {
    selectedCards: [],
    selectionTimestamp: null,
    isReadingGenerated: false,
  },
  isLoading: false,

  setSelectedCards: (cards: TarotCard[]) => {
    if (cards.length === 6) {
      set({
        selectionData: {
          selectedCards: cards,
          selectionTimestamp: Date.now(),
          isReadingGenerated: false,
        },
        isLoading: false,
      });
      
      // Optional: Store in localStorage for persistence across sessions
      try {
        localStorage.setItem('tarot_selection_cache', JSON.stringify({
          selectedCards: cards,
          selectionTimestamp: Date.now(),
          isReadingGenerated: false,
        }));
      } catch (error) {
        console.warn('Failed to cache tarot selection to localStorage:', error);
      }
    }
  },

  setSelectedCardsForReading: (cards: TarotCard[]) => {
    // Clear any existing cache first to ensure fresh reading
    get().clearSelection();
    
    // Set the new selection for reading
    if (cards.length === 6) {
      set({
        selectionData: {
          selectedCards: cards,
          selectionTimestamp: Date.now(),
          isReadingGenerated: false,
        },
        isLoading: false,
      });
      
      // Store in localStorage for persistence across sessions
      try {
        localStorage.setItem('tarot_selection_cache', JSON.stringify({
          selectedCards: cards,
          selectionTimestamp: Date.now(),
          isReadingGenerated: false,
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
              // Restore valid cache to state
              set({
                selectionData: parsedCache,
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

  isSelectionExpired: (maxAgeMinutes: number = DEFAULT_CACHE_DURATION_MINUTES) => {
    const age = get().getSelectionAge();
    if (age === null) return true;
    return age > (maxAgeMinutes * 60 * 1000);
  },
}));