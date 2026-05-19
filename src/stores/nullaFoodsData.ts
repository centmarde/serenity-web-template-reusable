import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface NullaFoodsRecord {
  id: number;
  created_at: string;
  donuts: number | null;
  mousse: number | null;
  icecream: number | null;
  cupcake: number | null;
}

export interface CreateNullaFoodsInput {
  donuts?: number | null;
  mousse?: number | null;
  icecream?: number | null;
  cupcake?: number | null;
}

export interface UpdateNullaFoodsInput {
  donuts?: number | null;
  mousse?: number | null;
  icecream?: number | null;
  cupcake?: number | null;
}

interface NullaFoodsStore {
  foods: NullaFoodsRecord[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  fetchFoods: () => Promise<void>;
  createFoods: (input: CreateNullaFoodsInput) => Promise<NullaFoodsRecord>;
  updateFoods: (
    id: number,
    input: UpdateNullaFoodsInput,
  ) => Promise<NullaFoodsRecord>;
  deleteFoods: (id: number) => Promise<void>;
  getFoodsById: (id: number) => NullaFoodsRecord | undefined;
  getLatestFoods: () => NullaFoodsRecord | undefined;
  reset: () => void;
}

export const useNullaFoodsStore = create<NullaFoodsStore>((set, get) => ({
  foods: [],
  loading: false,
  error: null,
  isInitialized: false,

  fetchFoods: async () => {
    const { isInitialized, loading } = get();

    if (isInitialized || loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("nulla_foods")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      set({
        foods: (data || []) as NullaFoodsRecord[],
        loading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch foods data";
      set({ loading: false, error: errorMessage, isInitialized: false });
      throw new Error(errorMessage);
    }
  },

  createFoods: async (input: CreateNullaFoodsInput) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("nulla_foods")
        .insert([
          {
            donuts: input.donuts ?? null,
            mousse: input.mousse ?? null,
            icecream: input.icecream ?? null,
            cupcake: input.cupcake ?? null,
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
        foods: [data as NullaFoodsRecord, ...state.foods],
        loading: false,
        error: null,
      }));

      return data as NullaFoodsRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create foods record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateFoods: async (id: number, input: UpdateNullaFoodsInput) => {
    set({ loading: true, error: null });

    try {
      const updateData: UpdateNullaFoodsInput = {};

      if (input.donuts !== undefined) updateData.donuts = input.donuts;
      if (input.mousse !== undefined) updateData.mousse = input.mousse;
      if (input.icecream !== undefined) updateData.icecream = input.icecream;
      if (input.cupcake !== undefined) updateData.cupcake = input.cupcake;

      const { data, error } = await supabase
        .from("nulla_foods")
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
        foods: state.foods.map((record) =>
          record.id === id ? (data as NullaFoodsRecord) : record,
        ),
        loading: false,
        error: null,
      }));

      return data as NullaFoodsRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update foods record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteFoods: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from("nulla_foods")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      set((state) => ({
        foods: state.foods.filter((record) => record.id !== id),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete foods record";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getFoodsById: (id: number) => {
    return get().foods.find((record) => record.id === id);
  },

  getLatestFoods: () => {
    return get().foods[0];
  },

  reset: () => {
    set({ foods: [], loading: false, error: null, isInitialized: false });
  },
}));
