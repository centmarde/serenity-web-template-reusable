import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Types based on memory_milestones table schema
export interface MemoryMilestone {
  id: number;
  created_at: string;
  milestone: string | null;
  memories_id: number | null;
}

export interface CreateMemoryMilestoneInput {
  milestone: string;
  memories_id?: number;
}

export interface UpdateMemoryMilestoneInput {
  id: number;
  milestone?: string;
  memories_id?: number;
}

interface MemoryMilestonesStore {
  milestones: MemoryMilestone[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  fetchMilestones: () => Promise<void>;
  createMilestone: (input: CreateMemoryMilestoneInput) => Promise<MemoryMilestone>;
  updateMilestone: (input: UpdateMemoryMilestoneInput) => Promise<MemoryMilestone>;
  deleteMilestone: (id: number) => Promise<void>;
  getMilestoneById: (id: number) => MemoryMilestone | undefined;
  linkMilestoneToMemory: (milestoneId: number, memoryId: number) => Promise<MemoryMilestone>;
  unlinkMilestoneFromMemory: (milestoneId: number) => Promise<MemoryMilestone>;
  getMilestonesByMemory: (memoryId: number) => MemoryMilestone[];
  clearError: () => void;
  reset: () => void;
}



export const useMemoryMilestonesStore = create<MemoryMilestonesStore>((set, get) => ({
  milestones: [],
  loading: false,
  error: null,
  isInitialized: false,

  fetchMilestones: async () => {
    const { isInitialized, loading } = get();
    
    if (isInitialized || loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memory_milestones')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      set({ 
        milestones: data || [], 
        loading: false, 
        isInitialized: true,
        error: null 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch milestones';
      set({ 
        loading: false, 
        error: errorMessage,
        isInitialized: false 
      });
      throw new Error(errorMessage);
    }
  },

  createMilestone: async (input: CreateMemoryMilestoneInput) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memory_milestones')
        .insert([{ 
          milestone: input.milestone,
          memories_id: input.memories_id 
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from create operation');
      }

      set(state => ({
        milestones: [...state.milestones, data],
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create milestone';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateMilestone: async (input: UpdateMemoryMilestoneInput) => {
    set({ loading: true, error: null });

    try {
      const updateData: Partial<Pick<MemoryMilestone, 'milestone' | 'memories_id'>> = {};
      if (input.milestone !== undefined) {
        updateData.milestone = input.milestone;
      }
      if (input.memories_id !== undefined) {
        updateData.memories_id = input.memories_id;
      }

      const { data, error } = await supabase
        .from('memory_milestones')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      set(state => ({
        milestones: state.milestones.map(m => m.id === input.id ? data : m),
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update milestone';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteMilestone: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('memory_milestones')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      set(state => ({
        milestones: state.milestones.filter(m => m.id !== id),
        loading: false,
        error: null,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete milestone';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getMilestoneById: (id: number) => {
    return get().milestones.find(m => m.id === id);
  },

  linkMilestoneToMemory: async (milestoneId: number, memoryId: number) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memory_milestones')
        .update({ memories_id: memoryId })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from link operation');
      }

      set(state => ({
        milestones: state.milestones.map(m => m.id === milestoneId ? data : m),
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to link milestone to memory';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  unlinkMilestoneFromMemory: async (milestoneId: number) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memory_milestones')
        .update({ memories_id: null })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from unlink operation');
      }

      set(state => ({
        milestones: state.milestones.map(m => m.id === milestoneId ? data : m),
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlink milestone from memory';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getMilestonesByMemory: (memoryId: number) => {
    return get().milestones.filter(m => m.memories_id === memoryId);
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      milestones: [],
      loading: false,
      error: null,
      isInitialized: false,
    });
  },
}));
