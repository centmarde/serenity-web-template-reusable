import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface NullaToysRecord {
  id: number;
  created_at: string;
  mouse: number | null;
  softblocks: number | null;
  plushdino: number | null;
  crystalball: number | null;
}

export interface CreateNullaToysInput {
  mouse?: number | null;
  softblocks?: number | null;
  plushdino?: number | null;
  crystalball?: number | null;
}

export interface UpdateNullaToysInput {
  mouse?: number | null;
  softblocks?: number | null;
  plushdino?: number | null;
  crystalball?: number | null;
}

interface NullaToysStore {
  toys: NullaToysRecord[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  fetchToys: () => Promise<void>;
  createToys: (input: CreateNullaToysInput) => Promise<NullaToysRecord>;
  updateToys: (
    id: number,
    input: UpdateNullaToysInput,
  ) => Promise<NullaToysRecord>;
  deleteToys: (id: number) => Promise<void>;
  getToysById: (id: number) => NullaToysRecord | undefined;
  getLatestToys: () => NullaToysRecord | undefined;
  reset: () => void;
}

export const useNullaToysStore = create<NullaToysStore>((set, get) => ({
  toys: [],
  loading: false,
  error: null,
  isInitialized: false,

  fetchToys: async () => {
    const { isInitialized, loading } = get();

    if (isInitialized || loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("nulla_toys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      set({
        toys: (data || []) as NullaToysRecord[],
        loading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch toys data";
      set({ loading: false, error: errorMessage, isInitialized: false });
      throw new Error(errorMessage);
    }
  },

  createToys: async (input: CreateNullaToysInput) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("nulla_toys")
        .insert([
          {
            mouse: input.mouse ?? null,
            softblocks: input.softblocks ?? null,
            plushdino: input.plushdino ?? null,
            crystalball: input.crystalball ?? null,
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
        toys: [data as NullaToysRecord, ...state.toys],
        loading: false,
        error: null,
      }));

      return data as NullaToysRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create toys record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateToys: async (id: number, input: UpdateNullaToysInput) => {
    set({ loading: true, error: null });

    try {
      const updateData: UpdateNullaToysInput = {};

      if (input.mouse !== undefined) updateData.mouse = input.mouse;
      if (input.softblocks !== undefined)
        updateData.softblocks = input.softblocks;
      if (input.plushdino !== undefined) updateData.plushdino = input.plushdino;
      if (input.crystalball !== undefined)
        updateData.crystalball = input.crystalball;

      const { data, error } = await supabase
        .from("nulla_toys")
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
        toys: state.toys.map((record) =>
          record.id === id ? (data as NullaToysRecord) : record,
        ),
        loading: false,
        error: null,
      }));

      return data as NullaToysRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update toys record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteToys: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase.from("nulla_toys").delete().eq("id", id);

      if (error) {
        throw error;
      }

      set((state) => ({
        toys: state.toys.filter((record) => record.id !== id),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete toys record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getToysById: (id: number) => {
    return get().toys.find((record) => record.id === id);
  },

  getLatestToys: () => {
    return get().toys[0];
  },

  reset: () => {
    set({ toys: [], loading: false, error: null, isInitialized: false });
  },
}));
