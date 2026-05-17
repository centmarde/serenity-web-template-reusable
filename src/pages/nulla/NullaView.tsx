import React, { useEffect, useState } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NullaWidget from "./components/NullaWidget";

interface ComponentData {
  themeColor: string;
  callsign: string;
  appName: string;
}

interface NullaViewProps {
  onNavigate?: (path: string) => void;
}

const NullaView: React.FC<NullaViewProps> = ({ onNavigate }) => {
  const { getCallsign, getAppName, loadSettings } = useSettingsStore();
  const {
    initializeTheme,
    getCurrentThemeColor,
    getSafeThemeColor,
    waitForInitialization,
  } = useThemeStore();

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
          appName: getAppName(),
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize NullaView:", error);

        setData({
          themeColor: getSafeThemeColor(),
          callsign: "darling",
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
    getAppName,
    getSafeThemeColor,
  ]);

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
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}20, ${data.themeColor}40, #ffffff)`,
      }}
    >
      <Card
        className="w-full max-w-xl"
        style={{
          border: `2px solid ${data.themeColor}40`,
          borderRadius: "20px",
          backgroundColor: "white",
        }}
      >
        <CardContent className="p-6 text-center space-y-4">
          <NullaWidget themeColor={data.themeColor} />

          <h1
            className="font-bold text-gray-800"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            }}
          >
            Nulla Prototype
          </h1>

          <p
            className="text-gray-600"
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
            }}
          >
            Hi {data.callsign}! This is a starter space for the Nulla feature
            inside {data.appName}.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => onNavigate?.("/")}
              style={{
                borderColor: data.themeColor,
                color: data.themeColor,
              }}
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NullaView;
