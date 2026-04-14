import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import EvilThoughtsWidget from "./components/EvilThoughtsWidget";

interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  bfName: string;
  appName: string;
}

const EvilThoughtsView: React.FC = () => {
  const { getCallsign, getGfName, getBfName, getAppName, loadSettings } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization, getSafeThemeColor } = useThemeStore();

  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data now comes from thoughtsData store integrated into widgets

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
          appName: getAppName(),
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize EvilThoughtsView:", error);
        const fallbackThemeColor = getSafeThemeColor();
        setData({
          themeColor: fallbackThemeColor,
          callsign: "darling",
          gfName: "Love",
          bfName: "darling",
          appName: "Love Space",
        });
        setIsLoading(false);
      }
    };
    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCurrentThemeColor, getCallsign, getGfName, getBfName, getAppName, getSafeThemeColor]);

  if (isLoading || !data) {
    const safeThemeColor = getSafeThemeColor();
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${safeThemeColor}20, ${safeThemeColor}40, #ffffff)`,
        }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: safeThemeColor }}
        ></div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}20, ${data.themeColor}40, #ffffff)`,
      }}
    >
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-6 text-center relative z-10 px-4 mt-5">
        <h1 
          className="font-bold mb-3"
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: data.themeColor,
            textShadow: `0 2px 4px ${data.themeColor}40`
          }}
        >
          Evil Thoughts 😈
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-3">
          <p 
            className="text-gray-700 font-medium"
            style={{
              fontSize: 'clamp(0.85rem, 2.2vw, 1rem)',
              color: data.themeColor
            }}
          >
            Hey {data.callsign}!
          </p>
          <p 
            className="text-gray-600 leading-relaxed"
            style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              lineHeight: '1.6'
            }}
          >
            Instead of posting a note or status on Facebook or other social media platforms, 
            share your thoughts here! This way I can track your feelings and you can track 
            mine too. It's our private little space to see what's really going on in each 
            other's minds...
          </p>
          <p 
            className="text-gray-500 italic"
            style={{
              fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)'
            }}
          >
            The secret thoughts we have about each other...
          </p>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto relative z-10 px-4">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 h-full">
          {/* Girlfriend Column */}
          <div className="flex flex-col h-full">
            <div className="text-center mb-4">
              <h2 
                className="font-semibold"
                style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  color: data.themeColor
                }}
              >
                {data.gfName}\'s Evil Mind 💕
              </h2>
              <p 
                className="text-gray-500 mt-1"
                style={{
                  fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)'
                }}
              >
                What she\'s really thinking...
              </p>
            </div>
            <EvilThoughtsWidget
              personType="girlfriend"
              personName={data.gfName}
              avatarUrl="/assets/bubu.gif"
              isGf={true}
            />
          </div>

          {/* Boyfriend Column */}
          <div className="flex flex-col h-full">
            <div className="text-center mb-4">
              <h2 
                className="font-semibold"
                style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  color: data.themeColor
                }}
              >
                {data.bfName}\'s Evil Mind 😎
              </h2>
              <p 
                className="text-gray-500 mt-1"
                style={{
                  fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)'
                }}
              >
                What he\'s really thinking...
              </p>
            </div>
            <EvilThoughtsWidget
              personType="boyfriend"
              personName={data.bfName}
              avatarUrl="/assets/blee.gif"
              isGf={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvilThoughtsView;