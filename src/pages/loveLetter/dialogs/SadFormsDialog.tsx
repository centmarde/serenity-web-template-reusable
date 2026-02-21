import React, { useState, useEffect, useCallback } from "react";
import { useSettingsStore } from "../../../stores/settings";
import { useThemeStore } from "../../../stores/theme";
import useMessagesStore from "../../../stores/messagesData";
import type { LoveLetter } from "../../../stores/messagesData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, Brain } from "lucide-react";
import { useAISadForms, type ComponentData, type Question } from "../sadCategory/composables/aiSadForms";

interface SadFormsWidgetProps {
  isOpen: boolean;
  onComplete: (responseData: {
    questions: Question[],
    baseLetter: LoveLetter | null,
    tone: 'gentle' | 'encouraging' | 'loving' | 'supportive'
  }) => void;
  onClose?: () => void; // Made optional since dialog is not closable
}

const SadFormsWidget: React.FC<SadFormsWidgetProps> = ({ isOpen, onComplete }) => {
  const {
    getCallsign,
    getGfName,
    getBfName,
    loadSettings,
  } = useSettingsStore();

  const { initializeTheme, getCurrentThemeColor, waitForInitialization } =
    useThemeStore();

  const { generateAIQuestions, determineToneFromResponses } = useAISadForms();
  const { 
    fetchLetters, 
    getLettersByCategory
  } = useMessagesStore();
  
  const [data, setData] = useState<ComponentData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // States for the form collection
  const [baseLetter, setBaseLetter] = useState<LoveLetter | null>(null);

  // Function to fetch a random sad category letter
  const fetchRandomSadLetter = useCallback(async () => {
    try {
      const sadLetters = getLettersByCategory('sad');
      
      if (sadLetters.length > 0) {
        // Pick a random letter from sad category
        const randomIndex = Math.floor(Math.random() * sadLetters.length);
        const randomLetter = sadLetters[randomIndex];
        setBaseLetter(randomLetter);
        console.log('Selected random sad letter:', randomLetter);
      } else {
        console.log('No sad category letters found in database');
        setBaseLetter(null);
      }
    } catch (error) {
      console.error('Error fetching random sad letter:', error);
      setBaseLetter(null);
    }
  }, [getLettersByCategory]);



  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          gfName: getGfName(),
          bfName: getBfName(),
        };

        setData(loadedData);
        
        // Step 1: Fetch all letters to get sad category messages
        await fetchLetters();
        await fetchRandomSadLetter();
        
        // Step 2: Generate AI questions after initializing data
        setIsGeneratingQuestions(true);
        
        const result = await generateAIQuestions(loadedData.callsign);
        if (result.questions) {
          setQuestions(result.questions);
        }
        setIsGeneratingQuestions(false);
      } catch (error) {
        console.error("Failed to initialize Sad Forms Widget:", error);
        setIsGeneratingQuestions(false);
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
    getBfName,
    generateAIQuestions,
    fetchLetters,
    fetchRandomSadLetter
  ]);

  const handleAnswer = (answer: boolean) => {
    const updatedQuestions = questions.map((q, index) => 
      index === currentQuestionIndex 
        ? { ...q, answered: true, answer }
        : q
    );
    setQuestions(updatedQuestions);

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 800);
    } else {
      // All questions answered, complete the form
      setTimeout(() => {
        handleCompleteForm();
      }, 1200);
    }
  };

  const handleCompleteForm = () => {
    if (!data) return;
    
    // Determine tone based on user responses
    const tone = determineToneFromResponses(questions);
    
    // Pass all the collected data back to SadCategoryView
    onComplete({
      questions,
      baseLetter,
      tone
    });
  };

  if (!data) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = questions.every(q => q.answered);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-2xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle 
            className="flex items-center gap-2 text-center justify-center"
            style={{ color: data.themeColor }}
          >
            <Sparkles size={24} />
            Mini {data.bfName} Care Assistant
            <Sparkles size={24} />
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* AI Assistant GIF */}
          <div className="text-center mb-6 animate-fade-in">
            <div 
              className="mx-auto rounded-full p-4 mb-4 animate-pulse-subtle"
              style={{ 
                backgroundColor: `${data.themeColor}20`,
                width: 'fit-content',
                animation: 'pulse 2s infinite'
              }}
            >
              <img
                src="/assets/listen.gif"
                alt="AI Care Assistant"
                className="w-24 h-24 mx-auto rounded-full border-2"
                style={{ borderColor: `${data.themeColor}40` }}
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Hi {data.callsign}! I'm your mini {data.bfName} care assistant. Let me ask a few questions to personalize your comfort experience 💙
            </p>
          </div>

          {/* Loading State for AI Question Generation */}
          {isGeneratingQuestions ? (
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain 
                  className="animate-pulse"
                  size={20}
                  style={{ color: data.themeColor }}
                />
                <span className="text-sm" style={{ color: data.themeColor }}>
                  Generating personalized questions...
                </span>
              </div>
              <div 
                className="w-32 h-1 mx-auto rounded-full overflow-hidden"
                style={{ backgroundColor: `${data.themeColor}20` }}
              >
                <div 
                  className="h-full rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: data.themeColor,
                    animation: 'loading-bar 2s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-6">
            {questions.map((q, index) => (
              <React.Fragment key={q.id}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                    q.answered 
                      ? 'text-white' 
                      : index === currentQuestionIndex 
                        ? 'text-white'
                        : 'text-gray-400'
                  }`}
                  style={{ 
                    backgroundColor: q.answered || index === currentQuestionIndex
                      ? data.themeColor 
                      : '#e5e7eb'
                  }}
                >
                  {q.answered ? '✓' : index + 1}
                </div>
                {index < questions.length - 1 && (
                  <div 
                    className={`w-12 h-0.5 transition-all duration-500 ${
                      questions[index + 1]?.answered || currentQuestionIndex > index
                        ? 'opacity-100' 
                        : 'opacity-30'
                    }`}
                    style={{ 
                      backgroundColor: data.themeColor
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          </>
          )}

          {/* Question Card */}
          {!allAnswered && (
            <Card className="mb-6 animate-slide-up">
              <CardContent className="p-6">
                <div className="text-center">
                  <Badge 
                    variant="secondary" 
                    className="mb-4"
                    style={{ 
                      backgroundColor: `${data.themeColor}20`,
                      color: data.themeColor 
                    }}
                  >
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  
                  <h3 
                    className="text-lg font-semibold mb-6"
                    style={{ 
                      fontSize: "clamp(1.125rem, 3vw, 1.25rem)",
                      color: "#333"
                    }}
                  >
                    {currentQuestion.text}
                  </h3>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleAnswer(true)}
                      className="px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300"
                      style={{ 
                        backgroundColor: data.themeColor,
                        fontSize: "clamp(0.875rem, 2.5vw, 1rem)"
                      }}
                    >
                      Yes
                    </Button>
                    <Button
                      onClick={() => handleAnswer(false)}
                      variant="outline"
                      className="px-8 py-3 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300"
                      style={{ 
                        borderColor: data.themeColor,
                        color: data.themeColor,
                        fontSize: "clamp(0.875rem, 2.5vw, 1rem)"
                      }}
                    >
                      No
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Complete Message */}
          {allAnswered && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Heart 
                    size={48} 
                    className="mx-auto mb-4"
                    fill={data.themeColor}
                    color={data.themeColor}
                  />
                  <h3 
                    className="text-xl font-semibold mb-3"
                    style={{ color: data.themeColor }}
                  >
                    Thank you, {data.callsign}!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your responses have been recorded. I'll now create a personalized message based on your needs and emotional state.
                  </p>
                  
                  <div className="flex justify-center">
                    <div 
                      className="animate-spin rounded-full h-8 w-8 border-b-2"
                      style={{ borderColor: data.themeColor }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-3">
                    Creating your personalized response...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary of Answers (shown when complete) */}
          {allAnswered && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-2">Your responses:</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {questions.map((q, index) => (
                  <Badge 
                    key={q.id}
                    variant="outline"
                    className="text-xs"
                    style={{ 
                      borderColor: data.themeColor,
                      color: q.answer ? data.themeColor : '#6b7280'
                    }}
                  >
                    Q{index + 1}: {q.answer ? 'Yes' : 'No'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SadFormsWidget;
