import { create } from "zustand";
import { supabase } from "../lib/supabase";

// Types based on memory_mesh table schema
export interface MemoryMeshEntry {
  id: number;
  created_at: string;
  user_chat: string | null;
  ai_chat: string | null;
}

export interface CreateMemoryMeshInput {
  user_chat?: string | null;
  ai_chat?: string | null;
}

export interface UpdateMemoryMeshInput {
  id: number;
  user_chat?: string | null;
  ai_chat?: string | null;
}

interface MemoryMeshStore {
  entries: MemoryMeshEntry[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  fetchEntries: () => Promise<void>;
  fetchEntryById: (id: number) => Promise<MemoryMeshEntry | null>;
  createEntry: (input: CreateMemoryMeshInput) => Promise<MemoryMeshEntry>;
  updateEntry: (input: UpdateMemoryMeshInput) => Promise<MemoryMeshEntry>;
  deleteEntry: (id: number) => Promise<void>;
  deleteAllEntries: () => Promise<void>;
  getEntryById: (id: number) => MemoryMeshEntry | undefined;
  clearError: () => void;
  reset: () => void;
}

export const useMemoryMeshStore = create<MemoryMeshStore>((set, get) => ({
  entries: [],
  loading: false,
  error: null,
  isInitialized: false,

  fetchEntries: async () => {
    const { isInitialized, loading } = get();

    if (isInitialized || loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("memory_mesh")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      set({
        entries: data || [],
        loading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch memory mesh entries";
      set({ loading: false, error: errorMessage, isInitialized: false });
      throw new Error(errorMessage);
    }
  },

  fetchEntryById: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("memory_mesh")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      set({ loading: false, error: null });
      return data ?? null;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch memory mesh entry";
      set({ loading: false, error: errorMessage });
      return null;
    }
  },

  createEntry: async (input: CreateMemoryMeshInput) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("memory_mesh")
        .insert([
          {
            user_chat: input.user_chat ?? null,
            ai_chat: input.ai_chat ?? null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from create operation");
      }

      set((state) => ({
        entries: [data, ...state.entries],
        loading: false,
        error: null,
      }));

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create memory mesh entry";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateEntry: async (input: UpdateMemoryMeshInput) => {
    set({ loading: true, error: null });

    try {
      const updateData: Partial<
        Pick<MemoryMeshEntry, "user_chat" | "ai_chat">
      > = {};
      if (input.user_chat !== undefined) {
        updateData.user_chat = input.user_chat;
      }
      if (input.ai_chat !== undefined) {
        updateData.ai_chat = input.ai_chat;
      }

      const { data, error } = await supabase
        .from("memory_mesh")
        .update(updateData)
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from update operation");
      }

      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === input.id ? data : entry,
        ),
        loading: false,
        error: null,
      }));

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update memory mesh entry";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteEntry: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from("memory_mesh")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete memory mesh entry";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteAllEntries: async () => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from("memory_mesh")
        .delete()
        .neq("id", -1);

      if (error) {
        throw error;
      }

      set({
        entries: [],
        loading: false,
        error: null,
        isInitialized: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete memory mesh entries";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getEntryById: (id: number) => {
    return get().entries.find((entry) => entry.id === id);
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      entries: [],
      loading: false,
      error: null,
      isInitialized: false,
    }),
}));
