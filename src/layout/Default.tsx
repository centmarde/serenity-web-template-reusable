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
import { useThemeStore } from "../stores/theme";

// Coming soon component
const ComingSoonView: React.FC<{ routeName: string }> = ({ routeName }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">{routeName}</h1>
      <p className="text-xl text-gray-600">Coming Soon! 💕</p>
      <p className="text-gray-500">This feature is under development</p>
    </div>
  </div>
);

interface DefaultLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ currentPath, onNavigate }) => {
  const [showOpsDialog, setShowOpsDialog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [showChatBot, setShowChatBot] = useState(false);
  
  const { getCurrentThemeColor } = useThemeStore();
  const themeColor = getCurrentThemeColor();

  const handleNavigate = (path: string) => {
    const route = getRouteByPath(path);
    
    if (route && route.component !== 'ComingSoon') {
      // Navigate to actual page
      onNavigate(path);
    } else if (route) {
      // Show OpsDialog for coming soon features
      setSelectedFeature(route.name);
      setShowOpsDialog(true);
    }
  };

  // Render component based on route
  const renderContent = () => {
    const route = getRouteByPath(currentPath);
    
    if (!route) {
      return <ComingSoonView routeName="Page Not Found" />;
    }

    switch (route.component) {
      case 'LoveLetterView':
        return <LoveLetterView onNavigate={onNavigate} />;
      case 'SadCategoryView':
        return <SadCategoryView />;
      case 'MissCategoryView':
        return <MissCategoryView onNavigate={onNavigate} />;
      case 'MadeForYouView':
        return <MadeForYouView onNavigate={onNavigate} />;
      case 'PlayListView':
        return <PlayListView />;
      case 'MemoriesView':
        return <MemoriesView />;
      case 'EvilThoughtsView':
        return <EvilThoughtsView onNavigate={onNavigate} />;
      case 'ComingSoon':
        return <ComingSoonView routeName={route.name} />;
      default:
        return <ComingSoonView routeName={route.name} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar 
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />
      
      {/* Main Content */}
      <main className="w-full">
        {renderContent()}
      </main>

      {/* ChatBot Toggle Button */}
      {!showChatBot && (
        <Button
                 onClick={() => setShowChatBot(true)}
                 className="fixed bottom-6 right-6 w-16 h-16 rounded-full p-0 shadow-2xl hover:scale-110 transition-all duration-300 group z-50"
                 style={{
                   backgroundColor: themeColor,
                   borderColor: themeColor,
                 }}
               >
                 <img
                   src="/assets/dudu-cute.gif"
                   alt="Chat with love assistant"
                   className="w-12 h-12 rounded-full group-hover:scale-105 transition-transform duration-300"
                 />
               </Button>
      )}

      {/* ChatBot Component */}
      <ChatBot 
        isOpen={showChatBot}
        onClose={() => setShowChatBot(false)}
      />

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
