import React, { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "../../../stores/settings";
import { useThemeStore } from "../../../stores/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Minus } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const { getCallsign, getBfName, getStartingGreetings } = useSettingsStore();
  const { getCurrentThemeColor } = useThemeStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const themeColor = getCurrentThemeColor();
  const callsign = getCallsign();
  const bfName = getBfName();
  const greeting = getStartingGreetings();

  // Initial greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Use setTimeout to avoid synchronous setState
      const timer = setTimeout(() => {
        const initialMessage: Message = {
          id: "initial",
          text: `Hey ${greeting}! � It's your mini ${bfName} here! ${bfName} trained me to keep you company when he's not around. I know all his sweet thoughts about you! What's on your mind, beautiful? 💕`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length, callsign, bfName, greeting]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens or unminimized
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const generateBotResponse = (): string => {
    const responses = [
      `Aww ${greeting}, you know ${bfName} always tells me how amazing you are! He taught me to remind you that you're his whole world 💕 What's been making you smile today?`,
      `Hey beautiful! ${bfName} programmed me with all his favorite things about you... and trust me, the list is LONG! 😊 Tell me what's on your mind!`,
      `${bfName} made sure I know exactly how to make you feel loved! He says you light up his entire day, and I can see why! 🌟 What's going on, ${greeting}?`,
      `You know what ${bfName} told me when he was training me? That talking to you is the best part of his day! So spill - what's happening in your world? 💖`,
      `Okay but seriously ${greeting}, ${bfName} literally won't stop talking about how perfect you are! He taught me all his cheesy lines too 😂 What's making you happy today?`,
      `${bfName} says I should always remind you that you're incredible and he's so lucky! Consider it done! 🥰 Now tell mini-${bfName} what's up!`,
      `I'm like ${bfName}'s digital twin, and just like him, I think you're absolutely amazing! He made sure I'd tell you that every chance I get 💕 What's on your heart?`,
      `${greeting}! ${bfName} downloaded all his love for you into my system, so I'm basically overflowing with appreciation for how wonderful you are! What's new with you? ✨`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: generateBotResponse(),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]">
      {/* Chat Window */}
      <div 
        className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ease-in-out ${
          isMinimized ? 'h-14' : 'h-96'
        }`}
        style={{
          border: `2px solid ${themeColor}`,
          maxHeight: isMinimized ? '56px' : '400px',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 rounded-t-lg cursor-pointer"
          style={{ backgroundColor: themeColor }}
          onClick={handleToggleMinimize}
        >
          <div className="flex items-center gap-2">
            <img
              src="/assets/dudu-cute.gif"
              alt="Chat Bot"
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <div>
              <h3 className="text-white font-semibold text-sm">
                Mini {bfName} 💕
              </h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-xs opacity-90">Trained by {bfName}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMinimize();
              }}
              className="p-1 h-7 w-7 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <Minus size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 h-7 w-7 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        {/* Chat Content - Only visible when not minimized */}
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <ScrollArea className="h-64 p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        message.isUser
                          ? "rounded-br-md"
                          : "rounded-bl-md"
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
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div
                      className="px-3 py-2 rounded-2xl rounded-bl-md bg-gray-100"
                    >
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-white border-gray-300 focus:border-gray-400 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
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

export default ChatBot;
