import React, { useState, useEffect, useMemo } from "react";
import { useSettingsStore } from "../../../../stores/settings";
import { useThemeStore } from "../../../../stores/theme";
import useMessagesStore from "../../../../stores/messagesData";
import type { LoveLetter } from "../../../../stores/messagesData";
import type { Question } from "../composables/aiMissForms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "../../../../hooks/use-mobile";

import { Button } from "@/components/ui/button";
import { Heart, Calendar, User, Wand2 } from "lucide-react";

interface ComponentData {
  themeColor: string;
  callsign: string;
  bfName: string;
  gfName: string;
}

interface MissLettersWidgetProps {
  aiEnhancedData?: {
    questions: Question[],
    baseLetter: LoveLetter | null,
    tone: 'romantic' | 'affectionate' | 'playful' | 'reassuring',
    enhancedMessage?: {
      title: string,
      content: string,
      tone: string
    }
  } | null;
  isGeneratingResponse?: boolean;
}

const MissLettersWidget: React.FC<MissLettersWidgetProps> = ({ 
  aiEnhancedData, 
  isGeneratingResponse = false 
}) => {
  const isMobile = useIsMobile();
  
  const {
    getCallsign,
    getBfName,
    getGfName,
    loadSettings,
  } = useSettingsStore();

  const { initializeTheme, getCurrentThemeColor, waitForInitialization } =
    useThemeStore();

  const {
    letters,
    isLoading,
    error,
    fetchLetters,
    getLettersByCategory,
    getImageUrl,
    clearError,
    createLetter
  } = useMessagesStore();

  const [data, setData] = useState<ComponentData | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          bfName: getBfName(),
          gfName: getGfName(),
        };

        setData(loadedData);
        
        // Fetch letters from database
        await fetchLetters();
      } catch (error) {
        console.error("Failed to initialize Miss Letters Widget:", error);
      }
    };
    initialize();
  }, [
    initializeTheme,
    waitForInitialization,
    loadSettings,
    getCurrentThemeColor,
    getCallsign,
    getBfName,
    getGfName,
    fetchLetters,
  ]);

  // Use useMemo to efficiently filter letters by "miss" category
  const missLetters = useMemo(() => {
    const filtered = getLettersByCategory("miss");
    console.log("All letters:", letters);
    console.log("Filtered miss letters:", filtered);
    console.log("Letter categories:", letters.map(l => ({ id: l.id, category: l.category, title: l.title })));
    return filtered;
  }, [getLettersByCategory, letters]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  const handleCloseModal = () => {
    setSelectedLetter(null);
  };

  const handleCreateTestLetter = async () => {
    const testLetter = {
      title: "Missing You So Much",
      message: "Every moment apart makes me appreciate you more. I can't wait to hold you in my arms again and tell you how much you mean to me. Distance means nothing when someone means everything. 💕",
      category: "miss",
      is_girlfriend: false
    };

    try {
      await createLetter(testLetter);
      console.log("Test miss letter created successfully");
    } catch (error) {
      console.error("Failed to create test letter:", error);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: getCurrentThemeColor() }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading letters: {error}</p>
            <Button
              onClick={() => {
                clearError();
                fetchLetters();
              }}
              style={{ backgroundColor: data.themeColor }}
              className="text-white"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: data.themeColor }}
        ></div>
        <span className="ml-3 text-gray-600">Loading letters...</span>
      </div>
    );
  }

  if (missLetters.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <Heart 
              size={48} 
              className="mx-auto mb-4 text-gray-400"
              fill="currentColor"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Miss Letters Found
            </h3>
            <p className="text-gray-500 mb-4">
              No letters with category "miss" were found in the database.
            </p>
            <div className="text-xs text-gray-400 text-left bg-gray-50 p-3 rounded mb-4">
              <strong>Debug Info:</strong><br/>
              Total letters in database: {letters.length}<br/>
              Categories found: {letters.map(l => l.category).filter(Boolean).join(", ") || "None"}<br/>
              Looking for category: "miss"
            </div>
            <Button
              onClick={handleCreateTestLetter}
              style={{ backgroundColor: data.themeColor }}
              className="text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Test Miss Letter"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-none mx-auto px-2 sm:px-4 lg:px-8">
      {/* AI Generation Loading State */}
      {isGeneratingResponse && (
        <Card className="mb-6 max-w-4xl mx-auto" style={{ borderColor: `${data.themeColor}40` }}>
          <CardContent className="p-6">
            <div className="text-center">
              <div 
                className="rounded-full p-3 mx-auto mb-4 animate-pulse"
                style={{ backgroundColor: `${data.themeColor}20`, width: 'fit-content' }}
              >
                <Wand2 
                  size={32} 
                  style={{ color: data.themeColor }}
                  className="animate-spin"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: data.themeColor }}>
                Creating Your Personalized Message...
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Analyzing your responses and generating a tailored missing you message just for you
              </p>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Enhanced Message Section */}
      {aiEnhancedData && !isGeneratingResponse && (
        <div className="w-full mb-6">
          {/* Enhanced message display - Love Letter Format */}
          <div 
            className="love-letter-container"
            style={{ 
              borderColor: `${data.themeColor}40`,
            }}
          >
            {aiEnhancedData.enhancedMessage ? (
              <div className="romantic-letter">
                {/* Letter Title */}
                <div className="text-center mb-6">
                  <h2 
                    className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-2`}
                    style={{ color: data.themeColor }}
                  >
                   {aiEnhancedData.baseLetter?.title || "Untitled Letter"}
                  </h2>
                </div>

                {/* Love Letter Greeting */}
                <div 
                  className={`romantic-greeting ${isMobile ? 'text-sm' : 'text-base'}`} 
                  style={{ color: data.themeColor }}
                >
                  My Dearest {data.gfName || "Love"},
                </div>
                
                {/* Enhanced Message Content */}
                <div 
                  className="romantic-content text-gray-800"
                 style={{ 
                    fontSize: isMobile ? '0.85rem' : 'clamp(1.125rem, 2.5vw, 1.25rem)', 
                    lineHeight: isMobile ? '1.4' : '1.6',
                    fontFamily: isMobile ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
                    padding: 0,
                    margin: 0
                  }}
                >
                  {aiEnhancedData.enhancedMessage.content}
                </div>
                
                {/* Bottom Section */}
                <div className="flex flex-col">
                  {/* Decorative Hearts */}
                  <div className="flex justify-center items-center gap-2 mb-4 opacity-60">
                    <Heart size={12} fill={data.themeColor} style={{ color: data.themeColor }} />
                    <Heart size={16} fill={data.themeColor} style={{ color: data.themeColor }} />
                    <Heart size={12} fill={data.themeColor} style={{ color: data.themeColor }} />
                  </div>
                  
                  {/* Love Letter Closing */}
                  <div 
                    className={`romantic-signature ${isMobile ? 'text-sm' : 'text-base'}`} 
                    style={{ color: data.themeColor }}
                  >
                    <div className="mb-2">With all my love,</div>
                    <div className="font-semibold">
                      Your Babi {data.bfName || "❤️"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="romantic-letter">
                <div 
                  className={`romantic-greeting ${isMobile ? 'text-sm' : 'text-base'}`} 
                  style={{ color: data.themeColor }}
                >
                  My Dearest {data.gfName || "Love"},
                </div>
                <p className={`romantic-content text-gray-700 italic text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  "✨ Your personalized message has been added to the collection below! ✨"
                </p>
                <div 
                  className={`romantic-signature ${isMobile ? 'text-sm' : 'text-base'}`} 
                  style={{ color: data.themeColor }}
                >
                  <div className="mb-2">With all my love,</div>
                  <div className="font-semibold">
                    Your Babi {data.bfName || "❤️"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      

      {/* Letter Detail Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle 
                  className="text-xl"
                  style={{ color: data.themeColor }}
                >
                  {selectedLetter.title || "Untitled Letter"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(selectedLetter.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>
                    From {selectedLetter.is_girlfriend ? data.gfName || "Girlfriend" : data.bfName || "Boyfriend"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedLetter.attach_image && (
                <div className="mb-4">
                  <img
                    src={getImageUrl(selectedLetter.attach_image)}
                    alt="Attached image"
                    className="w-full rounded-lg max-h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedLetter.message || "No content"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MissLettersWidget;