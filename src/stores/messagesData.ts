import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Types
export interface LoveLetter {
  id?: number;
  created_at?: string;
  title?: string;
  message?: string;
  user_id?: string;
  category?: string;
  is_girlfriend?: boolean;
}

export interface LoveLetterCreate {
  title?: string;
  message?: string;
  category?: string;
  is_girlfriend?: boolean;
}

export interface LoveLetterUpdate {
  title?: string;
  message?: string;
  category?: string;
  is_girlfriend?: boolean;
}

interface MessagesState {
  // State
  letters: LoveLetter[];
  currentLetter: LoveLetter | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLetters: (letters: LoveLetter[]) => void;
  setCurrentLetter: (letter: LoveLetter | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD Operations
  fetchLetters: () => Promise<void>;
  fetchLetterById: (id: number) => Promise<LoveLetter | null>;
  createLetter: (letter: LoveLetterCreate) => Promise<LoveLetter | null>;
  updateLetter: (id: number, updates: LoveLetterUpdate) => Promise<LoveLetter | null>;
  deleteLetter: (id: number) => Promise<boolean>;

  // Utility methods
  getLettersByCategory: (category: string) => LoveLetter[];
  getLettersByGirlfriend: (isGirlfriend: boolean) => LoveLetter[];
  clearError: () => void;
  reset: () => void;
}

const useMessagesStore = create<MessagesState>((set, get) => ({
  // Initial state
  letters: [],
  currentLetter: null,
  isLoading: false,
  error: null,

  // Basic setters
  setLetters: (letters) => set({ letters }),
  setCurrentLetter: (letter) => set({ currentLetter: letter }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // CRUD Operations
  fetchLetters: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('love_letters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        letters: data || [], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching letters:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch letters',
        isLoading: false 
      });
    }
  },

  fetchLetterById: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('love_letters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      set({ 
        currentLetter: data,
        isLoading: false 
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching letter by ID:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch letter',
        isLoading: false 
      });
      return null;
    }
  },

  createLetter: async (letter: LoveLetterCreate) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('love_letters')
        .insert([letter])
        .select()
        .single();

      if (error) throw error;

      // Add the new letter to the beginning of the list
      const { letters } = get();
      set({ 
        letters: [data, ...letters],
        currentLetter: data,
        isLoading: false 
      });
      
      return data;
    } catch (error) {
      console.error('Error creating letter:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create letter',
        isLoading: false 
      });
      return null;
    }
  },

  updateLetter: async (id: number, updates: LoveLetterUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('love_letters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update the letter in the list
      const { letters } = get();
      const updatedLetters = letters.map(letter => 
        letter.id === id ? data : letter
      );
      
      set({ 
        letters: updatedLetters,
        currentLetter: data,
        isLoading: false 
      });
      
      return data;
    } catch (error) {
      console.error('Error updating letter:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update letter',
        isLoading: false 
      });
      return null;
    }
  },

  deleteLetter: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('love_letters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove the letter from the list
      const { letters } = get();
      const filteredLetters = letters.filter(letter => letter.id !== id);
      
      set({ 
        letters: filteredLetters,
        currentLetter: null,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting letter:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete letter',
        isLoading: false 
      });
      return false;
    }
  },

  // Utility methods
  getLettersByCategory: (category: string) => {
    const { letters } = get();
    return letters.filter(letter => letter.category === category);
  },

  getLettersByGirlfriend: (isGirlfriend: boolean) => {
    const { letters } = get();
    return letters.filter(letter => letter.is_girlfriend === isGirlfriend);
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    letters: [],
    currentLetter: null,
    isLoading: false,
    error: null
  })
}));

export default useMessagesStore;