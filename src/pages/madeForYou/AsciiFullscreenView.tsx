import React, { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings";
import { useThemeStore } from "@/stores/theme";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Info } from "lucide-react";
import { AsciiArt } from "@/components/ui/ascii-art";
import { useIsMobile } from "@/hooks/use-mobile";
import AsciiDialog from "./dialogs/AsciiDialog";

interface AsciiFullscreenViewProps {
  onNavigate?: (path: string) => void;
}

const LARGE_SCREEN_BREAKPOINT = 1024;

const AsciiFullscreenView: React.FC<AsciiFullscreenViewProps> = ({ onNavigate }) => {
  const { loadSettings } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();
  const isMobile = useIsMobile();
  
  const [themeColor, setThemeColor] = useState("#F2A6A6");
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(true); // Show dialog immediately
  
  // Randomly select ASCII art source from set1.jpg to set5.jpg (only once when component mounts)
  const [asciiSource] = useState(() => {
    const randomSet = Math.floor(Math.random() * 5) + 1; // Random number 1-5
    return `/assets/ascii/set${randomSet}.jpg`;
  });
  
  // Calculate resolution based on current state - no useState needed
  const resolution = React.useMemo(() => {
    if (isMobile) return 80;
    return window.innerWidth >= LARGE_SCREEN_BREAKPOINT ? 200 : 120;
  }, [isMobile]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        setThemeColor(getCurrentThemeColor());
        setIsLoading(false);
        
        // Dialog is already shown by default, no need to set timeout
      } catch (error) {
        console.error("Failed to initialize AsciiFullscreenView:", error);
        setThemeColor("#F2A6A6");
        setIsLoading(false);
      }
    };

    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCurrentThemeColor]);

  // No need for separate resize handler - useIsMobile hook handles this

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0a" }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: themeColor }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <div
        className={`sticky top-0 z-10 w-full transition-all duration-500 ${
          showDialog ? 'blur-sm' : 'blur-none'
        }`}
        style={{
          backdropFilter: "blur(12px)",
          borderBottom: `2px solid ${themeColor}30`,
          filter: showDialog ? 'blur(4px) brightness(0.7)' : 'none',
          pointerEvents: showDialog ? 'none' : 'auto',
          padding: isMobile ? 'min(12px, 3vw) min(16px, 4vw)' : 'min(16px, 4vw) min(20px, 5vw)'
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "icon"}
            onClick={() => onNavigate?.("/girlfriend/madeforyou")}
            style={{ color: themeColor }}
            className="hover:bg-transparent"
          >
            <ArrowLeft size={isMobile ? 18 : 20} />
          </Button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!isMobile && <Maximize2 size={22} color={themeColor} />}
            <h1
              className="font-bold truncate"
              style={{
                color: themeColor,
                fontSize: isMobile ? "clamp(0.9rem, 4vw, 1.1rem)" : "clamp(1rem, 3.5vw, 1.4rem)",
              }}
            >
              {isMobile ? "ASCII Gallery" : "ASCII Art Gallery"}
            </h1>
          </div>

          <Button
            variant="ghost"
            size={isMobile ? "sm" : "icon"}
            onClick={() => setShowDialog(true)}
            style={{ color: themeColor }}
            className="hover:bg-transparent"
          >
            <Info size={isMobile ? 18 : 20} />
          </Button>
        </div>
      </div>

      {/* Main Content - Scrollable ASCII Art */}
      <div 
        className={`flex-1 w-full transition-all duration-500 ${
          showDialog ? 'blur-lg scale-95' : 'blur-none scale-100'
        }`}
        style={{
          filter: showDialog ? 'blur(8px) brightness(0.6)' : 'none',
          pointerEvents: showDialog ? 'none' : 'auto',
          overflow: 'auto',
          // Better mobile scrolling
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div 
          className="w-full flex justify-center"
          style={{
            padding: isMobile ? 'min(8px, 2vw)' : 'min(16px, 3vw)',
            minHeight: '100%'
          }}
        >
          <AsciiArt
            src={asciiSource}
            resolution={resolution}
            charset={isMobile ? "simple" : "dense"} // Simpler characters for mobile
            colored={true}
            backgroundColor="#0a0a0a"
            animated={!isMobile} // Disable animations on mobile for better performance
            animationStyle="matrix"
            animateOnView={!isMobile}
            objectFit="contain"
            className="w-full"
          />
        </div>
      </div>

      {/* ASCII Art Explanation Dialog */}
      <AsciiDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
};

export default AsciiFullscreenView;
