import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Thought {
  id: number;
  created_at: string;
  end_date: string | null;
  content: string | null;
  is_gf: boolean | null;
}

export interface CreateThoughtInput {
  content: string;
  is_gf: boolean;
  end_date?: string | null;
}

export interface UpdateThoughtInput {
  content?: string;
  is_gf?: boolean;
  end_date?: string | null;
}

interface ThoughtsStore {
  thoughts: Thought[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  subscription: RealtimeChannel | null;

  // Actions
  initializeThoughts: () => Promise<void>;
  createThought: (input: CreateThoughtInput) => Promise<Thought | null>;
  getThoughts: () => Promise<Thought[]>;
  getThoughtsByType: (isGf: boolean) => Promise<Thought[]>;
  updateThought: (id: number, input: UpdateThoughtInput) => Promise<Thought | null>;
  deleteThought: (id: number) => Promise<boolean>;
  clearThoughts: () => void;
  unsubscribe: () => void;
  
  // Utility methods
  getGfThoughts: () => Thought[];
  getBfThoughts: () => Thought[];
  getAllThoughts: () => Thought[];
  refreshThoughts: () => Promise<void>;
}

export const useThoughtsStore = create<ThoughtsStore>((set, get) => ({
  thoughts: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  subscription: null,

  initializeThoughts: async () => {
    const { isLoading, isInitialized } = get();
    
    if (isInitialized || isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch thoughts: ${error.message}`);
      }

      set({ 
        thoughts: data || [], 
        isInitialized: true, 
        isLoading: false,
        error: null
      });

      // Set up simple real-time subscription
      const subscription = supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'thoughts' },
          (payload) => {
            console.log('Change received!', payload);
          }
        )
        .subscribe();

      // Store subscription for cleanup
      set({ subscription });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize thoughts';
      set({ 
        isLoading: false, 
        error: errorMessage,
        isInitialized: false 
      });
      throw new Error(errorMessage);
    }
  },

  createThought: async (input: CreateThoughtInput) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('thoughts')
        .insert([{
          content: input.content,
          is_gf: input.is_gf,
          end_date: input.end_date ?? null
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create thought: ${error.message}`);
      }

      set({ isLoading: false, error: null });
      return data as Thought;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create thought';
      set({ isLoading: false, error: errorMessage });
      return null;
    }
  },

  getThoughts: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch thoughts: ${error.message}`);
      }

      const thoughts = data || [];
      set({ thoughts, isLoading: false, error: null });
      return thoughts;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch thoughts';
      set({ isLoading: false, error: errorMessage });
      return [];
    }
  },

  getThoughtsByType: async (isGf: boolean) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('is_gf', isGf)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch ${isGf ? 'girlfriend' : 'boyfriend'} thoughts: ${error.message}`);
      }

      set({ isLoading: false, error: null });
      return data || [];

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${isGf ? 'girlfriend' : 'boyfriend'} thoughts`;
      set({ isLoading: false, error: errorMessage });
      return [];
    }
  },

  updateThought: async (id: number, input: UpdateThoughtInput) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('thoughts')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update thought: ${error.message}`);
      }

      set({ isLoading: false, error: null });
      return data as Thought;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update thought';
      set({ isLoading: false, error: errorMessage });
      return null;
    }
  },

  deleteThought: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete thought: ${error.message}`);
      }

      set({ isLoading: false, error: null });
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete thought';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  clearThoughts: () => {
    set({ thoughts: [], error: null });
  },

  // Subscription cleanup
  unsubscribe: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  // Utility methods
  getGfThoughts: () => {
    return get().thoughts.filter(thought => thought.is_gf === true);
  },

  getBfThoughts: () => {
    return get().thoughts.filter(thought => thought.is_gf === false);
  },

  getAllThoughts: () => {
    return get().thoughts;
  },

  refreshThoughts: async () => {
    await get().getThoughts();
  }
}));

// Helper functions for easier usage
export const useGfThoughts = () => {
  const { getGfThoughts, isLoading, error, isInitialized, subscription } = useThoughtsStore();
  return {
    gfThoughts: getGfThoughts(),
    isLoading,
    error,
    isRealtimeActive: isInitialized && subscription !== null
  };
};

export const useBfThoughts = () => {
  const { getBfThoughts, isLoading, error, isInitialized, subscription } = useThoughtsStore();
  return {
    bfThoughts: getBfThoughts(),
    isLoading,
    error,
    isRealtimeActive: isInitialized && subscription !== null
  };
};

export const useAllThoughts = () => {
  const { getAllThoughts, isLoading, error, isInitialized, subscription } = useThoughtsStore();
  return {
    allThoughts: getAllThoughts(),
    isLoading,
    error,
    isRealtimeActive: isInitialized && subscription !== null
  };
};

// Hook for real-time status
export const useRealtimeStatus = () => {
  const { isInitialized, subscription } = useThoughtsStore();
  return {
    isRealtimeActive: isInitialized && subscription !== null,
    isInitialized
  };
};