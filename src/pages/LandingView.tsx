import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../stores/settings";
import { useThemeStore } from "../stores/theme";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Camera, Music, Gift, Mail, Gamepad2, Target } from "lucide-react";
import {
  calculateRelationshipStats,
  calculateAnniversaryCountdown,
  createThemedShadow,
  type RelationshipStats,
  type AnniversaryCountdown,
} from "../utils/helpers";
import NoticeDialog from "./landing/dialogs/NoticeDialog";
import CounterDialog from "./landing/dialogs/CounterDialog";
import OpsDialog from "./landing/dialogs/OpsDialog";
import ChatBot from "./landing/components/ChatBot";

interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  appName: string;
  startingGreetings: string;
  coupleOfficialDate: string;
  traits: string[];
  relationshipStats: RelationshipStats;
  anniversaryCountdown: AnniversaryCountdown;
}

interface LandingViewProps {
  onNavigate?: (path: string) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const {
    getCallsign,
    getGfName,
    getAppName,
    getStartingGreetings,
    getCoupleOfficialDate,
    getTraits,
    getRandomTrait,
    loadSettings,
  } = useSettingsStore();

  const { initializeTheme, getCurrentThemeColor, waitForInitialization } =
    useThemeStore();

  const [data, setData] = useState<ComponentData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showNoticeDialog, setShowNoticeDialog] = useState(true);
  const [showCounterDialog, setShowCounterDialog] = useState(false);
  const [showOpsDialog, setShowOpsDialog] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize theme first
        await initializeTheme();
        await waitForInitialization();

        // Load settings
        await loadSettings();

        const coupleOfficialDate = getCoupleOfficialDate();
        const relationshipStats =
          calculateRelationshipStats(coupleOfficialDate);
        const anniversaryCountdown = 
          calculateAnniversaryCountdown(coupleOfficialDate);

        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          gfName: getGfName(),
          appName: getAppName(),
          startingGreetings: getStartingGreetings(),
          coupleOfficialDate,
          traits: getTraits(),
          relationshipStats,
          anniversaryCountdown,
        };

        setData(loadedData);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize LandingView:", error);
        // Provide fallback values with calculated stats
        const fallbackDate = "2025-01-01";
        const fallbackStats = calculateRelationshipStats(fallbackDate);
        const fallbackCountdown = calculateAnniversaryCountdown(fallbackDate);
        const fallbackThemeColor = getCurrentThemeColor() || "#F2A6A6";

        setData({
          themeColor: fallbackThemeColor,
          callsign: "darling",
          gfName: "Love",
          appName: "Love Space",
          startingGreetings: "baby",
          coupleOfficialDate: fallbackDate,
          traits: ["You are amazing"],
          relationshipStats: fallbackStats,
          anniversaryCountdown: fallbackCountdown,
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
    getGfName,
    getAppName,
    getStartingGreetings,
    getCoupleOfficialDate,
    getTraits,
    getRandomTrait,
  ]);

  const handleFeatureClick = (featureName: string) => {
    if (featureName === "Love Letters" && onNavigate) {
      onNavigate('/love-letters');
    } else {
      setSelectedFeature(featureName);
      setShowOpsDialog(true);
    }
  };

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
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}20, ${data.themeColor}40, #ffffff)`,
      }}
    >
      {/* Main Container - Fluid */}
      <div className="w-full container mx-auto space-y-8 px-4">
        {/* Greeting Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/peach-goma.gif"
              alt="Romantic greeting"
              style={{
                width: "min(200px, 40vw)",
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
            <Heart
              className="animate-pulse"
              size={24}
              fill={data.themeColor}
              color={data.themeColor}
            />
            Hello, {data.callsign}!
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
              color: "#333333",
            }}
          >
            Welcome to your personal love space, {data.gfName} 💕
          </p>
          
          {/* Guidance Subtitle */}
          <p
            className="text-base text-gray-600 mt-4"
            style={{
              fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
              color: "#666666",
            }}
          >
            Choose what you'd like to explore today
          </p>

          {/* Relationship Stats */}
          <div className="mt-6">
            <div 
              className="inline-block px-6 py-3 rounded-full cursor-pointer hover:scale-105 transition-all duration-300"
              style={{
                backgroundColor: `${data.themeColor}15`,
                border: `2px solid ${data.themeColor}30`,
              }}
              onClick={() => setShowCounterDialog(true)}
            >
              <p 
                className="text-lg font-semibold"
                style={{
                  color: data.themeColor,
                  fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
                }}
              >
                {data.anniversaryCountdown.isToday 
                  ? `🎉 Happy ${data.anniversaryCountdown.nextAnniversaryNumber}${data.anniversaryCountdown.ordinalSuffix} Anniversary!` 
                  : `💕 ${data.anniversaryCountdown.daysUntilAnniversary} days until our ${data.anniversaryCountdown.nextAnniversaryNumber}${data.anniversaryCountdown.ordinalSuffix} anniversary`
                }
              </p>
              <p 
                className="text-xs text-gray-500 mt-1"
                style={{
                  fontSize: "clamp(0.65rem, 1.8vw, 0.75rem)",
                }}
              >
                Click for details
              </p>
            </div>
          </div>
        </div>

        {/* 6 Button Cards Grid - 1 Row, 6 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
          {/* Love Letters Button Card */}
          <Card
            className="group hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `4px solid ${data.themeColor}`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 30px ${data.themeColor}80, ${createThemedShadow(data.themeColor)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = createThemedShadow(data.themeColor);
            }}
            onClick={() => handleFeatureClick("Love Letters")}
          >
            <CardContent className="p-6 text-center">
              <Button
                variant="ghost"
                className="w-full h-auto flex flex-col gap-3 p-4"
                style={{
                  color: data.themeColor,
                  backgroundColor: `${data.themeColor}10`,
                }}
              >
                <Mail 
                  size={32} 
                  color={data.themeColor}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
                  }}
                >
                  Love Letters
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Our Memories Button Card */}
          <Card
            className="group hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `4px solid ${data.themeColor}`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 30px ${data.themeColor}80, ${createThemedShadow(data.themeColor)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = createThemedShadow(data.themeColor);
            }}
            onClick={() => handleFeatureClick("Our Memories")}
          >
            <CardContent className="p-6 text-center">
              <Button
                variant="ghost"
                className="w-full h-auto flex flex-col gap-3 p-4"
                style={{
                  color: data.themeColor,
                  backgroundColor: `${data.themeColor}10`,
                }}
              >
                <Camera 
                  size={32} 
                  color={data.themeColor}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
                  }}
                >
                  Our Memories
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Our Music Playlist Button Card */}
          <Card
            className="group hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `4px solid ${data.themeColor}`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 30px ${data.themeColor}80, ${createThemedShadow(data.themeColor)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = createThemedShadow(data.themeColor);
            }}
            onClick={() => handleFeatureClick("Our Music Playlist")}
          >
            <CardContent className="p-6 text-center">
              <Button
                variant="ghost"
                className="w-full h-auto flex flex-col gap-3 p-4"
                style={{
                  color: data.themeColor,
                  backgroundColor: `${data.themeColor}10`,
                }}
              >
                <Music 
                  size={32} 
                  color={data.themeColor}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
                  }}
                >
                  Our Music Playlist
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Made for You Button Card */}
          <Card
            className="group hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `4px solid ${data.themeColor}`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 30px ${data.themeColor}80, ${createThemedShadow(data.themeColor)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = createThemedShadow(data.themeColor);
            }}
            onClick={() => handleFeatureClick("Made for You")}
          >
            <CardContent className="p-6 text-center">
              <Button
                variant="ghost"
                className="w-full h-auto flex flex-col gap-3 p-4"
                style={{
                  color: data.themeColor,
                  backgroundColor: `${data.themeColor}10`,
                }}
              >
                <Gift 
                  size={32} 
                  color={data.themeColor}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
                  }}
                >
                  Made for You
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Play with Me Button Card */}
          <Card
            className="group hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `4px solid ${data.themeColor}`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 30px ${data.themeColor}80, ${createThemedShadow(data.themeColor)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = createThemedShadow(data.themeColor);
            }}
            onClick={() => handleFeatureClick("Play with Me")}
          >
            <CardContent className="p-6 text-center">
              <Button
                variant="ghost"
                className="w-full h-auto flex flex-col gap-3 p-4"
                style={{
                  color: data.themeColor,
                  backgroundColor: `${data.themeColor}10`,
                }}
              >
                <Gamepad2 
                  size={32} 
                  color={data.themeColor}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
                  }}
                >
                  Play with Me
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Future Goals Button Card */}
          <Card
            className="group hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `4px solid ${data.themeColor}`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 30px ${data.themeColor}80, ${createThemedShadow(data.themeColor)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = createThemedShadow(data.themeColor);
            }}
            onClick={() => handleFeatureClick("Future Goals")}
          >
            <CardContent className="p-6 text-center">
              <Button
                variant="ghost"
                className="w-full h-auto flex flex-col gap-3 p-4"
                style={{
                  color: data.themeColor,
                  backgroundColor: `${data.themeColor}10`,
                }}
              >
                <Target 
                  size={32} 
                  color={data.themeColor}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
                  }}
                >
                  Future Goals
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Chat Bot Icon */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowChatBot(true)}
          className="w-16 h-16 rounded-full p-0 shadow-2xl hover:scale-110 transition-all duration-300 group"
          style={{
            backgroundColor: data.themeColor,
            borderColor: data.themeColor,
          }}
        >
          <img
            src="/assets/dudu-cute.gif"
            alt="Chat with love assistant"
            className="w-12 h-12 rounded-full group-hover:scale-105 transition-transform duration-300"
          />
        </Button>
      </div>
      
      {/* Notice Dialog */}
      <NoticeDialog 
        open={showNoticeDialog} 
        onOpenChange={setShowNoticeDialog} 
      />
      
      {/* Counter Dialog */}
      <CounterDialog 
        open={showCounterDialog} 
        onOpenChange={setShowCounterDialog} 
      />
      
      {/* Ops Dialog */}
      <OpsDialog 
        open={showOpsDialog} 
        onOpenChange={setShowOpsDialog} 
        featureName={selectedFeature}
      />
      
      {/* Chat Bot */}
      <ChatBot 
        isOpen={showChatBot} 
        onClose={() => setShowChatBot(false)} 
      />
    </div>
  );
};

export default LandingView;
