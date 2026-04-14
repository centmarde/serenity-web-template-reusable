import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Flower, Heart, Info } from "lucide-react";
import Flowers from "../../components/Flowers";
import FlowersDialog from "./dialogs/FlowersDialog";
import { useIsMobile } from "../../hooks/use-mobile";

interface FlowerGardenViewProps {
  onNavigate?: (path: string) => void;
}

interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  appName: string;
}

const FlowerGardenView: React.FC<FlowerGardenViewProps> = ({ onNavigate }) => {
  const { getCallsign, getGfName, getAppName, loadSettings, getRandomTrait } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();
  const isMobile = useIsMobile();

  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrait, setCurrentTrait] = useState("");
  const [showDialog, setShowDialog] = useState(true); // Show dialog immediately

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        setData({
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          gfName: getGfName(),
          appName: getAppName(),
        });

        setCurrentTrait(getRandomTrait());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize FlowerGardenView:", error);
        setData({
          themeColor: "#F2A6A6",
          callsign: "darling",
          gfName: "Love",
          appName: "Love Space",
        });
        setCurrentTrait("You make my world bloom with colors");
        setIsLoading(false);
      }
    };

    initialize();
  }, [
    initializeTheme,
    waitForInitialization,
    loadSettings,
    getCurrentThemeColor,
    getCallsign,
    getGfName,
    getAppName,
    getRandomTrait,
  ]);

  if (isLoading || !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#010113" }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: data?.themeColor || "#F2A6A6" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#010113" }}>
      {/* Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center gap-3 transition-all duration-500 ${
          showDialog ? 'blur-sm' : 'blur-none'
        }`}
        style={{
          background: "rgba(1, 1, 19, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: `2px solid ${data.themeColor}30`,
          filter: showDialog ? 'blur(4px) brightness(0.7)' : 'none',
          pointerEvents: showDialog ? 'none' : 'auto',
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate?.("/girlfriend/madeforyou")}
          style={{ color: data.themeColor }}
          className="hover:bg-transparent"
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <Flower size={22} color={data.themeColor} />
          <h1
            className="font-bold"
            style={{
              color: data.themeColor,
              fontSize: "clamp(1rem, 3.5vw, 1.4rem)",
            }}
          >
            Animated Garden
          </h1>
          <Badge
            variant="secondary"
            style={{
              backgroundColor: `${data.themeColor}20`,
              color: data.themeColor,
              border: `1px solid ${data.themeColor}50`,
              fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)",
            }}
          >
            Blooming
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDialog(true)}
          style={{ color: data.themeColor }}
          className="hover:bg-transparent"
        >
          <Info size={20} />
        </Button>
      </div>

      {/* Flowers Component - Full Screen */}
      <div 
        className={`absolute inset-0 z-10 transition-all duration-500 ${
          showDialog ? 'blur-lg scale-95' : 'blur-none scale-100'
        }`}
        style={{
          filter: showDialog ? 'blur(8px) brightness(0.6)' : 'none',
          pointerEvents: showDialog ? 'none' : 'auto',
        }}
      >
        <Flowers animationPaused={showDialog} />
      </div>

      {/* Romantic Message Overlay */}
      <div 
        className={`absolute ${isMobile ? 'top-20' : 'bottom-20'} left-0 right-0 z-30 px-6 text-center transition-all duration-500 ${
          showDialog ? 'blur-lg scale-95' : 'blur-none scale-100'
        }`}
        style={{
          filter: showDialog ? 'blur(8px) brightness(0.6)' : 'none',
          pointerEvents: showDialog ? 'none' : 'auto',
        }}
      >
        <div
          className="max-w-2xl mx-auto p-6 rounded-3xl"
          style={{
            background: `linear-gradient(135deg, ${data.themeColor}15, ${data.themeColor}05)`,
            backdropFilter: "blur(20px)",
            border: `2px solid ${data.themeColor}30`,
            boxShadow: `0 8px 32px ${data.themeColor}20`,
          }}
        >
          <h2
            className="font-bold mb-3"
            style={{
              color: data.themeColor,
              fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
            }}
          >
            For My Beautiful {data.gfName} 🌸
          </h2>
          <p
            className="italic leading-relaxed"
            style={{
              color: `${data.themeColor}dd`,
              fontSize: "clamp(0.9rem, 2.8vw, 1.2rem)",
              lineHeight: "1.6",
            }}
          >
            "{currentTrait}"
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-2">
              <Heart size={16} fill={data.themeColor} color={data.themeColor} />
              <span
                style={{
                  color: `${data.themeColor}cc`,
                  fontSize: "clamp(0.8rem, 2.2vw, 1rem)",
                }}
              >
                Like these flowers, my love blooms endlessly for you, IGIT!
              </span>
              <Heart size={16} fill={data.themeColor} color={data.themeColor} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Helper - Removed tap anywhere functionality */}

      {/* Flowers Explanation Dialog */}
      <FlowersDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
};

export default FlowerGardenView;
