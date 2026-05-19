import React from "react";
import { useThemeStore } from "../../../stores/theme";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import NullaChatBox from "../../nulla/components/NullaChatBox";

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const { getCurrentThemeColor } = useThemeStore();

  const themeColor = getCurrentThemeColor();

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-80 max-w-[calc(100vw-2rem)]">
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 h-8 w-8 rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100"
          style={{ border: `1px solid ${themeColor}40` }}
        >
          <X size={14} />
        </Button>
        <NullaChatBox themeColor={themeColor} />
      </div>
    </div>
  );
};

export default ChatBot;
