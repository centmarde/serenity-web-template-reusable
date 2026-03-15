import { aiService } from "../../../../lib/aiSadResponse";
import useMessagesStore, { type LoveLetter } from "../../../../stores/messagesData";

export interface Question {
  id: number;
  text: string;
  answered: boolean;
  answer: boolean | null;
}

export interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  bfName: string;
}

export interface AIQuestionsResult {
  success: boolean;
  questions?: Question[];
  error?: string;
}

export interface AILetterResult {
  success: boolean;
  error?: string;
}

export interface UserResponses {
  overwhelmed: boolean;
  needsGentleComfort: boolean;
  needsMotivation: boolean;
  needsAffection: boolean;
  needsStrongSupport: boolean;
}

export interface EnhancedMessage {
  title: string;
  content: string;
  tone: 'gentle' | 'encouraging' | 'loving' | 'supportive';
}

export interface AIEnhanceResult {
  success: boolean;
  enhancedMessage?: EnhancedMessage;
  error?: string;
}

// Default questions fallback with expanded tone mapping questions
const getDefaultQuestions = (): Question[] => [
  {
    id: 1,
    text: "Are you feeling overwhelmed by your emotions right now?",
    answered: false,
    answer: null
  },
  {
    id: 2,
    text: "Would you like gentle, soft words of understanding and patience?",
    answered: false,
    answer: null
  },
  {
    id: 3,
    text: "Do you need uplifting and motivating encouragement to feel hopeful?",
    answered: false,
    answer: null
  },
  {
    id: 4,
    text: "Would warm, affectionate, and intimate words of love help you?",
    answered: false,
    answer: null
  },
  {
    id: 5,
    text: "Do you need strong, reliable, and comforting support right now?",
    answered: false,
    answer: null
  }
];

/**
 * Determine the best tone based on user responses to 5 questions
 */
export const determineToneFromResponses = (questions: Question[]): 'gentle' | 'encouraging' | 'loving' | 'supportive' => {
  const responses = {
    overwhelmed: questions[0]?.answer || false,        // Q1: Overwhelmed (gentle)
    needsGentleComfort: questions[1]?.answer || false, // Q2: Gentle comfort (gentle)
    needsMotivation: questions[2]?.answer || false,    // Q3: Motivation (encouraging)
    needsAffection: questions[3]?.answer || false,     // Q4: Affection (loving)
    needsStrongSupport: questions[4]?.answer || false  // Q5: Strong support (supportive)
  };

  // Count votes for each tone
  const toneScores = {
    gentle: (responses.overwhelmed ? 2 : 0) + (responses.needsGentleComfort ? 2 : 0),
    encouraging: responses.needsMotivation ? 2 : 0,
    loving: responses.needsAffection ? 2 : 0,
    supportive: responses.needsStrongSupport ? 2 : 0
  };

  // Find the tone with the highest score
  const maxScore = Math.max(...Object.values(toneScores));
  
  // If there's a clear winner, return it
  for (const [tone, score] of Object.entries(toneScores)) {
    if (score === maxScore && score > 0) {
      return tone as 'gentle' | 'encouraging' | 'loving' | 'supportive';
    }
  }

  // Default fallback
  if (responses.overwhelmed) return 'gentle';
  else if (responses.needsGentleComfort) return 'gentle';  
  else if (responses.needsMotivation) return 'encouraging';
  else if (responses.needsAffection) return 'loving';
  else if (responses.needsStrongSupport) return 'supportive';
  else return 'loving';
};

/**
 * Enhance a message using AI based on user responses and tone
 */
export const enhanceMessageWithAI = async (
  questions: Question[],
  baseLetter: LoveLetter | null,
  userData: ComponentData,
  tone: 'gentle' | 'encouraging' | 'loving' | 'supportive'
): Promise<AIEnhanceResult> => {
  try {
    const userResponses = {
      overwhelmed: questions[0]?.answer || false,
      needsGentleComfort: questions[1]?.answer || false,
      needsMotivation: questions[2]?.answer || false,
      needsAffection: questions[3]?.answer || false,
      needsStrongSupport: questions[4]?.answer || false,
    };

    let improvePrompt = '';
    
    if (baseLetter) {
      improvePrompt = `You are a compassionate AI assistant helping a boyfriend write heartfelt comfort letters to his girlfriend.

Base letter to improve:
Title: "${baseLetter.title || 'Untitled'}"
Message: "${baseLetter.message || ''}"

User responses: Overwhelmed: ${userResponses.overwhelmed}, Gentle: ${userResponses.needsGentleComfort}, Motivation: ${userResponses.needsMotivation}, Affection: ${userResponses.needsAffection}, Support: ${userResponses.needsStrongSupport}

Target tone: ${tone}
Recipient: ${userData.callsign}, Sender: ${userData.bfName || 'Your Love'}

Write FROM ${userData.bfName || 'your boyfriend'} TO ${userData.callsign} using "${tone}" tone.

Return ONLY JSON: {"title": "...", "content": "...", "tone": "${tone}"}`;
    } else {
      improvePrompt = `Create a ${tone} comfort letter FROM ${userData.bfName || 'your boyfriend'} TO ${userData.callsign}.

User needs: Overwhelmed: ${userResponses.overwhelmed}, Gentle: ${userResponses.needsGentleComfort}, Motivation: ${userResponses.needsMotivation}, Affection: ${userResponses.needsAffection}, Support: ${userResponses.needsStrongSupport}

Return ONLY JSON: {"title": "...", "content": "...", "tone": "${tone}"}`;
    }

    const messages = [
      { role: 'system' as const, content: 'You are a compassionate AI assistant helping write heartfelt comfort letters.' },
      { role: 'user' as const, content: improvePrompt }
    ];

    if (!aiService.isConfigured()) {
      return {
        success: true,
        enhancedMessage: {
          title: "A Heartfelt Message",
          content: baseLetter?.message || "You are loved and valued. 💙",
          tone: tone
        }
      };
    }

    const response = await aiService.chat(messages);

    if (response.success && response.message) {
      try {
        let data;
        try {
          data = JSON.parse(response.message);
        } catch {
          data = { title: "A Message Just For You", content: response.message, tone: tone };
        }
        
        return {
          success: true,
          enhancedMessage: {
            title: data.title,
            content: data.content || data.message,
            tone: tone
          }
        };
      } catch {
        return {
          success: true,
          enhancedMessage: {
            title: "A Gentle Reminder", 
            content: "You are stronger than you know. 💙",
            tone: tone
          }
        };
      }
    }

    return {
      success: true,
      enhancedMessage: {
        title: "You Are Not Alone",
        content: "You are stronger than you realize. 💙",
        tone: tone
      }
    };
  } catch {
    return {
      success: true,
      enhancedMessage: {
        title: "A Message of Love",
        content: "You are loved and supported. 💙",
        tone: tone
      }
    };
  }
};

/**
 * Generate AI-powered empathetic questions for emotional support
 * @param userName - The name of the user feeling sad
 * @returns Promise with success status and questions or error
 */
export const generateAIQuestions = async (userName: string): Promise<AIQuestionsResult> => {
  try {
    const prompt = `Generate 5 thoughtful, empathetic yes/no questions for someone named ${userName} who is feeling sad. These questions will help determine the best tone for personalized comfort messages.

The questions should map to these tones:
1. Overwhelm assessment (for gentle tone)
2. Gentle comfort preference (for gentle tone) 
3. Motivation needs (for encouraging tone)
4. Affection preference (for loving tone)
5. Support strength preference (for supportive tone)

Requirements:
- Questions should be caring and non-intrusive
- Each question helps determine emotional tone preference
- Keep questions simple and answerable with yes/no
- Make them feel understood, not judged
- Cover different emotional support approaches

Return ONLY a JSON array of 5 questions in this exact format:
["Question 1 text here?", "Question 2 text here?", "Question 3 text here?", "Question 4 text here?", "Question 5 text here?"]`;

    const messages = [
      { role: 'system' as const, content: 'You are a compassionate AI therapist specializing in emotional support. Generate empathetic questions to help understand someone\'s emotional needs.' },
      { role: 'user' as const, content: prompt }
    ];

    const response = await aiService.chat(messages);
    
    if (response.success && response.message) {
      try {
        // Try to parse the AI response as JSON
        const questionTexts = JSON.parse(response.message);
        
        if (Array.isArray(questionTexts) && questionTexts.length >= 5) {
          const aiQuestions: Question[] = questionTexts.slice(0, 5).map((text: string, index: number) => ({
            id: index + 1,
            text: text,
            answered: false,
            answer: null
          }));
          
          console.log('AI-generated questions loaded successfully');
          return {
            success: true,
            questions: aiQuestions
          };
        } else {
          throw new Error('Invalid AI response format');
        }
      } catch (parseError) {
        console.error('Failed to parse AI questions:', parseError);
        console.log('Using default questions as fallback');
        return {
          success: false,
          questions: getDefaultQuestions(),
          error: 'Failed to parse AI response, using fallback questions'
        };
      }
    } else {
      console.error('Failed to generate AI questions:', response.error);
      console.log('Using default questions as fallback');
      return {
        success: false,
        questions: getDefaultQuestions(),
        error: response.error || 'AI service error'
      };
    }
  } catch (error) {
    console.error('Error generating AI questions:', error);
    console.log('Using default questions as fallback');
    return {
      success: false,
      questions: getDefaultQuestions(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Generate AI-powered comfort letter based on user responses
 * @param questions - Array of answered questions
 * @param userData - User data including name and partner name
 * @returns Promise with success status and any error message
 */
export const generateAILetter = async (
  questions: Question[],
  userData: ComponentData
): Promise<AILetterResult> => {
  try {
    // Prepare AI request based on user responses
    const userResponses = {
      overwhelmed: questions[0]?.answer || false,
      needsComfort: questions[1]?.answer || false,
      needsLoveReminder: questions[2]?.answer || false,
    };

    const aiRequest = {
      userResponses,
      userName: userData.callsign, // This is the girlfriend receiving the letter
      partnerName: userData.bfName || 'Your Love', // This is the boyfriend sending the letter
      customContext: `This girlfriend is feeling sad and needs emotional support. Create a personalized, heartfelt letter from her boyfriend.`
    };

    const response = await aiService.generateComfortLetter(aiRequest);
    
    if (response.success && response.letter) {
      // Save the AI-generated letter to database
      const { createLetter } = useMessagesStore.getState();
      const letterData = {
        title: response.letter.title,
        message: response.letter.content,
        category: "sad",
        is_girlfriend: false // Assuming this comes from the boyfriend/partner
      };

      await createLetter(letterData);
      console.log('AI-generated comfort letter saved successfully');
      
      return {
        success: true
      };
    } else {
      const errorMessage = response.error || 'Failed to generate comfort letter';
      console.error('Failed to generate AI letter:', response.error);
      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (error) {
    const errorMessage = 'Failed to connect to AI service';
    console.error('Error generating AI letter:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Hook for managing AI-powered sad forms functionality
 * @returns Object with AI functions and utilities
 */
export const useAISadForms = () => {
  return {
    generateAIQuestions,
    generateAILetter,
    getDefaultQuestions,
    determineToneFromResponses,
    enhanceMessageWithAI,
  };
};
