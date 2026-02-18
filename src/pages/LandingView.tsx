import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../stores/settings";
import { useThemeStore } from "../stores/theme";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Camera, Music, Gift } from "lucide-react";
import {
  calculateRelationshipStats,
  createThemedShadow,
  type RelationshipStats,
} from "../utils/helpers";
import NoticeDialog from "./landing/dialogs/NoticeDialog";
import CounterDialog from "./landing/dialogs/CounterDialog";
import OpsDialog from "./landing/dialogs/OpsDialog";

interface ComponentData {
  themeColor: string;
  callsign: string;
  couplename: string;
  appName: string;
  startingGreetings: string;
  coupleOfficialDate: string;
  traits: string[];
  relationshipStats: RelationshipStats;
}

const LandingView: React.FC = () => {
  const {
    getCallsign,
    getCouplename,
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

        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          couplename: getCouplename(),
          appName: getAppName(),
          startingGreetings: getStartingGreetings(),
          coupleOfficialDate,
          traits: getTraits(),
          relationshipStats,
        };

        setData(loadedData);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize LandingView:", error);
        // Provide fallback values with calculated stats
        const fallbackDate = "2025-01-01";
        const fallbackStats = calculateRelationshipStats(fallbackDate);
        const fallbackThemeColor = getCurrentThemeColor() || "#F2A6A6";

        setData({
          themeColor: fallbackThemeColor,
          callsign: "darling",
          couplename: "Love",
          appName: "Love Space",
          startingGreetings: "baby",
          coupleOfficialDate: fallbackDate,
          traits: ["You are amazing"],
          relationshipStats: fallbackStats,
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
    getCouplename,
    getAppName,
    getStartingGreetings,
    getCoupleOfficialDate,
    getTraits,
    getRandomTrait,
  ]);

  const handleFeatureClick = (featureName: string) => {
    setSelectedFeature(featureName);
    setShowOpsDialog(true);
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
            Welcome to your personal love space, {data.couplename} 💕
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
                💕 {data.relationshipStats.totalDays} days together
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

        {/* 4 Button Cards Grid - 1 Row, 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Schedule a Date Button Card */}
          <Card
            className="group hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `2px solid ${data.themeColor}30`,
            }}
            onClick={() => handleFeatureClick("Schedule a Date")}
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
                <Calendar 
                  size={32} 
                  color={data.themeColor}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
                  }}
                >
                  Schedule a Date
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Our Memories Button Card */}
          <Card
            className="group hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `2px solid ${data.themeColor}30`,
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
            className="group hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `2px solid ${data.themeColor}30`,
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
            className="group hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: createThemedShadow(data.themeColor),
              border: `2px solid ${data.themeColor}30`,
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
        </div>
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
    </div>
  );
};

export default LandingView;
