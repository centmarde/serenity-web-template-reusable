import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { useIsMobile } from "../../hooks/use-mobile";
import { Target } from "lucide-react";
import { TarotCardsResults } from "./components/TarotCardsResults";


interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  bfName: string;
  appName: string;
}

interface TarotCardsViewProps {
  onNavigate?: (path: string) => void;
}

const TarotCardsView: React.FC<TarotCardsViewProps> = ({ onNavigate }) => {
  const { getCallsign, getGfName, getBfName, getAppName, loadSettings } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization, getSafeThemeColor } = useThemeStore();
  const isMobile = useIsMobile();

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
          bfName: getBfName(),
          appName: getAppName()
        });
      } catch (error) {
        console.error('Failed to initialize TarotCardsView:', error);
        // Provide fallback values
        setData({
          themeColor: getSafeThemeColor(),
          callsign: 'Darling',
          gfName: 'Beautiful',
          bfName: 'Handsome',
          appName: 'Love Space'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCurrentThemeColor, getCallsign, getGfName, getBfName, getAppName, getSafeThemeColor]);

  if (isLoading || !data) {
    const safeThemeColor = getSafeThemeColor();
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: safeThemeColor }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Container Fluid - Full width with responsive padding */}
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16 py-8">
        {/* Main Container - Use more width on large screens */}
        <div className={`mx-auto space-y-8 ${isMobile ? 'max-w-none' : 'max-w-screen-2xl'}`}>
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Target 
                size={isMobile ? 32 : 40} 
                color={data.themeColor}
                className="animate-pulse"
              />
              <h1
                className="text-gray-800 font-bold"
                style={{
                  fontSize: isMobile ? "clamp(1.5rem, 6vw, 2.5rem)" : "clamp(2rem, 5vw, 3rem)",
                  color: "#333333",
                }}
              >
                Tarot Cards
              </h1>
              <Target 
                size={isMobile ? 32 : 40} 
                color={data.themeColor}
                className="animate-pulse"
              />
            </div>
          </div>

          {/* Tarot Cards Results */}
          <div className={`bg-white rounded-lg shadow-lg w-full ${
            isMobile ? 'p-4 mx-2' : 'p-8'
          }`} style={{
            border: `2px solid ${data.themeColor}20`
          }}>
            <TarotCardsResults 
              themeColor={data.themeColor}
              bfName={data.bfName}
              gfName={data.gfName}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarotCardsView;