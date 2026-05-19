import React, { useState } from "react";
import Navbar from "../components/Navbar";
import OpsDialog from "../pages/landing/dialogs/OpsDialog";
import ChatBot from "../pages/landing/components/ChatBot";
import { Button } from "@/components/ui/button";
import { getRouteByPath } from "../utils/routes";
import LoveLetterView from "../pages/loveLetter/LoveLetterView";
import SadCategoryView from "../pages/loveLetter/sadCategory/SadCategoryView";
import MissCategoryView from "../pages/loveLetter/missCategory/MissCategoryView";
import MadeForYouView from "../pages/madeForYou/MadeForYouView";
import PlayListView from "../pages/Playlist/PlayListView";
import MemoriesView from "../pages/memories/MemoriesView";
import EvilThoughtsView from "../pages/evilThoughts/EvilThoughtsView";
import TarotCardsView from "../pages/tarotCards/TarotCardsView";
import TarotCardsWidgetView from "../pages/tarotCards/TarotCardsWidgetView";
import TarotReadingView from "../pages/tarotCards/TarotReadingView";
import NullaView from "../pages/nulla/NullaView";
import { useThemeStore } from "../stores/theme";
import { isFeatureActive } from "../utils/helpers";

interface DefaultLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
  currentPath,
  onNavigate,
}) => {
  const [showOpsDialog, setShowOpsDialog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [showChatBot, setShowChatBot] = useState(false);

  const { getCurrentThemeColor } = useThemeStore();
  const themeColor = getCurrentThemeColor();

  const handleNavigate = (path: string) => {
    const route = getRouteByPath(path);

    if (route && route.name !== "Home" && !isFeatureActive(route.name)) {
      setSelectedFeature(route.name);
      setShowOpsDialog(true);
      return;
    }

    if (route) {
      onNavigate(path);
    }
  };

  const isNullaRoute = currentPath === "/nulla";

  // Render component based on route
  const renderContent = () => {
    const route = getRouteByPath(currentPath);

    if (!route) {
      return null;
    }

    switch (route.component) {
      case "LoveLetterView":
        return <LoveLetterView onNavigate={onNavigate} />;
      case "SadCategoryView":
        return <SadCategoryView />;
      case "MissCategoryView":
        return <MissCategoryView onNavigate={onNavigate} />;
      case "MadeForYouView":
        return <MadeForYouView onNavigate={onNavigate} />;
      case "PlayListView":
        return <PlayListView />;
      case "MemoriesView":
        return <MemoriesView />;
      case "EvilThoughtsView":
        return <EvilThoughtsView />;
      case "TarotCardsView":
        return <TarotCardsView onNavigate={onNavigate} />;
      case "TarotCardsWidgetView":
        // Reading context is now managed by the store, not URL parameters
        return <TarotCardsWidgetView onNavigate={onNavigate} />;
      case "TarotReadingView":
        // Reading context is now managed by the store, not URL parameters
        return <TarotReadingView onNavigate={onNavigate} />;
      case "NullaView":
        return <NullaView onNavigate={onNavigate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="w-full">{renderContent()}</main>

      {/* ChatBot Toggle Button */}
      {!showChatBot && !isNullaRoute && (
        <Button
          onClick={() => setShowChatBot(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full p-0 shadow-2xl hover:scale-110 transition-all duration-300 group z-50"
          style={{
            backgroundColor: themeColor,
            borderColor: themeColor,
          }}
        >
          <img
            src="/assets/nulla/nulla-icon.png"
            alt="Chat with love assistant"
            className="w-12 h-12 rounded-full group-hover:scale-105 transition-transform duration-300"
          />
        </Button>
      )}

      {/* ChatBot Component */}
      {!isNullaRoute && (
        <ChatBot isOpen={showChatBot} onClose={() => setShowChatBot(false)} />
      )}

      {/* Ops Dialog for coming soon features */}
      <OpsDialog
        open={showOpsDialog}
        onOpenChange={setShowOpsDialog}
        featureName={selectedFeature}
      />
    </div>
  );
};

export default DefaultLayout;
