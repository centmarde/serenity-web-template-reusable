import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { MemoryMilestone } from './memoriesMilestoneData';
import type { MemoryImage } from './memoriesImagesData';

// Types based on memories table schema
export interface Memory {
  id: number;
  created_at: string;
  date: string | null;
  title: string | null;
  description: string | null;
}

// Extended memory interface with populated relations
export interface MemoryWithRelations extends Memory {
  milestones?: MemoryMilestone[];
  images?: MemoryImage[];
}

export interface CreateMemoryInput {
  date?: string;
  title: string;
  description?: string;
}

export interface UpdateMemoryInput {
  id: number;
  date?: string;
  title?: string;
  description?: string;
}

interface MemoriesStore {
  memories: Memory[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  canAddMemory: boolean | null; // null = checking, false = disabled, true = enabled
  latestMemoryId: number | null; // ID of the latest memory if it's less than 1 day old
  permissionsChecked: boolean; // tracks if permissions have been checked

  // Actions
  fetchMemories: () => Promise<void>;
  checkCanAddMemory: (forceRefresh?: boolean) => Promise<void>;
  createMemory: (input: CreateMemoryInput) => Promise<Memory>;
  updateMemory: (input: UpdateMemoryInput) => Promise<Memory>;
  deleteMemory: (id: number) => Promise<void>;
  getMemoryById: (id: number) => Memory | undefined;
  getMemoriesWithRelations: () => Promise<MemoryWithRelations[]>;
  getMemoriesByMilestone: (milestoneId: number) => Promise<Memory[]>;
  getMemoriesByDateRange: (startDate: string, endDate: string) => Memory[];
  clearError: () => void;
  reset: () => void;
}

export const useMemoriesStore = create<MemoriesStore>((set, get) => ({
  memories: [],
  loading: false,
  error: null,
  isInitialized: false,
  canAddMemory: null,
  latestMemoryId: null,
  permissionsChecked: false,

  fetchMemories: async () => {
    const { isInitialized, loading } = get();
    
    if (isInitialized || loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      set({ 
        memories: (data || []).sort((a, b) => 
          new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime()
        ), 
        loading: false, 
        isInitialized: true,
        error: null 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch memories';
      set({ 
        loading: false, 
        error: errorMessage,
        isInitialized: false 
      });
      throw new Error(errorMessage);
    }
  },

  createMemory: async (input: CreateMemoryInput) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memories')
        .insert([{
          date: input.date,
          title: input.title,
          description: input.description,
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
        memories: [...state.memories, data].sort((a, b) => 
          new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime()
        ),
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create memory';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateMemory: async (input: UpdateMemoryInput) => {
    set({ loading: true, error: null });

    try {
      const updateData: Partial<Pick<Memory, 'date' | 'title' | 'description'>> = {};
      
      if (input.date !== undefined) updateData.date = input.date;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;

      const { data, error } = await supabase
        .from('memories')
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
        memories: state.memories.map(m => m.id === input.id ? data : m)
          .sort((a, b) => 
            new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime()
          ),
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update memory';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteMemory: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      set(state => ({
        memories: state.memories.filter(m => m.id !== id),
        loading: false,
        error: null,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete memory';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getMemoryById: (id: number) => {
    return get().memories.find(m => m.id === id);
  },

  getMemoriesWithRelations: async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          milestones:memory_milestones!memory_milestones_memories_id_fkey(*),
          images:memory_images!memory_images_memories_id_fkey(*)
        `)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return data as MemoryWithRelations[] || [];

    } catch (error) {
      console.error('Failed to fetch memories with relations:', error);
      // Fallback to basic memories without relations
      return get().memories as MemoryWithRelations[];
    }
  },

  getMemoriesByMilestone: async (milestoneId: number) => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          milestones:memory_milestones!memory_milestones_memories_id_fkey(*)
        `)
        .eq('memory_milestones.id', milestoneId);

      if (error) {
        throw error;
      }

      return data as Memory[] || [];
    } catch (error) {
      console.error('Failed to fetch memories by milestone:', error);
      return [];
    }
  },

  getMemoriesByDateRange: (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return get().memories.filter(m => {
      if (!m.date) return false;
      const memoryDate = new Date(m.date);
      return memoryDate >= start && memoryDate <= end;
    });
  },

  checkCanAddMemory: async (forceRefresh: boolean = false) => {
    const { permissionsChecked } = get();
    
    // Skip if already checked and not forcing refresh
    if (permissionsChecked && !forceRefresh) {
      return;
    }

    try {
      // Fetch the latest memory ordered by created_at descending, limit 1
      const { data, error } = await supabase
        .from('memories')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        // No memories exist, allow adding
        set({ canAddMemory: true, latestMemoryId: null, permissionsChecked: true });
        return;
      }

      const latestMemory = data[0];
      const latestDate = new Date(latestMemory.created_at);
      const now = new Date();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const timeDiff = now.getTime() - latestDate.getTime();

      if (timeDiff > oneDayInMs) {
        // More than 1 day has passed, enable add button and allow delete
        set({ canAddMemory: true, latestMemoryId: null, permissionsChecked: true });
      } else {
        // Less than 1 day, disable add button and protect latest memory from delete
        set({ canAddMemory: false, latestMemoryId: latestMemory.id, permissionsChecked: true });
      }
    } catch (error) {
      console.error('Failed to check can add memory:', error);
      // On error, allow adding to not block the user
      set({ canAddMemory: true, latestMemoryId: null, permissionsChecked: true });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      memories: [],
      loading: false,
      error: null,
      isInitialized: false,
    });
  },
}));
