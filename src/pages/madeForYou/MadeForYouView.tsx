import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, Gift } from "lucide-react";
import AsciiWidget from "./components/AsciiWidget";
import LyricsArtWidget from "./components/LyricsArtWidget";

interface MadeForYouViewProps {
  onNavigate?: (path: string) => void;
}

interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  appName: string;
}

const MadeForYouView: React.FC<MadeForYouViewProps> = ({ onNavigate }) => {
  const { getCallsign, getGfName, getAppName, loadSettings } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();

  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize MadeForYouView:", error);
        setData({
          themeColor: "#F2A6A6",
          callsign: "darling",
          gfName: "Love",
          appName: "Love Space",
        });
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
  ]);

  if (isLoading || !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#000000" }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#F2A6A6" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 w-full px-4 py-3 flex items-center gap-3"
        style={{
         
          backdropFilter: "blur(12px)",
          borderBottom: `2px solid ${data.themeColor}30`,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate?.("/")}
          style={{ color: data.themeColor }}
          className="hover:bg-transparent"
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <Gift size={22} color={data.themeColor} />
          <h1
            className="font-bold"
            style={{
              color: data.themeColor,
              fontSize: "clamp(1rem, 3.5vw, 1.4rem)",
            }}
          >
            Made for You
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
            Special
          </Badge>
        </div>

        <Heart
          size={20}
          fill={data.themeColor}
          color={data.themeColor}
          className="animate-pulse"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full ">

        {/* ASCII Art Widget */}
        <AsciiWidget />

        {/* Lyrics Poster Widget — full bleed, no px */}
        <LyricsArtWidget />

        {/* Footer note */}
        <div className="text-center px-6 pb-8">
          <p
            className="italic"
            style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", color: `${data.themeColor}90` }}
          >
            Made with endless love 💗 — {data.appName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MadeForYouView;
