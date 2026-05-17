import { create } from "zustand";
import type { TarotReadingSession } from "../lib/AiTarotReading";
import {
  calculateEndDate,
  formatDisplayDate,
  formatDisplayTime,
} from "../pages/tarotCards/utils/helpers";
import { supabase } from "../lib/supabase";

// Types matching the database schema
export interface TarotCardData {
  name: string;
  aiDescription: string; // Store AI interpretation instead of original description
  [key: string]: string | number | boolean | null | undefined; // Allow additional properties for JSONB flexibility
}

export interface TarotCardsDeck {
  id: number;
  created_at: string;
  is_gf: boolean | null;
  end_date: string | null;
  card1: TarotCardData | null;
  card2: TarotCardData | null;
  card3: TarotCardData | null;
  card4: TarotCardData | null;
  card5: TarotCardData | null;
  card6: TarotCardData | null;
}

export interface CreateTarotCardsDeckInput {
  is_gf?: boolean | null;
  end_date?: string | null;
  card1?: TarotCardData | null;
  card2?: TarotCardData | null;
  card3?: TarotCardData | null;
  card4?: TarotCardData | null;
  card5?: TarotCardData | null;
  card6?: TarotCardData | null;
}

export interface UpdateTarotCardsDeckInput extends CreateTarotCardsDeckInput {
  id: number;
}

interface TarotCardsDataState {
  // State
  decks: TarotCardsDeck[];
  currentDeck: TarotCardsDeck | null;
  isLoading: boolean;
  error: string | null;

  // CRUD Actions
  createDeck: (
    deck: CreateTarotCardsDeckInput,
  ) => Promise<TarotCardsDeck | null>;
  getDeck: (id: number) => Promise<TarotCardsDeck | null>;
  getAllDecks: () => Promise<TarotCardsDeck[]>;
  updateDeck: (
    deck: UpdateTarotCardsDeckInput,
  ) => Promise<TarotCardsDeck | null>;
  deleteDeck: (id: number) => Promise<boolean>;

  // Utility Actions
  setCurrentDeck: (deck: TarotCardsDeck | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // Filtering Actions
  getMyDecks: () => Promise<TarotCardsDeck[]>;
  getGfDecks: () => Promise<TarotCardsDeck[]>;
  getRecentDecks: (limit?: number) => Promise<TarotCardsDeck[]>;

  // AI Reading Integration
  saveFromAiReading: (
    session: TarotReadingSession,
    isGf?: boolean,
  ) => Promise<TarotCardsDeck | null>;
}

export const useTarotCardsDataStore = create<TarotCardsDataState>(
  (set, get) => ({
    // Initial State
    decks: [],
    currentDeck: null,
    isLoading: false,
    error: null,

    // CRUD Operations
    createDeck: async (deckData: CreateTarotCardsDeckInput) => {
      set({ isLoading: true, error: null });

      try {
        const createdAt = new Date().toISOString();
        const insertData = {
          // IMPORTANT: use nullish coalescing so `false` is preserved (not turned into null)
          is_gf: deckData.is_gf ?? null,
          end_date: deckData.end_date || calculateEndDate(createdAt),
          card1: deckData.card1 || null,
          card2: deckData.card2 || null,
          card3: deckData.card3 || null,
          card4: deckData.card4 || null,
          card5: deckData.card5 || null,
          card6: deckData.card6 || null,
        };

        const { data, error } = await supabase
          .from("tarot_cards_decks")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        if (!data) {
          throw new Error("No data returned from database");
        }

        // Add to local state
        const currentDecks = get().decks;
        set({
          decks: [...currentDecks, data],
          currentDeck: data,
          isLoading: false,
        });

        console.log("🔮 Created deck in database:", data.id);
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create deck";
        console.error("🔮 Error creating deck:", error);
        set({ error: errorMessage, isLoading: false });
        return null;
      }
    },

    getDeck: async (id: number) => {
      set({ isLoading: true, error: null });

      try {
        // Check local state first
        const existingDeck = get().decks.find((deck) => deck.id === id);

        if (existingDeck) {
          set({ currentDeck: existingDeck, isLoading: false });
          return existingDeck;
        }

        // Fetch from database if not found locally
        const { data, error } = await supabase
          .from("tarot_cards_decks")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            set({ error: "Deck not found", isLoading: false });
            return null;
          }
          throw new Error(`Database error: ${error.message}`);
        }

        if (data) {
          set({ currentDeck: data, isLoading: false });
          return data;
        }

        set({ error: "Deck not found", isLoading: false });
        return null;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get deck";
        console.error("🔮 Error getting deck:", error);
        set({ error: errorMessage, isLoading: false });
        return null;
      }
    },

    getAllDecks: async () => {
      set({ isLoading: true, error: null });

      try {
        const { data, error } = await supabase
          .from("tarot_cards_decks")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        const decks = data || [];
        set({ decks, isLoading: false });

        console.log(`🔮 Loaded ${decks.length} decks from database`);
        return decks;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get decks";
        console.error("🔮 Error getting decks:", error);
        set({ error: errorMessage, isLoading: false });
        return [];
      }
    },

    updateDeck: async (deckData: UpdateTarotCardsDeckInput) => {
      set({ isLoading: true, error: null });

      try {
        const updateData: Partial<CreateTarotCardsDeckInput> = {};

        // Only include defined fields in update
        if (deckData.is_gf !== undefined) updateData.is_gf = deckData.is_gf;
        if (deckData.end_date !== undefined)
          updateData.end_date = deckData.end_date;
        if (deckData.card1 !== undefined) updateData.card1 = deckData.card1;
        if (deckData.card2 !== undefined) updateData.card2 = deckData.card2;
        if (deckData.card3 !== undefined) updateData.card3 = deckData.card3;
        if (deckData.card4 !== undefined) updateData.card4 = deckData.card4;
        if (deckData.card5 !== undefined) updateData.card5 = deckData.card5;
        if (deckData.card6 !== undefined) updateData.card6 = deckData.card6;

        const { data, error } = await supabase
          .from("tarot_cards_decks")
          .update(updateData)
          .eq("id", deckData.id)
          .select()
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            set({ error: "Deck not found", isLoading: false });
            return null;
          }
          throw new Error(`Database error: ${error.message}`);
        }

        if (!data) {
          throw new Error("No data returned from database");
        }

        // Update local state
        const currentDecks = get().decks;
        const updatedDecks = currentDecks.map((deck) =>
          deck.id === deckData.id ? data : deck,
        );

        set({
          decks: updatedDecks,
          currentDeck:
            get().currentDeck?.id === deckData.id ? data : get().currentDeck,
          isLoading: false,
        });

        console.log("🔮 Updated deck in database:", data.id);
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update deck";
        console.error("🔮 Error updating deck:", error);
        set({ error: errorMessage, isLoading: false });
        return null;
      }
    },

    deleteDeck: async (id: number) => {
      set({ isLoading: true, error: null });

      try {
        const { error } = await supabase
          .from("tarot_cards_decks")
          .delete()
          .eq("id", id);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        // Update local state
        const currentDecks = get().decks;
        const filteredDecks = currentDecks.filter((deck) => deck.id !== id);

        set({
          decks: filteredDecks,
          currentDeck: get().currentDeck?.id === id ? null : get().currentDeck,
          isLoading: false,
        });

        console.log("🔮 Deleted deck from database:", id);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete deck";
        console.error("🔮 Error deleting deck:", error);
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    // Utility Actions
    setCurrentDeck: (deck: TarotCardsDeck | null) => {
      set({ currentDeck: deck });
    },

    clearError: () => {
      set({ error: null });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    // Filtering Actions
    getMyDecks: async () => {
      set({ isLoading: true, error: null });

      try {
        const { data, error } = await supabase
          .from("tarot_cards_decks")
          .select("*")
          .or("is_gf.is.null,is_gf.eq.false")
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        const decks = data || [];
        set({ isLoading: false });

        console.log(`🔮 Loaded ${decks.length} user decks from database`);
        return decks;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get my decks";
        console.error("🔮 Error getting my decks:", error);
        set({ error: errorMessage, isLoading: false });
        return [];
      }
    },

    getGfDecks: async () => {
      set({ isLoading: true, error: null });

      try {
        const { data, error } = await supabase
          .from("tarot_cards_decks")
          .select("*")
          .eq("is_gf", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        const decks = data || [];
        set({ isLoading: false });

        console.log(`🔮 Loaded ${decks.length} girlfriend decks from database`);
        return decks;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to get girlfriend decks";
        console.error("🔮 Error getting girlfriend decks:", error);
        set({ error: errorMessage, isLoading: false });
        return [];
      }
    },

    getRecentDecks: async (limit: number = 10) => {
      set({ isLoading: true, error: null });

      try {
        const { data, error } = await supabase
          .from("tarot_cards_decks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        const decks = data || [];
        set({ isLoading: false });

        console.log(`🔮 Loaded ${decks.length} recent decks from database`);
        return decks;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get recent decks";
        console.error("🔮 Error getting recent decks:", error);
        set({ error: errorMessage, isLoading: false });
        return [];
      }
    },

    // AI Reading Integration
    saveFromAiReading: async (
      session: TarotReadingSession,
      isGf: boolean = false,
    ) => {
      set({ isLoading: true, error: null });

      try {
        // Convert AI reading session to deck format
        const createdAt = new Date(session.createdAt).toISOString();
        const endDate = calculateEndDate(createdAt);

        // Transform AI readings to TarotCardData format
        const cards: (TarotCardData | null)[] = [];

        // Ensure we have exactly 6 cards
        for (let i = 0; i < 6; i++) {
          const reading = session.readings.find((r) => r.cardIndex === i);
          if (reading) {
            cards.push({
              name: reading.cardName,
              aiDescription: reading.aiInterpretation,
            });
          } else {
            cards.push(null);
          }
        }

        // Create deck data
        const deckData: CreateTarotCardsDeckInput = {
          is_gf: isGf,
          end_date: endDate,
          card1: cards[0],
          card2: cards[1],
          card3: cards[2],
          card4: cards[3],
          card5: cards[4],
          card6: cards[5],
        };

        // Use existing createDeck method
        const result = await get().createDeck(deckData);

        console.log(
          `🔮 Saved AI reading session ${session.sessionId} to database:`,
          result,
        );

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to save AI reading to database";
        console.error("🔮 Error saving AI reading to database:", error);
        set({ error: errorMessage, isLoading: false });
        return null;
      }
    },
  }),
);

// Helper functions for working with tarot cards
export const useTarotCardsHelpers = () => {
  const store = useTarotCardsDataStore();

  return {
    // Save AI reading session to database
    saveAiReadingToDatabase: async (
      session: TarotReadingSession,
      isGf?: boolean,
    ) => {
      return await store.saveFromAiReading(session, isGf);
    },

    // Save current tarot reading to database (legacy support)
    saveCurrentReading: async (cards: TarotCardData[], isGf?: boolean) => {
      const deckData: CreateTarotCardsDeckInput = {
        is_gf: isGf || false,
        card1: cards[0] || null,
        card2: cards[1] || null,
        card3: cards[2] || null,
        card4: cards[3] || null,
        card5: cards[4] || null,
        card6: cards[5] || null,
      };

      return await store.createDeck(deckData);
    },

    // Get all cards from a deck as array
    getCardsFromDeck: (deck: TarotCardsDeck): TarotCardData[] => {
      return [
        deck.card1,
        deck.card2,
        deck.card3,
        deck.card4,
        deck.card5,
        deck.card6,
      ].filter(Boolean) as TarotCardData[];
    },

    // Check if deck has complete reading (6 cards)
    isCompleteReading: (deck: TarotCardsDeck): boolean => {
      return !!(
        deck.card1 &&
        deck.card2 &&
        deck.card3 &&
        deck.card4 &&
        deck.card5 &&
        deck.card6
      );
    },

    // Format deck for display
    formatDeckForDisplay: (deck: TarotCardsDeck) => ({
      id: deck.id,
      date: formatDisplayDate(deck.created_at),
      time: formatDisplayTime(deck.created_at),
      endDate: deck.end_date ? formatDisplayDate(deck.end_date) : null,
      isGf: deck.is_gf,
      cardCount: [
        deck.card1,
        deck.card2,
        deck.card3,
        deck.card4,
        deck.card5,
        deck.card6,
      ].filter(Boolean).length,
      isComplete: !!(
        deck.card1 &&
        deck.card2 &&
        deck.card3 &&
        deck.card4 &&
        deck.card5 &&
        deck.card6
      ),
      isAiReading: !!deck.card1?.aiDescription, // Check if this is an AI reading
    }),

    // Get display description (AI or fallback)
    getCardDescription: (card: TarotCardData | null): string => {
      if (!card) return "";
      return card.aiDescription || "No AI interpretation available";
    },
  };
};
