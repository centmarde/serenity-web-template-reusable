import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "../../../stores/settings";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const { getThemeColor } = useSettingsStore();
  const themeColor = getThemeColor();
  const [selectedCategory, setSelectedCategory] = useState('feelings');

  const emojiCategories = {
    feelings: {
      name: 'Feelings',
      emojis: ['😈', '😏', '🤔', '🙄', '😍', '🥰', '😘', '😊', '🤗', '😌', '😋', '🤤', '🤨', '😒', '😑', '🤫', '🤐', '😶', '🤯', '😱', '😨', '😰', '🥺', '😭', '😤', '😠', '🤬', '😡']
    },
    love: {
      name: 'Love & Romance',
      emojis: ['💕', '💖', '💗', '💘', '💝', '💞', '💓', '💗', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💋', '💌', '💐', '🌹', '🌷', '🌺', '🌸', '💍', '👫', '👬', '👭', '💏', '💑']
    },
    thoughts: {
      name: 'Thoughts & Ideas',
      emojis: ['💭', '🧠', '💡', '🤯', '😵‍💫', '🤔', '🤨', '🧐', '😏', '🤓', '🤫', '🤐', '😶‍🌫️', '💫', '⭐', '✨', '💥', '💢', '💨', '💤', '🎯', '🎪', '🎭', '🎨', '🔥', '⚡', '💀', '👻']
    },
    actions: {
      name: 'Actions & Objects',
      emojis: ['👀', '👁️', '👂', '👃', '👄', '👅', '🦷', '🤲', '👐', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊', '🤞', '✌️', '🤟', '🤘', '👌', '🤏', '✋', '🤚', '🖐️', '🖖', '👋', '🤙']
    },
    food: {
      name: 'Food & Treats',
      emojis: ['🍕', '🍔', '🌭', '🥪', '🌮', '🌯', '🥗', '🍝', '🍜', '🍲', '🥘', '🍱', '🍘', '🍙', '🍚', '🍛', '🍣', '🍤', '🍥', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰']
    }
  };

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  return (
    <Card className="w-full max-w-sm border shadow-lg bg-white" style={{ borderColor: `${themeColor}30` }}>
      <CardContent className="p-3">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1 mb-3">
          {Object.entries(emojiCategories).map(([key, category]) => (
            <Badge
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              className="cursor-pointer text-xs px-2 py-1 hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: selectedCategory === key ? themeColor : 'transparent',
                borderColor: themeColor,
                color: selectedCategory === key ? 'white' : themeColor
              }}
              onClick={() => setSelectedCategory(key)}
            >
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Emoji grid */}
        <div 
          className="grid grid-cols-7 gap-1 max-h-32 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${themeColor}40 transparent`
          }}
        >
          {emojiCategories[selectedCategory as keyof typeof emojiCategories].emojis.map((emoji, index) => (
            <Button
              key={`${selectedCategory}-${index}`}
              variant="ghost"
              className="h-8 w-8 p-0 text-lg hover:scale-110 transition-transform duration-150"
              style={{
                borderRadius: '8px',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${themeColor}15`;
                e.currentTarget.style.borderColor = `${themeColor}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onClick={() => handleEmojiClick(emoji)}
              title={`Add ${emoji}`}
            >
              {emoji}
            </Button>
          ))}
        </div>

        {/* Quick access popular emojis */}
        <div className="mt-3 pt-2 border-t" style={{ borderColor: `${themeColor}20` }}>
          <div className="text-xs font-medium mb-1" style={{ color: `${themeColor}` }}>
            Quick Access:
          </div>
          <div className="flex gap-1 flex-wrap">
            {['😈', '😏', '💭', '💕', '🤔', '🙄', '😘', '🤤', '😍', '🥰'].map((emoji, index) => (
              <Button
                key={`quick-${index}`}
                variant="ghost"
                className="h-7 w-7 p-0 text-sm hover:scale-110 transition-transform duration-150"
                style={{
                  borderRadius: '6px',
                  backgroundColor: `${themeColor}10`,
                  border: `1px solid ${themeColor}30`
                }}
                onClick={() => handleEmojiClick(emoji)}
                title={`Add ${emoji}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmojiPicker;