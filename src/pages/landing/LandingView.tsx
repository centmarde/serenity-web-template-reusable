import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Camera,
  Music,
  Gift,
  Mail,
  Target,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  calculateRelationshipStats,
  calculateAnniversaryCountdown,
  createActiveCardStyles,
  createInactiveCardStyles,
  isFeatureActive,
  type RelationshipStats,
  type AnniversaryCountdown,
} from "../../utils/helpers";
import NoticeDialog from "./dialogs/NoticeDialog";
import CelebrationDialog from "./dialogs/CelebrationDialog";
import {
  useCurrentDialog,
  useDialogActions,
} from "../../composables/dialogControll";
import CounterDialog from "./dialogs/CounterDialog";
import OpsDialog from "./dialogs/OpsDialog";
import ChatBot from "./components/ChatBot";
import MemoryGlassOverlay from "../../components/MemoryGlassOverlay";
import EvilThoughtsBadge from "../../components/EvilThoughtsBadge";

interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  appName: string;
  startingGreetings: string;
  coupleOfficialDate: string;
  traits: string[];
  useImagePreview: boolean;
  relationshipStats: RelationshipStats;
  anniversaryCountdown: AnniversaryCountdown;
}

interface LandingViewProps {
  onNavigate?: (path: string) => void;
}

interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  imageSrc?: string;
  useImagePreview: boolean;
  themeColor: string;
  badge?: React.ReactNode;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  icon,
  imageSrc,
  useImagePreview,
  themeColor,
  badge,
  onClick,
}) => {
  const isActive = isFeatureActive(title);
  const cardStyles = isActive
    ? createActiveCardStyles(themeColor)
    : createInactiveCardStyles(themeColor);
  const buttonBgColor = isActive ? `${themeColor}10` : `${cardStyles.color}10`;
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      className="group hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-lg"
      style={{
        backgroundColor: "white",
        border: `2px solid ${themeColor}40`,
        borderRadius: "16px",
        transition: "all 0.3s ease",
        opacity: isActive ? 1 : 0.75,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 25px ${themeColor}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }}
      onClick={onClick}
    >
      <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full min-h-[160px]">
        {/* Wide, short pink background with large overlapping image */}
        <div className="relative mb-3 flex-1 flex items-center justify-center">
          <div
            className="rounded-lg"
            style={{
              backgroundColor: buttonBgColor,
              width: "140px",
              height: "60px",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {useImagePreview && imageSrc && !imageError ? (
              <img
                src={imageSrc}
                alt={title}
                className="object-contain transform hover:scale-110 transition-transform duration-300"
                onError={() => setImageError(true)}
                style={{
                  width: "120px",
                  height: "120px",
                  filter: isActive ? "none" : "grayscale(30%) opacity(80%)",
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ width: "120px", height: "120px" }}
              >
                {icon}
              </div>
            )}
          </div>
          {badge && <div className="absolute -top-2 -right-2">{badge}</div>}
        </div>

        {/* Minimal text below */}
        <div className="mt-auto">
          <h3
            className="font-medium text-center leading-tight"
            style={{
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
              color: isActive ? themeColor : `${themeColor}80`,
            }}
          >
            {title}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const {
    getCallsign,
    getGfName,
    getAppName,
    getStartingGreetings,
    getCoupleOfficialDate,
    getTraits,
    getRandomTrait,
    getUseImagePreview,
    loadSettings,
  } = useSettingsStore();

  const {
    initializeTheme,
    getCurrentThemeColor,
    getSafeThemeColor,
    waitForInitialization,
  } = useThemeStore();

  const [data, setData] = useState<ComponentData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showCounterDialog, setShowCounterDialog] = useState(false);

  // Dialog controller
  const currentDialog = useCurrentDialog();
  const { closeCurrentDialog } = useDialogActions();
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
          useImagePreview: getUseImagePreview(),
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
        const fallbackThemeColor = getSafeThemeColor();

        setData({
          themeColor: fallbackThemeColor,
          callsign: "darling",
          gfName: "Love",
          appName: "Love Space",
          startingGreetings: "baby",
          coupleOfficialDate: fallbackDate,
          useImagePreview: true,
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

  const handleNoticeDialogClose = (open: boolean) => {
    if (!open) {
      // Use dialog controller to properly close and show next dialog
      closeCurrentDialog();
    }
  };

  const handleCelebrationDialogClose = (open: boolean) => {
    if (!open) {
      // Use dialog controller to properly close and show next dialog
      closeCurrentDialog();
    }
  };

  const handleFeatureClick = (featureName: string) => {
    if (!isFeatureActive(featureName)) {
      setSelectedFeature(featureName);
      setShowOpsDialog(true);
    } else if (featureName === "Love Letters" && onNavigate) {
      onNavigate("/love-letters");
    } else if (featureName === "Made for You" && onNavigate) {
      onNavigate("/girlfriend/madeforyou");
    } else if (featureName === "Our Music Playlist" && onNavigate) {
      onNavigate("/music");
    } else if (featureName === "Our Memories" && onNavigate) {
      onNavigate("/memories");
    } else if (featureName === "Evil Thoughts" && onNavigate) {
      onNavigate("/evil-thoughts");
    } else if (featureName === "Tarot Cards" && onNavigate) {
      onNavigate("/tarot-cards");
    } else if (featureName === "Nulla" && onNavigate) {
      onNavigate("/nulla");
    } else {
      setSelectedFeature(featureName);
      setShowOpsDialog(true);
    }
  };

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
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}20, ${data.themeColor}40, #ffffff)`,
      }}
    >
      {/* Memory Glass Background Overlay */}
      <MemoryGlassOverlay />

      {/* Main Container - Fluid */}
      <div className="w-full container mx-auto space-y-8 px-4 relative z-10">
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
              fontSize: "clamp(2rem, 3vw, 1.25rem)",
              color: "#333333",
              fontFamily: "Dancing Script, cursive",
            }}
          >
            " we'll figure it out together is a love language. "
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
                backgroundColor: `white`,
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
                  : `💕 ${data.anniversaryCountdown.daysUntilAnniversary} days until our ${data.anniversaryCountdown.nextAnniversaryNumber}${data.anniversaryCountdown.ordinalSuffix} anniversary`}
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

        {/* 6 Button Cards Grid - 2 Cols Mobile, 6 Cols Large */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full mb-24">
          <FeatureCard
            title="Love Letters"
            imageSrc="/assets/images/LoveLetters.png"
            useImagePreview={data.useImagePreview}
            icon={
              <Mail
                size={32}
                color={
                  isFeatureActive("Love Letters")
                    ? data.themeColor
                    : createInactiveCardStyles(data.themeColor).color
                }
              />
            }
            themeColor={data.themeColor}
            onClick={() => handleFeatureClick("Love Letters")}
          />

          <FeatureCard
            title="Our Memories"
            imageSrc="/assets/images/OurMemories.png"
            useImagePreview={data.useImagePreview}
            icon={
              <Camera
                size={32}
                color={
                  isFeatureActive("Our Memories")
                    ? data.themeColor
                    : createInactiveCardStyles(data.themeColor).color
                }
              />
            }
            themeColor={data.themeColor}
            onClick={() => handleFeatureClick("Our Memories")}
          />

          <FeatureCard
            title="Our Music Playlist"
            imageSrc="/assets/images/OurPlaylist.png"
            useImagePreview={data.useImagePreview}
            icon={
              <Music
                size={32}
                color={
                  isFeatureActive("Our Music Playlist")
                    ? data.themeColor
                    : createInactiveCardStyles(data.themeColor).color
                }
              />
            }
            themeColor={data.themeColor}
            onClick={() => handleFeatureClick("Our Music Playlist")}
          />

          <FeatureCard
            title="Made for You"
            imageSrc="/assets/images/MadeForYou.png"
            useImagePreview={data.useImagePreview}
            icon={
              <Gift
                size={32}
                color={
                  isFeatureActive("Made for You")
                    ? data.themeColor
                    : createInactiveCardStyles(data.themeColor).color
                }
              />
            }
            themeColor={data.themeColor}
            onClick={() => handleFeatureClick("Made for You")}
          />

          <FeatureCard
            title="Evil Thoughts"
            imageSrc="/assets/images/EvilThoughts.png"
            useImagePreview={data.useImagePreview}
            icon={
              <Zap
                size={32}
                color={
                  isFeatureActive("Evil Thoughts")
                    ? data.themeColor
                    : createInactiveCardStyles(data.themeColor).color
                }
              />
            }
            themeColor={data.themeColor}
            badge={<EvilThoughtsBadge />}
            onClick={() => handleFeatureClick("Evil Thoughts")}
          />

          <FeatureCard
            title="Tarot Cards"
            imageSrc="/assets/images/tarotCard.png"
            useImagePreview={data.useImagePreview}
            icon={
              <Target
                size={32}
                color={
                  isFeatureActive("Tarot Cards")
                    ? data.themeColor
                    : createInactiveCardStyles(data.themeColor).color
                }
              />
            }
            themeColor={data.themeColor}
            onClick={() => handleFeatureClick("Tarot Cards")}
          />

          <FeatureCard
            title="Nulla"
            imageSrc="/assets/nulla/nulla-icon.png"
            useImagePreview={data.useImagePreview}
            icon={
              <Sparkles
                size={32}
                color={
                  isFeatureActive("Nulla")
                    ? data.themeColor
                    : createInactiveCardStyles(data.themeColor).color
                }
              />
            }
            themeColor={data.themeColor}
            onClick={() => handleFeatureClick("Nulla")}
          />
        </div>
      </div>

      {/* Floating Chat Bot Icon */}
      <div className="fixed bottom-6 right-6 z-50">
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

      {/* Notice Dialog - Controlled by dialog controller */}
      {currentDialog === "notice" && (
        <NoticeDialog
          open={true}
          onOpenChange={handleNoticeDialogClose}
          onNavigate={onNavigate}
        />
      )}

      {/* Celebration Dialog - Controlled by dialog controller */}
      {currentDialog === "celebration" && (
        <CelebrationDialog
          open={true}
          onOpenChange={handleCelebrationDialogClose}
        />
      )}

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
      <ChatBot isOpen={showChatBot} onClose={() => setShowChatBot(false)} />
    </div>
  );
};

export default LandingView;
