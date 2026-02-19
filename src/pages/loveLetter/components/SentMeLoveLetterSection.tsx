import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../../stores/settings";
import { useThemeStore } from "../../../stores/theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Heart, Sparkles } from "lucide-react";
import SentMeLoveLetterDialog from "../dialogs/SentMeLoveLetterDialog";

interface ComponentData {
  callsign: string;
  isInitialized: boolean;
}

const SentMeLoveLetterSection: React.FC = () => {
  const { getCallsign, loadSettings } = useSettingsStore();
  const { initializeTheme, waitForInitialization, isThemeInitialized } = useThemeStore();
  
  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendLetterDialogOpen, setIsSendLetterDialogOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        const loadedData: ComponentData = {
          callsign: getCallsign(),
          isInitialized: isThemeInitialized(),
        };

        setData(loadedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Sent Me Love Letter Section:", error);
        // Fallback values
        setData({
          callsign: 'Love',
          isInitialized: false,
        });
        setIsLoading(false);
      }
    };
    initialize();
  }, [initializeTheme, waitForInitialization, loadSettings, getCallsign, isThemeInitialized]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Clean container without backgrounds */}
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Left Column - GIF Section (2 columns on large screens) */}
          <div className="lg:col-span-2 flex items-center justify-center p-8 lg:p-12">
              <div className="relative group">
                <img
                  src="/assets/peach-goma.gif"
                  alt="Send love letter animation"
                  className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-cover group-hover:scale-105 transition-all duration-300"
                />
              </div>
          </div>
          
          {/* Right Column - Content Section (3 columns on large screens) */}
          <div className="lg:col-span-3 flex flex-col justify-center p-8 lg:p-12 space-y-8">
            {/* Header with badge */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium text-primary">
                  💌 Love Letters
                </Badge>
              </div>
              
              <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 leading-tight">
                Share Your{' '}
                <span className="text-primary">
                  Heart
                </span>
              </h3>
            </div>

            {/* Description */}
            <div className="space-y-4 text-center lg:text-left">
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                Send me a love letter filled with your thoughts, dreams, and all the little things that make your heart flutter.
              </p>
              
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-primary">
                <Heart className="w-4 h-4 fill-current" />
                <span className="italic text-gray-500">"Every word becomes a treasure I'll keep forever"</span>
                <Heart className="w-4 h-4 fill-current" />
              </div>
            </div>
            
            {/* Action Button */}
            <div className="flex justify-center lg:justify-start pt-4">
              <Button
                onClick={() => setIsSendLetterDialogOpen(true)}
                size="lg"
                className="group px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Send Me a Love Letter</span>
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                </div>
              </Button>
            </div>

           
          </div>
        </div>
      </div>

      {/* Send Me Love Letter Dialog */}
      <SentMeLoveLetterDialog 
        isOpen={isSendLetterDialogOpen}
        onOpenChange={setIsSendLetterDialogOpen}
      />
      
    </div>
  );
};

export default SentMeLoveLetterSection;
