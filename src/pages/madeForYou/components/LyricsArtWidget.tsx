import React, { useEffect, useState } from "react";
import LyricsPoster from "@/components/ui/lyricsPoster";
import SpotifyPlayer from "./SpotifyPlayer";
import { useSettingsStore } from "@/stores/settings";

const LyricsArtWidget: React.FC = () => {
  const { waitForThemeColor } = useSettingsStore();
  const [themeColor, setThemeColor] = useState("#F2A6A6");

  useEffect(() => {
    waitForThemeColor()
      .then(setThemeColor)
      .catch(() => setThemeColor("#F2A6A6"));
  }, [waitForThemeColor]);

  return (
    <div className="flex flex-col w-full">
      {/* Section header */}
      <div className="flex items-center gap-2 px-6" />

      {/* The poster — full width, no side padding */}
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
  );
};

export default LyricsArtWidget;
