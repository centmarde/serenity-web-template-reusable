import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemoryMeshStore } from "./memoryMeshData";

const MAX_CONVERSATION_MESSAGES = 10;

type ChatRole = "user" | "ai";

export interface CachedChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  created_at: string;
}

const createMessageId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isInterestingConversation = (
  userText: string,
  aiText: string,
): boolean => {
  const combined = `${userText} ${aiText}`.toLowerCase();
  if (combined.length >= 160) return true;

  const keywords = [
    "remember",
    "favorite",
    "important",
    "always",
    "never",
    "dream",
    "plan",
    "goal",
    "birthday",
    "anniversary",
    "love",
    "family",
    "school",
    "work",
    "pet",
    "name",
  ];

  return keywords.some((keyword) => combined.includes(keyword));
};

interface NullaChatState {
  lastAiMessage: string | null;
  conversation: CachedChatMessage[];
  setLastAiMessage: (message: string) => void;
  addUserMessage: (message: string) => void;
  addAiMessage: (message: string) => void;
  addConversationPair: (userMessage: string, aiMessage: string) => void;
  storeLongTermMemory: (userMessage: string, aiMessage: string) => void;
  getConversationContext: () => string;
  clearConversation: () => void;
  clearLastAiMessage: () => void;
}

export const useNullaChatStore = create<NullaChatState>()(
  persist(
    (set, get) => ({
      lastAiMessage: null,
      conversation: [],
      setLastAiMessage: (message: string) => set({ lastAiMessage: message }),
      addUserMessage: (message: string) =>
        set((state) => {
          const nextMessage: CachedChatMessage = {
            id: createMessageId(),
            role: "user",
            text: message,
            created_at: new Date().toISOString(),
          };

          return {
            conversation: [...state.conversation, nextMessage].slice(
              -MAX_CONVERSATION_MESSAGES,
            ),
          };
        }),
      addAiMessage: (message: string) =>
        set((state) => {
          const nextMessage: CachedChatMessage = {
            id: createMessageId(),
            role: "ai",
            text: message,
            created_at: new Date().toISOString(),
          };

          return {
            lastAiMessage: message,
            conversation: [...state.conversation, nextMessage].slice(
              -MAX_CONVERSATION_MESSAGES,
            ),
          };
        }),
      addConversationPair: (userMessage: string, aiMessage: string) => {
        if (isInterestingConversation(userMessage, aiMessage)) {
          const { createEntry } = useMemoryMeshStore.getState();
          void createEntry({
            user_chat: userMessage,
            ai_chat: aiMessage,
          }).catch((error) => {
            console.error("Failed to store memory mesh entry:", error);
          });
        }

        set((state) => {
          const nextMessages: CachedChatMessage[] = [
            {
              id: createMessageId(),
              role: "user",
              text: userMessage,
              created_at: new Date().toISOString(),
            },
            {
              id: createMessageId(),
              role: "ai",
              text: aiMessage,
              created_at: new Date().toISOString(),
            },
          ];

          return {
            lastAiMessage: aiMessage,
            conversation: [...state.conversation, ...nextMessages].slice(
              -MAX_CONVERSATION_MESSAGES,
            ),
          };
        });
      },
      storeLongTermMemory: (userMessage: string, aiMessage: string) => {
        if (!isInterestingConversation(userMessage, aiMessage)) return;
        const { createEntry } = useMemoryMeshStore.getState();
        void createEntry({ user_chat: userMessage, ai_chat: aiMessage }).catch(
          (error) => {
            console.error("Failed to store memory mesh entry:", error);
          },
        );
      },
      getConversationContext: () => {
        const { conversation } = get();
        if (conversation.length === 0) return "";

        return conversation
          .map((message) =>
            message.role === "user"
              ? `User: ${message.text}`
              : `Nulla: ${message.text}`,
          )
          .join("\n");
      },
      clearConversation: () => set({ conversation: [] }),
      clearLastAiMessage: () => set({ lastAiMessage: null }),
    }),
    {
      name: "nulla-chat-cache",
      partialize: (state) => ({
        lastAiMessage: state.lastAiMessage,
        conversation: state.conversation,
      }),
    },
  ),
);
