import React, { useState, useEffect, useCallback } from "react";
import { useSettingsStore } from "../../../stores/settings";
import { useThemeStore } from "../../../stores/theme";
import useMessagesStore from "../../../stores/messagesData";
import useLogsStore from "../../../stores/logsData";
import type { LoveLetter } from "../../../stores/messagesData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, Brain } from "lucide-react";
import { useAIMissForms, type ComponentData, type Question } from "../missCategory/composables/aiMissForms";
import { useIsMobile } from "../../../hooks/use-mobile";

interface MissFormsWidgetProps {
  isOpen: boolean;
  onComplete: (responseData: {
    questions: Question[],
    baseLetter: LoveLetter | null,
    tone: 'romantic' | 'affectionate' | 'playful' | 'reassuring'
  }) => void;
  onClose?: () => void; // Made optional since dialog is not closable
}

const MissFormsWidget: React.FC<MissFormsWidgetProps> = ({ isOpen, onComplete }) => {
  const {
    getCallsign,
    getGfName,
    getBfName,
    loadSettings,
  } = useSettingsStore();

  const { initializeTheme, getCurrentThemeColor, waitForInitialization } =
    useThemeStore();

  const { generateAIQuestions, determineToneFromResponses } = useAIMissForms();
  const { 
    fetchLetters, 
    getLettersByCategory
  } = useMessagesStore();
  const { createLog } = useLogsStore();
  
  const isMobile = useIsMobile();
  
  const [data, setData] = useState<ComponentData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // States for the form collection
  const [baseLetter, setBaseLetter] = useState<LoveLetter | null>(null);

  // Function to fetch a random miss category letter
  const fetchRandomMissLetter = useCallback(async () => {
    try {
      const missLetters = getLettersByCategory('miss');
      
      if (missLetters.length > 0) {
        // Pick a random letter from miss category
        const randomIndex = Math.floor(Math.random() * missLetters.length);
        const randomLetter = missLetters[randomIndex];
        setBaseLetter(randomLetter);
        console.log('Selected random miss letter:', randomLetter);
      } else {
        console.log('No miss category letters found in database');
        setBaseLetter(null);
      }
    } catch (error) {
      console.error('Error fetching random miss letter:', error);
      setBaseLetter(null);
    }
  }, [getLettersByCategory]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitialized(false);
        setIsGeneratingQuestions(true);
        
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
        
        // Step 1: Fetch all letters to get miss category messages
        await fetchLetters();
        await fetchRandomMissLetter();
        
        // Step 2: Generate AI questions after initializing data
        const result = await generateAIQuestions(loadedData.callsign);
        if (result.questions) {
          setQuestions(result.questions);
          console.log('Miss questions loaded:', result.questions);
        } else {
          console.error('Failed to load miss questions:', result.error);
        }
        
        setIsGeneratingQuestions(false);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Miss Forms Widget:", error);
        setIsGeneratingQuestions(false);
        setIsInitialized(true);
      }
    };

    if (isOpen) {
      initialize();
    }
  }, [
    isOpen,
    initializeTheme,
    waitForInitialization,
    loadSettings,
    getCurrentThemeColor,
    getCallsign,
    getGfName,
    getBfName,
    generateAIQuestions,
    fetchLetters,
    fetchRandomMissLetter,
  ]);

  const handleAnswer = async (answer: boolean) => {
    const updatedQuestions = questions.map((q, index) => 
      index === currentQuestionIndex 
        ? { ...q, answered: true, answer }
        : q
    );
    setQuestions(updatedQuestions);

    // Log entry when reaching the last question (regardless of Yes/No answer)
    if (currentQuestionIndex === questions.length - 1) {
      try {
        await createLog({
          is_sad_letter: false,
          is_miss_letter: true
        });
        console.log('Miss letter log entry created successfully');
      } catch (error) {
        console.error('Failed to create miss letter log entry:', error);
      }
    }

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
    
    // Pass all the collected data back to MissCategoryView
    onComplete({
      questions,
      baseLetter,
      tone
    });
  };

  if (!data || !isInitialized) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = questions.every(q => q.answered) && questions.length > 0;

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className={`${isMobile ? 'max-w-[95vw] h-[90vh] overflow-y-auto' : 'max-w-lg'} [&>button]:hidden`}
        style={{
          maxWidth: isMobile ? '95vw' : 'min(480px, 85vw)',
          width: isMobile ? '95vw' : 'min(480px, 85vw)',
          padding: isMobile ? 'min(20px, 4vw)' : '24px'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="flex items-center gap-2 text-center justify-center"
            style={{ 
              color: data.themeColor,
              fontSize: isMobile ? 'clamp(1rem, 4vw, 1.125rem)' : '1.125rem'
            }}
          >
            <Sparkles size={isMobile ? 20 : 22} />
            Mini {data.bfName} Miss Assistant
            <Sparkles size={isMobile ? 20 : 22} />
          </DialogTitle>
        </DialogHeader>

        <div 
          className={isMobile ? "p-3" : "p-4"}
          style={{
            padding: isMobile ? 'min(12px, 3vw)' : '16px'
          }}
        >
          {/* AI Assistant GIF */}
          <div 
            className="text-center animate-fade-in"
            style={{ marginBottom: isMobile ? 'min(20px, 4vw)' : '20px' }}
          >
            <div 
              className="mx-auto rounded-full mb-4 animate-pulse-subtle"
              style={{ 
                backgroundColor: `${data.themeColor}20`,
                width: 'fit-content',
                animation: 'pulse 2s infinite',
                padding: isMobile ? 'min(12px, 3vw)' : '12px'
              }}
            >
              <img
                src="/assets/listen.gif"
                alt="AI Miss Assistant"
                className="mx-auto rounded-full border-2"
                style={{ 
                  borderColor: `${data.themeColor}40`,
                  width: isMobile ? 'clamp(60px, 15vw, 80px)' : '72px',
                  height: isMobile ? 'clamp(60px, 15vw, 80px)' : '72px'
                }}
              />
            </div>
            <p 
              className="text-gray-600 leading-relaxed"
              style={{ 
                fontSize: isMobile ? 'clamp(0.75rem, 3vw, 0.875rem)' : '0.875rem',
                padding: isMobile ? '0 min(8px, 2vw)' : '0 8px'
              }}
            >
              Hi {data.callsign}! I'm your mini {data.bfName} miss assistant. Let me ask a few questions to understand how you're feeling and personalize your comfort experience 💕
            </p>
          </div>

          {/* Loading State for AI Question Generation */}
          {isGeneratingQuestions ? (
            <div 
              className="text-center"
              style={{ marginBottom: isMobile ? 'min(20px, 4vw)' : '20px' }}
            >
              <div 
                className="flex items-center justify-center mb-2"
                style={{ gap: isMobile ? 'min(6px, 1.5vw)' : '8px' }}
              >
                <Brain 
                  className="animate-pulse"
                  size={isMobile ? 16 : 18}
                  style={{ color: data.themeColor }}
                />
                <span 
                  style={{ 
                    color: data.themeColor,
                    fontSize: isMobile ? 'clamp(0.75rem, 3vw, 0.875rem)' : '0.875rem'
                  }}
                >
                  Generating personalized questions...
                </span>
              </div>
              <div 
                className="mx-auto rounded-full overflow-hidden"
                style={{ 
                  backgroundColor: `${data.themeColor}20`,
                  width: isMobile ? 'min(100px, 25vw)' : '120px',
                  height: '4px'
                }}
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
              <div 
                className="flex items-center justify-center"
                style={{ 
                  marginBottom: isMobile ? 'min(20px, 4vw)' : '20px',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  gap: isMobile ? 'min(4px, 1vw)' : '6px'
                }}
              >
            {questions.map((q, index) => (
              <React.Fragment key={q.id}>
                <div 
                  className={`rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                    q.answered 
                      ? 'text-white' 
                      : index === currentQuestionIndex 
                        ? 'text-white'
                        : 'text-gray-400'
                  }`}
                  style={{ 
                    backgroundColor: q.answered || index === currentQuestionIndex
                      ? data.themeColor 
                      : '#e5e7eb',
                    width: isMobile ? 'clamp(24px, 6vw, 32px)' : '32px',
                    height: isMobile ? 'clamp(24px, 6vw, 32px)' : '32px',
                    fontSize: isMobile ? 'clamp(0.625rem, 2.5vw, 0.75rem)' : '0.75rem'
                  }}
                >
                  {q.answered ? '✓' : index + 1}
                </div>
                {index < questions.length - 1 && !isMobile && (
                  <div 
                    className={`h-0.5 transition-all duration-500 ${
                      questions[index + 1]?.answered || currentQuestionIndex > index
                        ? 'opacity-100' 
                        : 'opacity-30'
                    }`}
                    style={{ 
                      backgroundColor: data.themeColor,
                      width: '24px'
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          </>
          )}

          {/* Question Card */}
          {!allAnswered && currentQuestion && questions.length > 0 && (
            <Card 
              className="animate-slide-up"
              style={{ marginBottom: isMobile ? 'min(20px, 4vw)' : '20px' }}
            >
              <CardContent 
                style={{ 
                  padding: isMobile ? 'min(16px, 4vw)' : '20px' 
                }}
              >
                <div className="text-center">
                  <Badge 
                    variant="secondary" 
                    className="mb-4"
                    style={{ 
                      backgroundColor: `${data.themeColor}20`,
                      color: data.themeColor,
                      fontSize: isMobile ? 'clamp(0.625rem, 2.5vw, 0.75rem)' : '0.75rem',
                      padding: isMobile ? 'min(4px, 1vw) min(8px, 2vw)' : '6px 12px'
                    }}
                  >
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  
                  <h3 
                    className="font-semibold"
                    style={{ 
                      fontSize: isMobile ? "clamp(1rem, 4vw, 1.125rem)" : "1.125rem",
                      color: "#333",
                      marginBottom: isMobile ? 'min(20px, 4vw)' : '20px',
                      lineHeight: '1.4'
                    }}
                  >
                    {currentQuestion.text}
                  </h3>

                  <div 
                    className="flex justify-center"
                    style={{ 
                      gap: isMobile ? 'min(12px, 3vw)' : '12px',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Button
                      onClick={() => handleAnswer(true)}
                      className="text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300"
                      style={{ 
                        backgroundColor: data.themeColor,
                        fontSize: isMobile ? "clamp(0.875rem, 3vw, 1rem)" : "0.875rem",
                        padding: isMobile ? 'min(12px, 3vw) min(24px, 6vw)' : '12px 32px',
                        width: isMobile ? '100%' : 'auto',
                        minHeight: '44px'
                      }}
                    >
                      Yes
                    </Button>
                    <Button
                      onClick={() => handleAnswer(false)}
                      variant="outline"
                      className="font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300"
                      style={{ 
                        borderColor: data.themeColor,
                        color: data.themeColor,
                        fontSize: isMobile ? "clamp(0.875rem, 3vw, 1rem)" : "0.875rem",
                        padding: isMobile ? 'min(12px, 3vw) min(24px, 6vw)' : '12px 32px',
                        width: isMobile ? '100%' : 'auto',
                        minHeight: '44px'
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
          {allAnswered && questions.length > 0 && (
            <Card>
              <CardContent 
                style={{ 
                  padding: isMobile ? 'min(16px, 4vw)' : '20px' 
                }}
              >
                <div className="text-center">
                  <Heart 
                    size={isMobile ? 36 : 40} 
                    className="mx-auto"
                    fill={data.themeColor}
                    color={data.themeColor}
                    style={{ marginBottom: isMobile ? 'min(12px, 3vw)' : '12px' }}
                  />
                  <h3 
                    className="font-semibold"
                    style={{ 
                      color: data.themeColor,
                      fontSize: isMobile ? 'clamp(1.125rem, 4vw, 1.25rem)' : '1.125rem',
                      marginBottom: isMobile ? 'min(8px, 2vw)' : '8px'
                    }}
                  >
                    Thank you, {data.callsign}!
                  </h3>
                  <p 
                    className="text-gray-600"
                    style={{
                      fontSize: isMobile ? 'clamp(0.875rem, 3vw, 1rem)' : '0.875rem',
                      marginBottom: isMobile ? 'min(20px, 4vw)' : '20px',
                      lineHeight: '1.5',
                      padding: isMobile ? '0 min(8px, 2vw)' : '0 8px'
                    }}
                  >
                    I understand you're missing {data.bfName}. Let me prepare something special to help bridge the distance and remind you how much you're loved.
                  </p>
                  
                  <div className="flex justify-center">
                    <div 
                      className="animate-spin rounded-full border-b-2"
                      style={{ 
                        borderColor: data.themeColor,
                        width: isMobile ? 'clamp(24px, 6vw, 32px)' : '28px',
                        height: isMobile ? 'clamp(24px, 6vw, 32px)' : '28px'
                      }}
                    ></div>
                  </div>
                  
                  <p 
                    className="text-gray-500"
                    style={{
                      fontSize: isMobile ? 'clamp(0.75rem, 2.5vw, 0.875rem)' : '0.75rem',
                      marginTop: isMobile ? 'min(8px, 2vw)' : '8px'
                    }}
                  >
                    Preparing your special message...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary of Answers (shown when complete) */}
          {allAnswered && questions.length > 0 && (
            <div 
              className="text-center"
              style={{ marginTop: isMobile ? 'min(20px, 4vw)' : '16px' }}
            >
              <p 
                className="text-gray-500 mb-2"
                style={{ 
                  fontSize: isMobile ? 'clamp(0.625rem, 2.5vw, 0.75rem)' : '0.75rem'
                }}
              >
                Your responses:
              </p>
              <div 
                className="flex justify-center flex-wrap"
                style={{ gap: isMobile ? 'min(4px, 1vw)' : '6px' }}
              >
                {questions.map((q, index) => (
                  <Badge 
                    key={q.id}
                    variant="outline"
                    style={{ 
                      borderColor: data.themeColor,
                      color: q.answer ? data.themeColor : '#6b7280',
                      fontSize: isMobile ? 'clamp(0.625rem, 2vw, 0.75rem)' : '0.75rem',
                      padding: isMobile ? 'min(2px, 0.5vw) min(6px, 1.5vw)' : '3px 8px'
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

export default MissFormsWidget;