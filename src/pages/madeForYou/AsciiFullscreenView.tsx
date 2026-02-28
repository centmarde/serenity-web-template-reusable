import React, { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings";
import { useThemeStore } from "@/stores/theme";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { AsciiArt } from "@/components/ui/ascii-art";

interface AsciiFullscreenViewProps {
  onNavigate?: (path: string) => void;
}

const LARGE_SCREEN_BREAKPOINT = 1024;

const AsciiFullscreenView: React.FC<AsciiFullscreenViewProps> = ({ onNavigate }) => {
  const { loadSettings } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();
  
  const [themeColor, setThemeColor] = useState("#F2A6A6");
  const [isLoading, setIsLoading] = useState(true);
  const [resolution, setResolution] = useState(
    window.innerWidth >= LARGE_SCREEN_BREAKPOINT ? 180 : 120
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        setThemeColor(getCurrentThemeColor());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize AsciiFullscreenView:", error);
        setThemeColor("#F2A6A6");
        setIsLoading(false);
      }
    };

    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCurrentThemeColor]);

  useEffect(() => {
    const handleResize = () => {
      setResolution(window.innerWidth >= LARGE_SCREEN_BREAKPOINT ? 200 : 120);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0a" }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: themeColor }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 w-full px-4 py-3 flex items-center gap-3"
        style={{
          backdropFilter: "blur(12px)",
          borderBottom: `2px solid ${themeColor}30`,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate?.("/girlfriend/madeforyou")}
          style={{ color: themeColor }}
          className="hover:bg-transparent"
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <Maximize2 size={22} color={themeColor} />
          <h1
            className="font-bold"
            style={{
              color: themeColor,
              fontSize: "clamp(1rem, 3.5vw, 1.4rem)",
            }}
          >
            ASCII Art Gallery
          </h1>
        </div>
      </div>

      {/* Main Content - Scrollable ASCII Art */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden">
        <div 
          className="w-full flex justify-center"
        >
          <AsciiArt
            src="/assets/ascii/set1.jpg"
            resolution={resolution}
            charset="dense"
            colored={true}
            backgroundColor="#0a0a0a"
            animated={true}
            animationStyle="matrix"
            animateOnView={true}
            objectFit="contain"
            className="w-full"
           
          />
        </div>
      </div>
    </div>
  );
};

export default AsciiFullscreenView;
