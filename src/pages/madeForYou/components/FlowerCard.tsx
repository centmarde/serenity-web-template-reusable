import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Maximize2 } from "lucide-react";
import { useSettingsStore } from "@/stores/settings";

interface FlowerCardProps {
  flowerImage: string;
  route: string;
  onNavigate?: (path: string) => void;
}

const FlowerCard: React.FC<FlowerCardProps> = ({ 
  flowerImage, 
  route, 
  onNavigate 
}) => {
  const { waitForThemeColor, getRandomTrait } = useSettingsStore();
  const [themeColor, setThemeColor] = useState("#F2A6A6");
  
  // Use useMemo to get a stable random trait for this card instance
  const trait = useMemo(() => getRandomTrait(), [getRandomTrait]);

  useEffect(() => {
    waitForThemeColor()
      .then(setThemeColor)
      .catch(() => setThemeColor("#F2A6A6"));
  }, [waitForThemeColor]);

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group relative"
      style={{
        borderColor: themeColor,
        borderWidth: '2px',
      }}
      onClick={() => onNavigate?.(route)}
    >
      <CardContent 
        className="p-6"
        style={{
          background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}05)`,
        }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Flower Image */}
          <div className="relative">
            <img 
              src={flowerImage} 
              alt="Flower bouquet"
              className="w-32 h-32 object-contain drop-shadow-lg group-hover:scale-125 transition-transform duration-500 ease-out"
            />
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          </div>

          {/* Romantic Trait Quote - Centered and Wrapped */}
          <div className="text-center px-4 w-full max-w-md">
            <p 
              className="romantic-content"
              style={{ 
                color: themeColor,
                fontSize: "clamp(1.1rem, 2.8vw, 1.4rem)",
                lineHeight: "1.8",
                padding: "0.5rem 0",
                margin: "0",
                fontStyle: "italic",
                textAlign: "center",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                hyphens: "auto"
              }}
            >
              "{trait}"
            </p>
          </div>

          {/* Fullscreen hint */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 mt-2">
            <Maximize2 size={16} style={{ color: themeColor }} />
            <span 
              className="text-sm e" 
              style={{ 
                color: themeColor,
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                padding: "0",
                margin: "0"
              }}
            >
              Pick this bouquet
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlowerCard;
