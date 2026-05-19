import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Minus, Send } from "lucide-react";
import { nullaChatService } from "../helpers/nullaChat";
import { useNullasStore } from "../../../stores/nullasData";
import { useSettingsStore } from "../../../stores/settings";
import { getHungryStatus, getStressStatus } from "../helpers/nullaCounter";
import { useNullaChatStore } from "../../../stores/nullaChatData";
import { useMemoryMeshStore } from "../../../stores/memoryMeshData";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

interface NullaChatBoxProps {
  themeColor: string;
  onReplyModeChange?: (modeKey: string | null, durationMs?: number) => void;
}

const NullaChatBox: React.FC<NullaChatBoxProps> = ({
  themeColor,
  onReplyModeChange,
}) => {
  const [draft, setDraft] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isClearingMemory, setIsClearingMemory] = useState(false);
  const [callsign, setCallsign] = useState("darling");
  const [gfName, setGfName] = useState("darling");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fetchNullas = useNullasStore((state) => state.fetchNullas);
  const latestNulla = useNullasStore((state) => state.nullas[0] ?? null);
  const latestMode = latestNulla?.mode ?? null;
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const getGfName = useSettingsStore((state) => state.getGfName);
  const getCallsign = useSettingsStore((state) => state.getCallsign);
  const conversation = useNullaChatStore((state) => state.conversation);
  const addUserMessage = useNullaChatStore((state) => state.addUserMessage);
  const addAiMessage = useNullaChatStore((state) => state.addAiMessage);
  const storeLongTermMemory = useNullaChatStore(
    (state) => state.storeLongTermMemory,
  );
  const clearConversation = useNullaChatStore(
    (state) => state.clearConversation,
  );
  const clearLastAiMessage = useNullaChatStore(
    (state) => state.clearLastAiMessage,
  );
  const getConversationContext = useNullaChatStore(
    (state) => state.getConversationContext,
  );
  const fetchMemoryMesh = useMemoryMeshStore((state) => state.fetchEntries);
  const memoryMeshEntries = useMemoryMeshStore((state) => state.entries);
  const deleteAllMemoryMesh = useMemoryMeshStore(
    (state) => state.deleteAllEntries,
  );

  const buildMemoryMeshContext = (): string => {
    if (memoryMeshEntries.length === 0) return "";
    return memoryMeshEntries
      .slice(0, 5)
      .map((entry) => {
        const parts: string[] = [];
        if (entry.user_chat) parts.push(`User: ${entry.user_chat}`);
        if (entry.ai_chat) parts.push(`Nulla: ${entry.ai_chat}`);
        return parts.join(" | ");
      })
      .filter(Boolean)
      .join("\n");
  };

  const getReplyMode = (reply: string): string => {
    const text = reply.toLowerCase();

    const rules: Array<{ mode: string; keywords: string[] }> = [
      { mode: "angry", keywords: ["angry", "mad", "furious", "annoyed"] },
      { mode: "sad", keywords: ["sad", "sorry", "tears", "lonely", "hurt"] },
      {
        mode: "shocked",
        keywords: ["wow", "whoa", "shocked", "surprised", "gasp"],
      },
      {
        mode: "sleepy",
        keywords: ["sleep", "sleepy", "tired", "rest", "nap"],
      },
      {
        mode: "thinking",
        keywords: ["think", "consider", "maybe", "hmm", "wonder"],
      },
      {
        mode: "shy",
        keywords: ["shy", "blush", "nervous", "bashful"],
      },
      {
        mode: "running",
        keywords: ["run", "running", "rush", "hurry", "fast"],
      },
      {
        mode: "eating",
        keywords: ["eat", "eating", "snack", "food", "hungry"],
      },
      {
        mode: "happy-jump",
        keywords: ["yay", "happy", "excited", "love", "sweet", "great"],
      },
    ];

    for (const rule of rules) {
      if (rule.keywords.some((keyword) => text.includes(keyword))) {
        return rule.mode;
      }
    }

    return "happy-idle";
  };

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setDraft("");

    setIsTyping(true);
    try {
      await fetchMemoryMesh();
    } catch (error) {
      console.error("Failed to load memory mesh for chat:", error);
    }
    const conversationContext = getConversationContext();
    const memoryContext = buildMemoryMeshContext();
    const response = await nullaChatService.generateReply({
      message: trimmed,
      mode: latestMode,
      gfName,
      callsign,
      hungryStatus: getHungryStatus(latestNulla, Date.now()),
      stressStatus: getStressStatus(latestNulla, Date.now()),
      lastEaten: latestNulla?.last_eaten ?? null,
      lastPlaying: latestNulla?.last_playing ?? null,
      conversationContext,
      memoryContext,
    });
    if (response.success) {
      const replyText = response.reply ?? "Nulla is quiet right now.";
      addAiMessage(replyText);
      storeLongTermMemory(trimmed, replyText);
      const replyMode = getReplyMode(replyText);
      onReplyModeChange?.(replyMode, 5000);
    } else if (response.error) {
      const fallbackReply = "Nulla is quiet right now. Try again in a moment.";
      addAiMessage(fallbackReply);
      storeLongTermMemory(trimmed, fallbackReply);
      onReplyModeChange?.("sad", 5000);
    }
    setIsTyping(false);
  };

  const handleClearMemory = async () => {
    setIsClearingMemory(true);
    try {
      await deleteAllMemoryMesh();
      clearConversation();
      clearLastAiMessage();
      setDraft("");
      setIsTyping(false);
    } catch (error) {
      console.error("Failed to clear memory mesh:", error);
    } finally {
      setIsClearingMemory(false);
    }
  };

  useEffect(() => {
    void fetchNullas();
  }, [fetchNullas]);

  const messages: ChatMessage[] = conversation.map((message) => ({
    id: message.id,
    text: message.text,
    isUser: message.role === "user",
  }));

  useEffect(() => {
    const loadCallsign = async () => {
      try {
        await loadSettings();
        setCallsign(getCallsign());
        setGfName(getGfName());
      } catch (error) {
        console.error("Failed to load callsign for chat:", error);
        setCallsign("darling");
        setGfName("darling");
      }
    };

    void loadCallsign();
  }, [loadSettings, getCallsign, getGfName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div
        className="bg-white rounded-lg shadow-2xl transition-all duration-300 ease-in-out"
        style={{
          border: `2px solid ${themeColor}`,
          maxHeight: isMinimized ? "56px" : "420px",
        }}
      >
        <div
          className="flex items-center justify-between p-3 rounded-t-lg cursor-pointer"
          style={{ backgroundColor: themeColor }}
          onClick={() => setIsMinimized((prev) => !prev)}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
            >
              <img
                src="/assets/nulla/nulla.png"
                alt="Nulla"
                className="w-6 h-6 rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Nulla Chat</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-xs opacity-90">
                  Ready to listen
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(event) => event.stopPropagation()}
                  className="h-7 px-2 text-xs text-white hover:bg-white hover:bg-opacity-20"
                >
                  Clear memory
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <img
                      src="/assets/nulla/nulla.png"
                      alt="Nulla"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Clear Nulla memory?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all long-term memory entries stored for
                    Nulla. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={(event) => event.stopPropagation()}
                    disabled={isClearingMemory}
                  >
                    Keep memory
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleClearMemory();
                    }}
                    className="bg-red-600 text-white hover:bg-red-700"
                    disabled={isClearingMemory}
                  >
                    {isClearingMemory ? "Clearing..." : "Clear memory"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                setIsMinimized((prev) => !prev);
              }}
              className="p-1 h-7 w-7 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <Minus size={14} />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <ScrollArea className="h-56 p-3">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Start a chat with Nulla.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          message.isUser ? "rounded-br-md" : "rounded-bl-md"
                        }`}
                        style={{
                          backgroundColor: message.isUser
                            ? themeColor
                            : "#f0f0f0",
                          color: message.isUser ? "white" : "#333",
                        }}
                      >
                        <p className="leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white border-gray-300 focus:border-gray-400 text-sm"
                />
                <Button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim() || isTyping}
                  size="sm"
                  className="px-3 rounded-full"
                  style={{
                    backgroundColor: themeColor,
                    borderColor: themeColor,
                  }}
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NullaChatBox;
