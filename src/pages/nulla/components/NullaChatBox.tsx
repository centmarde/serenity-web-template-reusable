import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Send } from "lucide-react";
import { nullaChatService } from "../helpers/nullaChat";

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

interface NullaChatBoxProps {
  themeColor: string;
}

const NullaChatBox: React.FC<NullaChatBoxProps> = ({ themeColor }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, isUser: true },
    ]);
    setDraft("");

    setIsTyping(true);
    const response = await nullaChatService.generateReply({ message: trimmed });
    if (response.success) {
      const replyText = response.reply ?? "Nulla is quiet right now.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: replyText, isUser: false },
      ]);
    } else if (response.error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Nulla is quiet right now. Try again in a moment.",
          isUser: false,
        },
      ]);
    }
    setIsTyping(false);
  };

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
