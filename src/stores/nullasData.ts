import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface NullaRecord {
  id: number;
  created_at: string;
  mode: string | null;
  last_eaten: string | null;
  eaten_duration: number | null;
  last_playing: string | null;
  playing_duration: number | null;
}

export interface CreateNullaInput {
  mode?: string | null;
  last_eaten?: string | null;
  eaten_duration?: number | null;
  last_playing?: string | null;
  playing_duration?: number | null;
}

export interface UpdateNullaInput {
  mode?: string | null;
  last_eaten?: string | null;
  eaten_duration?: number | null;
  last_playing?: string | null;
  playing_duration?: number | null;
}

interface NullasStore {
  nullas: NullaRecord[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  fetchNullas: () => Promise<void>;
  createNulla: (input: CreateNullaInput) => Promise<NullaRecord>;
  updateNulla: (id: number, input: UpdateNullaInput) => Promise<NullaRecord>;
  deleteNulla: (id: number) => Promise<void>;
  getNullaById: (id: number) => NullaRecord | undefined;
  getLatestNulla: () => NullaRecord | undefined;
  reset: () => void;
}

export const useNullasStore = create<NullasStore>((set, get) => ({
  nullas: [],
  loading: false,
  error: null,
  isInitialized: false,

  fetchNullas: async () => {
    const { isInitialized, loading } = get();

    if (isInitialized || loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("nulla")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      set({
        nullas: (data || []) as NullaRecord[],
        loading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch nulla data";
      set({ loading: false, error: errorMessage, isInitialized: false });
      throw new Error(errorMessage);
    }
  },

  createNulla: async (input: CreateNullaInput) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("nulla")
        .insert([
          {
            mode: input.mode ?? null,
            last_eaten: input.last_eaten ?? null,
            eaten_duration: input.eaten_duration ?? null,
            last_playing: input.last_playing ?? null,
            playing_duration: input.playing_duration ?? null,
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
        nullas: [data as NullaRecord, ...state.nullas],
        loading: false,
        error: null,
      }));

      return data as NullaRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create nulla record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateNulla: async (id: number, input: UpdateNullaInput) => {
    set({ loading: true, error: null });

    try {
      const updateData: UpdateNullaInput = {};

      if (input.mode !== undefined) updateData.mode = input.mode;
      if (input.last_eaten !== undefined)
        updateData.last_eaten = input.last_eaten;
      if (input.eaten_duration !== undefined)
        updateData.eaten_duration = input.eaten_duration;
      if (input.last_playing !== undefined)
        updateData.last_playing = input.last_playing;
      if (input.playing_duration !== undefined)
        updateData.playing_duration = input.playing_duration;

      const { data, error } = await supabase
        .from("nulla")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from update operation");
      }

      set((state) => ({
        nullas: state.nullas.map((record) =>
          record.id === id ? (data as NullaRecord) : record,
        ),
        loading: false,
        error: null,
      }));

      return data as NullaRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update nulla record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteNulla: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase.from("nulla").delete().eq("id", id);

      if (error) {
        throw error;
      }

      set((state) => ({
        nullas: state.nullas.filter((record) => record.id !== id),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete nulla record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getNullaById: (id: number) => {
    return get().nullas.find((record) => record.id === id);
  },

  getLatestNulla: () => {
    return get().nullas[0];
  },

  reset: () => {
    set({ nullas: [], loading: false, error: null, isInitialized: false });
  },
}));
