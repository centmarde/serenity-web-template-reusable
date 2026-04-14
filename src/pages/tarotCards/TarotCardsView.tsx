import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { useIsMobile } from "../../hooks/use-mobile";
import { Target } from "lucide-react";
import TarotCardsWidget from "./components/TarotCardsWidget";
import { TarotHeader } from "./components/TarotHeader";
import type { TarotCard } from "../../composables/tarotConstant";
import type { AnimationPhase } from "./types";


interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  appName: string;
}

const TarotCardsView: React.FC = () => {
  const { getCallsign, getGfName, getAppName, loadSettings } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization, getSafeThemeColor } = useThemeStore();
  const isMobile = useIsMobile();

  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [showReading, setShowReading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('loading');

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
      } catch (error) {
        console.error('Failed to initialize TarotCardsView:', error);
        // Provide fallback values
        setData({
          themeColor: getSafeThemeColor(),
          callsign: 'Love',
          gfName: 'Beautiful',
          appName: 'Love Space',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCurrentThemeColor, getCallsign, getGfName, getAppName, getSafeThemeColor]);

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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Container - Responsive max width */}
        <div className={`mx-auto space-y-8 ${isMobile ? 'max-w-none' : 'max-w-6xl'}`}>
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

          {/* Mobile: TarotHeader below main title */}
          {isMobile && (
            <div className="px-4">
              <TarotHeader
                themeColor={data.themeColor}
                animationPhase={animationPhase}
                selectedCards={selectedCards}
                onRevealReading={() => setShowReading(true)}
                showReading={showReading}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* Tarot Cards Widget - Pass isMobile prop */}
          {isMobile ? (
            <div 
              className="bg-white rounded-lg shadow-lg p-4 mx-auto"
              style={{
                maxWidth: '420px',
                width: '100%',
                border: `2px solid ${data.themeColor}20`,
                position: 'relative',
                zIndex: 1,
                marginTop: '85vh' // Large gap for mobile headers
              }}
            >
              <TarotCardsWidget 
                themeColor={data.themeColor} 
                isMobile={isMobile}
                selectedCards={selectedCards}
                setSelectedCards={setSelectedCards}
                setAnimationPhase={setAnimationPhase}
                setShowReading={setShowReading}
              />
            </div>
          ) : (
            <TarotCardsWidget 
              themeColor={data.themeColor} 
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TarotCardsView;