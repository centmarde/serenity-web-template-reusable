import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Maximize2 } from "lucide-react";
import { useSettingsStore } from "@/stores/settings";

interface FlowerCardProps {
  title: string;
  icon: React.ReactNode;
  flowerImage: string;
  route: string;
  onNavigate?: (path: string) => void;
}

const FlowerCard: React.FC<FlowerCardProps> = ({ 
  title, 
  icon, 
  flowerImage, 
  route, 
  onNavigate 
}) => {
  const { waitForThemeColor } = useSettingsStore();
  const [themeColor, setThemeColor] = useState("#F2A6A6");

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
        <div className="flex flex-col items-center gap-4">
          {/* Flower Image */}
          <div className="relative">
            <img 
              src={flowerImage} 
              alt={title}
              className="w-32 h-32 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            />
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          </div>
          
          {/* Title with Icon */}
          <div className="flex items-center gap-2">
            <div style={{ color: themeColor }}>
              {icon}
            </div>
            <h3 
              className="font-semibold text-xl"
              style={{ color: themeColor }}
            >
              {title}
            </h3>
          </div>

          {/* Fullscreen hint */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
            <Maximize2 size={16} style={{ color: themeColor }} />
            <span className="text-sm" style={{ color: themeColor }}>
              Pick this bouquet
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlowerCard;
