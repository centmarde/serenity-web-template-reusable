import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NullaWidget from "./components/NullaWidget";
import NullaChatBox from "./components/NullaChatBox";
import NullaItems from "./components/NullaItems";

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
  const [replyModeKey, setReplyModeKey] = useState<string | null>(null);
  const replyTimeoutRef = useRef<number | null>(null);

  const handleReplyModeChange = useCallback(
    (modeKey: string | null, durationMs = 5000) => {
      if (replyTimeoutRef.current) {
        window.clearTimeout(replyTimeoutRef.current);
      }

      setReplyModeKey(modeKey);

      if (modeKey) {
        replyTimeoutRef.current = window.setTimeout(() => {
          setReplyModeKey(null);
          replyTimeoutRef.current = null;
        }, durationMs);
      }
    },
    [],
  );

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

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        window.clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

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
      className="min-h-screen flex items-center justify-center px-4 py-6 lg:px-10"
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}20, ${data.themeColor}40, #ffffff)`,
      }}
    >
      <Card
        className="w-full max-w-5xl"
        style={{
          border: `2px solid ${data.themeColor}40`,
          borderRadius: "20px",
          backgroundColor: "white",
        }}
      >
        <CardContent className="p-6 text-center space-y-4">
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <NullaWidget
                themeColor={data.themeColor}
                overrideModeKey={replyModeKey}
              />
              <NullaItems themeColor={data.themeColor} />
            </div>
            <div>
              <NullaChatBox
                themeColor={data.themeColor}
                onReplyModeChange={handleReplyModeChange}
              />
            </div>
          </div>

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
