import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../../stores/settings";
import { useThemeStore } from "../../../stores/theme";
import type { LoveLetter } from "../../../stores/messagesData";
import MissLettersWidget from "./components/MissLettersWidget";
import MissFormsWidget from "../dialogs/MissFormsDialog";
import { useAIMissForms, type Question } from "./composables/aiMissForms";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ComponentData {
  themeColor: string;
  callsign: string;
  appName: string;
  gfName: string;
  bfName: string;
}

const MissCategoryView: React.FC = () => {
  const {
    getCallsign,
    getAppName,
    getGfName,
    getBfName,
    loadSettings,
  } = useSettingsStore();

  const { initializeTheme, getCurrentThemeColor, waitForInitialization } =
    useThemeStore();

  // Removed createLetter - AI messages are shown in UI only, not saved to database
  const { enhanceMessageWithAI } = useAIMissForms();
  
  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormsDialog, setShowFormsDialog] = useState(true);
  const [hasCompletedForms, setHasCompletedForms] = useState(false);
  const [isGeneratingAIResponse, setIsGeneratingAIResponse] = useState(false);
  const [aiResponseData, setAiResponseData] = useState<{
    questions: Question[],
    baseLetter: LoveLetter | null,
    tone: 'romantic' | 'affectionate' | 'playful' | 'reassuring',
    enhancedMessage?: {
      title: string,
      content: string,
      tone: string
    }
  } | null>(null);

  const handleGoBack = () => {
    // Use browser's back button functionality
    window.history.back();
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          appName: getAppName(),
          gfName: getGfName(),
          bfName: getBfName(),
        };

        setData(loadedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Miss Category View:", error);
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
    getGfName,
    getBfName,
  ]);

  const generateAIResponse = async (responseData: {
    questions: Question[],
    baseLetter: LoveLetter | null,
    tone: 'romantic' | 'affectionate' | 'playful' | 'reassuring'
  }) => {
    if (!data || !responseData) return;

    try {
      console.log('Generating AI response with data:', responseData);
      
      // Use the AI enhancement function from aiMissForms.ts
      const result = await enhanceMessageWithAI(
        responseData.questions,
        responseData.baseLetter,
        data,
        responseData.tone
      );

      if (result.success && result.enhancedMessage) {
        // Update the response data with the enhanced message (UI only - no database save)
        setAiResponseData({
          ...responseData,
          enhancedMessage: result.enhancedMessage
        });
      } else {
        console.error('Failed to enhance message:', result.error);
        // Set fallback message
        setAiResponseData({
          ...responseData,
          enhancedMessage: {
            title: "Missing You So Much",
            content: "Distance means nothing when someone means everything. You're always in my heart. 💕",
            tone: responseData.tone
          }
        });
      }
    } catch (error) {
      console.error('Error in generateAIResponse:', error);
      // Set final fallback
      setAiResponseData({
        ...responseData,
        enhancedMessage: {
          title: "Always Thinking of You",
          content: "Every moment apart makes me appreciate you more. Can't wait to be together again. 💕",
          tone: responseData.tone
        }
      });
    }
  };

  const handleFormsComplete = async (responseData: {
    questions: Question[],
    baseLetter: LoveLetter | null,
    tone: 'romantic' | 'affectionate' | 'playful' | 'reassuring'
  }) => {
    console.log('Miss forms completed with data:', responseData);
    
    setAiResponseData(responseData);
    setIsGeneratingAIResponse(true);
    
    // Always attempt to generate AI response, with fallbacks built in
    await generateAIResponse(responseData);
    
    // Always complete successfully
    setHasCompletedForms(true);
    setShowFormsDialog(false);
    setIsGeneratingAIResponse(false);
  };

  const handleFormsClose = () => {
    setShowFormsDialog(false);
    // Optionally, you can redirect back or show a different state
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
    <>
      {/* AI Forms Dialog - Shows first */}
      <MissFormsWidget
        isOpen={showFormsDialog}
        onComplete={handleFormsComplete}
        onClose={handleFormsClose}
      />

      {/* Main Content - Shows after completing forms or if forms are skipped */}
      <div
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${data.themeColor}15, ${data.themeColor}30, #ffffff)`,
        }}
      >
        {/* Main Content with Full Width */}
        <div className="w-full px-2 py-4 sm:px-4 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
          </div>

          {/* Content Area - Letters Widget */}
          <div className="w-full">
            {/* Show loading indicator when generating AI response */}
            {isGeneratingAIResponse && (
              <div className="text-center py-12 px-4 max-w-4xl mx-auto">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                  style={{ borderColor: data.themeColor }}
                ></div>
                <p className="text-gray-600 mb-2">
                  🤖 Analyzing your responses...
                </p>
                <p className="text-sm text-gray-500">
                  Creating a personalized message with {aiResponseData?.tone || 'affectionate'} tone
                </p>
              </div>
            )}
            
            {/* Show letters widget only after completing forms or if forms dialog is closed */}
            {(!showFormsDialog || hasCompletedForms) && !isGeneratingAIResponse && (
              <div className="w-full">
                <MissLettersWidget 
                  aiEnhancedData={aiResponseData}
                  isGeneratingResponse={isGeneratingAIResponse}
                />
              </div>
            )}
            
            {/* Show a message if forms dialog was closed without completion */}
            {!showFormsDialog && !hasCompletedForms && !isGeneratingAIResponse && (
              <div className="text-center py-12 px-4 max-w-4xl mx-auto">
                <p className="text-gray-600 mb-4">
                  You can restart the AI questionnaire anytime to get personalized recommendations.
                </p>
                <button
                  onClick={() => setShowFormsDialog(true)}
                  className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all duration-300"
                  style={{ backgroundColor: data.themeColor }}
                >
                  Start AI Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MissCategoryView;