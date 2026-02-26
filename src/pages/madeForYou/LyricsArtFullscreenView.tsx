import React, { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings";
import { useThemeStore } from "@/stores/theme";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2 } from "lucide-react";
import LyricsPoster from "@/components/ui/lyricsPoster";
import SpotifyPlayer from "./components/SpotifyPlayer";

interface LyricsArtFullscreenViewProps {
  onNavigate?: (path: string) => void;
}

const LyricsArtFullscreenView: React.FC<LyricsArtFullscreenViewProps> = ({ onNavigate }) => {
  const { loadSettings, waitForPosterImageSrc } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();
  
  const [themeColor, setThemeColor] = useState("#F2A6A6");
  const [posterImageSrc, setPosterImageSrc] = useState("/assets/ascii/set3.jpg");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        setThemeColor(getCurrentThemeColor());
        setPosterImageSrc(await waitForPosterImageSrc());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize LyricsArtFullscreenView:", error);
        setThemeColor("#F2A6A6");
        setPosterImageSrc("/assets/ascii/set3.jpg");
        setIsLoading(false);
      }
    };

    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCurrentThemeColor, waitForPosterImageSrc]);

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
            Lyrics Art Poster
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col">
        {/* The poster — full width */}
        <LyricsPoster posterImageSrc={posterImageSrc} />

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
    </div>
  );
};

export default LyricsArtFullscreenView;
