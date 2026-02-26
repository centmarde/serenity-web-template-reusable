import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Maximize2, Image } from "lucide-react";
import { useSettingsStore } from "@/stores/settings";

interface AsciiWidgetProps {
  onNavigate?: (path: string) => void;
}

const AsciiWidget: React.FC<AsciiWidgetProps> = ({ onNavigate }) => {
  const { waitForThemeColor } = useSettingsStore();
  const [themeColor, setThemeColor] = useState("#F2A6A6");

  useEffect(() => {
    waitForThemeColor()
      .then(setThemeColor)
      .catch(() => setThemeColor("#F2A6A6"));
  }, [waitForThemeColor]);

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 group relative"
      style={{
        borderColor: themeColor,
        borderWidth: '2px',
      }}
      onClick={() => onNavigate?.("/girlfriend/madeforyou/ascii-art")}
    >
      <CardContent 
        className="p-4"
        style={{
          background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}05)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/peach-goma.gif" 
              alt="ASCII Art"
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex items-center gap-2">
              <Image size={20} style={{ color: themeColor }} />
              <h3 
                className="font-semibold text-lg"
                style={{ color: themeColor }}
              >
                ASCII Art
              </h3>
            </div>
          </div>
          
          {/* Fullscreen icon */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Maximize2 size={20} style={{ color: themeColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AsciiWidget;
