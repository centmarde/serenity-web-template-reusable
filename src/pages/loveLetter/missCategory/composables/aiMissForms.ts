import { aiService } from "../../../../lib/AiSadResponse";
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
  feelingDistance: boolean;
  needsWarmReassurance: boolean;
  needsRomance: boolean;
  needsConnection: boolean;
  needsPlayfulEnergy: boolean;
}

export interface EnhancedMessage {
  title: string;
  content: string;
  tone: 'romantic' | 'affectionate' | 'playful' | 'reassuring';
}

export interface AIEnhanceResult {
  success: boolean;
  enhancedMessage?: EnhancedMessage;
  error?: string;
}

// Default questions fallback with expanded tone mapping questions for missing someone
const getDefaultQuestions = (): Question[] => [
  {
    id: 1,
    text: "Are you feeling the distance between us more than usual right now?",
    answered: false,
    answer: null
  },
  {
    id: 2,
    text: "Would you appreciate warm, reassuring words about our connection?",
    answered: false,
    answer: null
  },
  {
    id: 3,
    text: "Do you need romantic expressions of love and devotion right now?",
    answered: false,
    answer: null
  },
  {
    id: 4,
    text: "Would heartfelt words about our bond and memories help you feel connected?",
    answered: false,
    answer: null
  },
  {
    id: 5,
    text: "Do you need playful, lighthearted messages to brighten your mood?",
    answered: false,
    answer: null
  }
];

/**
 * Determine the best tone based on user responses to 5 questions for missing someone
 */
export const determineToneFromResponses = (questions: Question[]): 'romantic' | 'affectionate' | 'playful' | 'reassuring' => {
  const responses = {
    feelingDistance: questions[0]?.answer || false,        // Q1: Feeling distance (reassuring)
    needsWarmReassurance: questions[1]?.answer || false,   // Q2: Warm reassurance (reassuring)
    needsRomance: questions[2]?.answer || false,           // Q3: Romance (romantic)
    needsConnection: questions[3]?.answer || false,        // Q4: Connection (affectionate)
    needsPlayfulEnergy: questions[4]?.answer || false      // Q5: Playful energy (playful)
  };

  // Count votes for each tone
  const toneScores = {
    reassuring: (responses.feelingDistance ? 2 : 0) + (responses.needsWarmReassurance ? 2 : 0),
    romantic: responses.needsRomance ? 2 : 0,
    affectionate: responses.needsConnection ? 2 : 0,
    playful: responses.needsPlayfulEnergy ? 2 : 0
  };

  // Find the tone with the highest score
  const maxScore = Math.max(...Object.values(toneScores));
  
  // If there's a clear winner, return it
  for (const [tone, score] of Object.entries(toneScores)) {
    if (score === maxScore && score > 0) {
      return tone as 'romantic' | 'affectionate' | 'playful' | 'reassuring';
    }
  }

  // Default fallback based on responses
  if (responses.feelingDistance) return 'reassuring';
  else if (responses.needsWarmReassurance) return 'reassuring';  
  else if (responses.needsRomance) return 'romantic';
  else if (responses.needsConnection) return 'affectionate';
  else if (responses.needsPlayfulEnergy) return 'playful';
  else return 'affectionate';
};

/**
 * Enhance a message using AI based on user responses and tone for missing someone
 */
export const enhanceMessageWithAI = async (
  questions: Question[],
  baseLetter: LoveLetter | null,
  userData: ComponentData,
  tone: 'romantic' | 'affectionate' | 'playful' | 'reassuring'
): Promise<AIEnhanceResult> => {
  try {
    const userResponses = {
      feelingDistance: questions[0]?.answer || false,
      needsWarmReassurance: questions[1]?.answer || false,
      needsRomance: questions[2]?.answer || false,
      needsConnection: questions[3]?.answer || false,
      needsPlayfulEnergy: questions[4]?.answer || false,
    };

    let improvePrompt = '';
    
    if (baseLetter) {
      improvePrompt = `You are a loving AI assistant helping a boyfriend write heartfelt messages to his girlfriend who misses him.

Base letter to improve:
Title: "${baseLetter.title || 'Untitled'}"
Message: "${baseLetter.message || ''}"

User responses: Distance: ${userResponses.feelingDistance}, Reassurance: ${userResponses.needsWarmReassurance}, Romance: ${userResponses.needsRomance}, Connection: ${userResponses.needsConnection}, Playful: ${userResponses.needsPlayfulEnergy}

Target tone: ${tone}
Recipient: ${userData.callsign}, Sender: ${userData.bfName || 'Your Love'}

Write FROM ${userData.bfName || 'your boyfriend'} TO ${userData.callsign} using "${tone}" tone to help with missing feelings.

Return ONLY JSON: {"title": "...", "content": "...", "tone": "${tone}"}`;
    } else {
      improvePrompt = `Create a ${tone} message FROM ${userData.bfName || 'your boyfriend'} TO ${userData.callsign} who is missing him.

User needs: Distance: ${userResponses.feelingDistance}, Reassurance: ${userResponses.needsWarmReassurance}, Romance: ${userResponses.needsRomance}, Connection: ${userResponses.needsConnection}, Playful: ${userResponses.needsPlayfulEnergy}

Return ONLY JSON: {"title": "...", "content": "...", "tone": "${tone}"}`;
    }

    const messages = [
      { role: 'system' as const, content: 'You are a loving AI assistant helping write heartfelt messages for couples who miss each other.' },
      { role: 'user' as const, content: improvePrompt }
    ];

    if (!aiService.isConfigured()) {
      return {
        success: true,
        enhancedMessage: {
          title: "Missing You Too",
          content: baseLetter?.message || "I miss you more than words can say. You're always in my heart. 💕",
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
          data = { title: "Thinking of You", content: response.message, tone: tone };
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
            title: "Always in My Heart", 
            content: "Distance means nothing when someone means everything. 💕",
            tone: tone
          }
        };
      }
    }

    return {
      success: true,
      enhancedMessage: {
        title: "Missing You",
        content: "You're always on my mind and in my heart. 💕",
        tone: tone
      }
    };
  } catch {
    return {
      success: true,
      enhancedMessage: {
        title: "In My Thoughts",
        content: "Every moment apart makes me appreciate you more. 💕",
        tone: tone
      }
    };
  }
};

/**
 * Generate AI-powered empathetic questions for someone who is missing their partner
 * @param userName - The name of the user who is missing someone
 * @returns Promise with success status and questions or error
 */
export const generateAIQuestions = async (userName: string): Promise<AIQuestionsResult> => {
  try {
    const prompt = `Generate 5 thoughtful, empathetic yes/no questions from a BOYFRIEND directly asking his girlfriend named ${userName} who is missing him. The boyfriend is speaking to his girlfriend to understand what kind of message would help her feel better.

The questions should map to these tones:
1. Distance feelings assessment (for reassuring tone)
2. Warm reassurance preference (for reassuring tone) 
3. Romance needs (for romantic tone)
4. Connection preference (for affectionate tone)
5. Playful energy preference (for playful tone)

Requirements:
- Questions should be the boyfriend directly addressing his girlfriend using "you" (e.g., "Are you feeling...", "Would you appreciate...", "Do you need...")
- Questions help the boyfriend understand what type of comfort message to write
- Keep questions simple and answerable with yes/no
- Focus on understanding her emotional needs when missing him
- Use caring, loving tone as if the boyfriend is speaking to his girlfriend

Return ONLY a JSON array of 5 questions in this exact format:
["Question 1 text here?", "Question 2 text here?", "Question 3 text here?", "Question 4 text here?", "Question 5 text here?"]`;

    const messages = [
      { role: 'system' as const, content: 'You are a compassionate AI helping a boyfriend generate caring questions to ask his girlfriend directly. The boyfriend is speaking to his girlfriend to understand her emotional needs when she misses him.' },
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
          
          console.log('AI-generated miss questions loaded successfully');
          return {
            success: true,
            questions: aiQuestions
          };
        } else {
          throw new Error('Invalid AI response format');
        }
      } catch (parseError) {
        console.error('Failed to parse AI miss questions:', parseError);
        console.log('Using default questions as fallback');
        return {
          success: false,
          questions: getDefaultQuestions(),
          error: 'Failed to parse AI response, using fallback questions'
        };
      }
    } else {
      console.error('Failed to generate AI miss questions:', response.error);
      console.log('Using default questions as fallback');
      return {
        success: false,
        questions: getDefaultQuestions(),
        error: response.error || 'AI service error'
      };
    }
  } catch (error) {
    console.error('Error generating AI miss questions:', error);
    console.log('Using default questions as fallback');
    return {
      success: false,
      questions: getDefaultQuestions(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Generate AI-powered message based on user responses for missing someone
 * @param questions - Array of answered questions
 * @param userData - User data including name and partner name
 * @returns Promise with success status and any error message
 */
export const generateAILetter = async (
  questions: Question[],
  userData: ComponentData
): Promise<AILetterResult> => {
  try {
    // Map miss-specific responses to the expected ComfortLetterRequest format
    const userResponses = {
      overwhelmed: questions[0]?.answer || false, // feelingDistance mapped to overwhelmed
      needsComfort: questions[1]?.answer || false, // needsReassurance mapped to needsComfort
      needsLoveReminder: questions[2]?.answer || false, // needsRomance mapped to needsLoveReminder
    };

    const aiRequest = {
      userResponses,
      userName: userData.callsign, // This is the girlfriend receiving the letter
      partnerName: userData.bfName || 'Your Love', // This is the boyfriend sending the letter
      customContext: `This girlfriend is missing her boyfriend and needs emotional comfort. Create a personalized, heartfelt letter from her boyfriend to help with the longing.`
    };

    const response = await aiService.generateComfortLetter(aiRequest);
    
    if (response.success && response.letter) {
      // Save the AI-generated letter to database
      const { createLetter } = useMessagesStore.getState();
      const letterData = {
        title: response.letter.title,
        message: response.letter.content,
        category: "miss",
        is_girlfriend: false // Assuming this comes from the boyfriend/partner
      };

      await createLetter(letterData);
      console.log('AI-generated miss letter saved successfully');
      
      return {
        success: true
      };
    } else {
      const errorMessage = response.error || 'Failed to generate miss letter';
      console.error('Failed to generate AI miss letter:', response.error);
      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (error) {
    const errorMessage = 'Failed to connect to AI service';
    console.error('Error generating AI miss letter:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Hook for managing AI-powered miss forms functionality
 * @returns Object with AI functions and utilities
 */
export const useAIMissForms = () => {
  return {
    generateAIQuestions,
    generateAILetter,
    getDefaultQuestions,
    determineToneFromResponses,
    enhanceMessageWithAI,
  };
};