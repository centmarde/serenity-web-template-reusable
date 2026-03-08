import React, { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings";
import { useThemeStore } from "@/stores/theme";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import LyricsPoster from "@/components/ui/lyricsPoster";
import SpotifyPlayer from "./components/SpotifyPlayer";
import LyricPosterDialog from "./dialogs/LyricPosterDialog";

interface LyricsArtFullscreenViewProps {
  onNavigate?: (path: string) => void;
}

const LyricsArtFullscreenView: React.FC<LyricsArtFullscreenViewProps> = ({ onNavigate }) => {
  const { loadSettings } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();
  const isMobile = useIsMobile();
  
  const [themeColor, setThemeColor] = useState("#F2A6A6");
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(true); // Show dialog immediately

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        setThemeColor(getCurrentThemeColor());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize LyricsArtFullscreenView:", error);
        setThemeColor("#F2A6A6");
        setIsLoading(false);
      }
    };

    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCurrentThemeColor]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#000000" }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: themeColor }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#000000" }}>
      {/* Header */}
      <div
        className={`sticky top-0 z-10 w-full transition-all duration-500 ${
          showDialog ? 'blur-sm' : 'blur-none'
        }`}
        style={{
          backdropFilter: "blur(12px)",
          borderBottom: `2px solid ${themeColor}30`,
          filter: showDialog ? 'blur(4px) brightness(0.7)' : 'none',
          pointerEvents: showDialog ? 'none' : 'auto',
          padding: isMobile ? 'min(12px, 3vw) min(16px, 4vw)' : 'min(16px, 4vw) min(20px, 5vw)'
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "icon"}
            onClick={() => onNavigate?.("/girlfriend/madeforyou")}
            style={{ color: themeColor }}
            className="hover:bg-transparent"
          >
            <ArrowLeft size={isMobile ? 18 : 20} />
          </Button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!isMobile && <Maximize2 size={22} color={themeColor} />}
            <h1
              className="font-bold truncate"
              style={{
                color: themeColor,
                fontSize: isMobile ? "clamp(0.9rem, 4vw, 1.1rem)" : "clamp(1rem, 3.5vw, 1.4rem)",
              }}
            >
              {isMobile ? "Lyrics Art" : "Lyrics Art Poster"}
            </h1>
          </div>

          <Button
            variant="ghost"
            size={isMobile ? "sm" : "icon"}
            onClick={() => setShowDialog(true)}
            style={{ color: themeColor }}
            className="hover:bg-transparent"
          >
            <Info size={isMobile ? 18 : 20} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 w-full flex flex-col transition-all duration-500 ${
          showDialog ? 'blur-lg scale-95' : 'blur-none scale-100'
        }`}
        style={{
          filter: showDialog ? 'blur(8px) brightness(0.6)' : 'none',
          pointerEvents: showDialog ? 'none' : 'auto'
        }}
      >
        {/* The poster — full width */}
        <LyricsPoster />

        {/* Spotify-style player below the art */}
        <div
          className="w-full px-4 py-4"
          style={{
            background: "linear-gradient(to bottom, #000000 0%, #0d0d1a 100%)",
          }}
        >
          <SpotifyPlayer themeColor={themeColor} />
        </div>
      </div>

      {/* Lyrics Poster Explanation Dialog */}
      <LyricPosterDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
};

export default LyricsArtFullscreenView;
