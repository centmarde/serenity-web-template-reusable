import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Music } from "lucide-react";
import PlayListWidget from "./components/PlayListWidget";

interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  bfName: string;
  appName: string;
  songTitle: string;
  songArtist: string;
  songUrl: string;
}

interface PlaylistViewProps {
  onNavigate?: (path: string) => void;
}

const PlayListView: React.FC<PlaylistViewProps> = () => {
  const {
    loadSettings,
    getCallsign,
    getGfName,
    getBfName,
    getAppName,
    getSongTitle,
    getSongArtist,
    getSongUrl,
  } = useSettingsStore();

  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();

  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();
        
        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          gfName: getGfName(),
          bfName: getBfName(),
          appName: getAppName(),
          songTitle: getSongTitle(),
          songArtist: getSongArtist(),
          songUrl: getSongUrl(),
        };

        setData(loadedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize PlaylistView:", error);
        
        const fallbackThemeColor = getCurrentThemeColor() || "#F2A6A6";
        setData({
          themeColor: fallbackThemeColor,
          callsign: "darling",
          gfName: "Love",
          bfName: "Darling",
          appName: "Love Space",
          songTitle: "falling",
          songArtist: "iration",
          songUrl: "/songs/falling.mp3",
        });
        
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCurrentThemeColor, getCallsign, getGfName, getBfName, getAppName, getSongTitle, getSongArtist, getSongUrl]);



  if (isLoading || !data) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${data?.themeColor || '#F2A6A6'}20, ${data?.themeColor || '#F2A6A6'}40, #ffffff)`,
        }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: data?.themeColor || getCurrentThemeColor() }}
        ></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}20, ${data.themeColor}40, #ffffff)`,
      }}
    >
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/listen.gif"
              alt="Music playlist"
              style={{
                width: "min(150px, 30vw)",
                height: "auto",
              }}
            />
          </div>
          
          <h1
            className="flex items-center justify-center gap-2 text-gray-800 font-bold"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              color: "#333333",
            }}
          >
            <Music
              className="animate-pulse"
              size={24}
              fill={data.themeColor}
              color={data.themeColor}
            />
            Our Music Playlists
            <Heart
              className="animate-pulse"
              size={24}
              fill={data.themeColor}
              color={data.themeColor}
            />
          </h1>
          
          <p
            className="text-lg font-medium text-gray-800"
            style={{
              fontSize: "clamp(1rem, 3vw, 1.25rem)",
              color: "#666666",
            }}
          >
            Songs that tell our love story 💕
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Girlfriend's Playlist */}
          <PlayListWidget
            title={`${data.gfName}'s Favorites`}
            subtitle="Songs that make her heart sing"
            themeColor={data.themeColor}
            ownerName={data.gfName}
            isGirlfriend={true}
          />

          {/* Boyfriend's Playlist */}
          <PlayListWidget
            title={`${data.bfName}'s Favorites`}
            subtitle="Songs that remind him of her"
            themeColor={data.themeColor}
            ownerName={data.bfName}
            isGirlfriend={false}
          />
        </div>

        {/* Message Card */}
        <Card 
          className="text-center"
          style={{
            borderColor: data.themeColor,
            background: `linear-gradient(135deg, ${data.themeColor}05, white)`,
          }}
        >
          <CardContent className="p-6">
            <p 
              className="text-gray-700 italic"
              style={{
                fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
              }}
            >
              "Music brings us closer together, no matter the distance. Every song in these playlists holds a special memory of us." 💝
            </p>
            <p 
              className="text-sm text-gray-500 mt-2"
            >
              - Made with love for both of us
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayListView;
