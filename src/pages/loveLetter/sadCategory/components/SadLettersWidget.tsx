import React, { useState, useEffect, useMemo } from "react";
import { useSettingsStore } from "../../../../stores/settings";
import { useThemeStore } from "../../../../stores/theme";
import useMessagesStore from "../../../../stores/messagesData";
import type { LoveLetter } from "../../../../stores/messagesData";
import type { Question } from "../composables/aiSadForms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, User, Image as  Sparkles, Wand2 } from "lucide-react";

interface ComponentData {
  themeColor: string;
  callsign: string;
  bfName: string;
  gfName: string;
}

interface SadLettersWidgetProps {
  aiEnhancedData?: {
    questions: Question[],
    baseLetter: LoveLetter | null,
    tone: 'gentle' | 'encouraging' | 'loving' | 'supportive',
    enhancedMessage?: {
      title: string,
      content: string,
      tone: string
    }
  } | null;
  isGeneratingResponse?: boolean;
}

const SadLettersWidget: React.FC<SadLettersWidgetProps> = ({ 
  aiEnhancedData, 
  isGeneratingResponse = false 
}) => {
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
        console.error("Failed to initialize Sad Letters Widget:", error);
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

  // Use useMemo to efficiently filter letters by "sad" category
  const sadLetters = useMemo(() => {
    const filtered = getLettersByCategory("sad");
    console.log("All letters:", letters);
    console.log("Filtered sad letters:", filtered);
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
      title: "A Gentle Reminder",
      message: "Hey beautiful, I know today might feel heavy, but I want you to know that you're incredibly strong. Every storm passes, and you've weathered so many before. I believe in you, and I'm here for you always. You're loved more than you know. 💙",
      category: "sad",
      is_girlfriend: false
    };

    try {
      await createLetter(testLetter);
      console.log("Test sad letter created successfully");
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
      <Card className="max-w-2xl mx-auto">
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

  if (sadLetters.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <Heart 
              size={48} 
              className="mx-auto mb-4 text-gray-400"
              fill="currentColor"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Sad Letters Found
            </h3>
            <p className="text-gray-500 mb-4">
              No letters with category "sad" were found in the database.
            </p>
            <div className="text-xs text-gray-400 text-left bg-gray-50 p-3 rounded mb-4">
              <strong>Debug Info:</strong><br/>
              Total letters in database: {letters.length}<br/>
              Categories found: {letters.map(l => l.category).filter(Boolean).join(", ") || "None"}<br/>
              Looking for category: "sad"
            </div>
            <Button
              onClick={handleCreateTestLetter}
              style={{ backgroundColor: data.themeColor }}
              className="text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Test Sad Letter"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* AI Generation Loading State */}
      {isGeneratingResponse && (
        <Card className="mb-6" style={{ borderColor: `${data.themeColor}40` }}>
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
                🤖 Creating Your Personalized Message...
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Analyzing your responses and generating a tailored comfort message just for you
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
        <Card className="mb-6" style={{ borderColor: `${data.themeColor}40` }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div 
                className="rounded-full p-2"
                style={{ backgroundColor: `${data.themeColor}20` }}
              >
                <Wand2 
                  size={20} 
                  style={{ color: data.themeColor }}
                />
              </div>
              <div>
                <CardTitle 
                  className="text-lg flex items-center gap-2"
                  style={{ color: data.themeColor }}
                >
                  <Sparkles size={18} />
                  Your Personalized Message
                  <Sparkles size={18} />
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Enhanced with {aiEnhancedData.tone} tone • Based on your responses
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Show user responses summary */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {aiEnhancedData.questions.map((q, index) => (
                <Badge 
                  key={q.id}
                  variant="outline"
                  className="text-xs"
                  style={{ 
                    borderColor: q.answer ? data.themeColor : '#d1d5db',
                    color: q.answer ? data.themeColor : '#6b7280',
                    backgroundColor: q.answer ? `${data.themeColor}10` : 'transparent'
                  }}
                >
                  Q{index + 1}: {q.answer ? 'Yes' : 'No'}
                </Badge>
              ))}
              <Badge 
                variant="secondary"
                className="text-xs ml-2"
                style={{ 
                  backgroundColor: `${data.themeColor}20`,
                  color: data.themeColor 
                }}
              >
                {aiEnhancedData.tone} tone
              </Badge>
            </div>
            
            {/* Enhanced message display */}
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: `${data.themeColor}08`, 
                borderLeft: `4px solid ${data.themeColor}` 
              }}
            >
              {aiEnhancedData.enhancedMessage ? (
                <div>
                  <h4 
                    className="font-semibold mb-3 text-center"
                    style={{ color: data.themeColor }}
                  >
                    {aiEnhancedData.enhancedMessage.title}
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-center">
                    {aiEnhancedData.enhancedMessage.content}
                  </p>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed text-center italic">
                  "✨ Your personalized message has been added to the collection below! ✨"
                </p>
              )}
            </div>
            
           
          </CardContent>
        </Card>
      )}

    

      {/* Letter Detail Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

export default SadLettersWidget;
