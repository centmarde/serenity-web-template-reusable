import Groq from 'groq-sdk';
import type { TarotCard } from '../composables/tarotConstant';

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  dangerouslyAllowBrowser: true // Allow client-side usage (be careful in production)
});

export interface TarotCardReading {
  cardIndex: number;
  cardName: string;
  question: string;
  originalDescription: string;
  aiInterpretation: string;
  timestamp: number;
}

export interface TarotReadingSession {
  readings: TarotCardReading[];
  sessionId: string;
  createdAt: number;
  isComplete: boolean;
}

export interface TarotReadingRequest {
  selectedCards: TarotCard[];
  cardTitles: string[];
}

export interface TarotReadingResponse {
  success: boolean;
  session?: TarotReadingSession;
  error?: string;
}

class AiTarotReadingService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!this.apiKey) {
      console.error('AI API key is missing from environment variables');
    }
  }

  // Default card titles for 6-card spread
  private readonly DEFAULT_CARD_TITLES = [
    "How you feel about yourself",
    "What you want most right now", 
    "Your fears",
    "What is going for you",
    "What is going against you",
    "The likely outcome"
  ];

  // Check if API key is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Generate complete tarot reading for all 6 cards
  async generateTarotReading(request: TarotReadingRequest): Promise<TarotReadingResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    if (request.selectedCards.length !== 6) {
      return {
        success: false,
        error: 'Tarot reading requires exactly 6 cards'
      };
    }

    try {
      console.log('🔮 Generating AI tarot reading...');
      
      const sessionId = this.generateSessionId();
      const cardTitles = request.cardTitles.length === 6 ? request.cardTitles : this.DEFAULT_CARD_TITLES;
      
      const readings: TarotCardReading[] = [];

      // Process each card individually for personalized interpretations
      for (let i = 0; i < 6; i++) {
        const card = request.selectedCards[i];
        const question = cardTitles[i];

        console.log(`🔮 Processing Card ${i + 1}: ${card.name} - "${question}"`);

        const cardReading = await this.generateSingleCardReading({
          card,
          question,
          cardIndex: i
        });

        if (cardReading) {
          readings.push(cardReading);
        } else {
          // If any card fails, return error
          return {
            success: false,
            error: `Failed to generate reading for card ${i + 1}: ${card.name}`
          };
        }
      }

      const session: TarotReadingSession = {
        readings,
        sessionId,
        createdAt: Date.now(),
        isComplete: readings.length === 6
      };

      console.log('🔮 Tarot reading session completed:', sessionId);

      return {
        success: true,
        session
      };

    } catch (error) {
      console.error('Error generating tarot reading:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate tarot reading'
      };
    }
  }

  // Generate reading for a single card
  private async generateSingleCardReading(params: {
    card: TarotCard;
    question: string;
    cardIndex: number;
  }): Promise<TarotCardReading | null> {
    try {
      const systemPrompt = this.buildTarotSystemPrompt();
      const userPrompt = this.buildTarotUserPrompt(params);

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 400,
        top_p: 0.9,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        console.error(`No response received for card: ${params.card.name}`);
        return null;
      }

      return {
        cardIndex: params.cardIndex,
        cardName: params.card.name,
        question: params.question,
        originalDescription: params.card.description,
        aiInterpretation: response.trim(),
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`Error generating reading for ${params.card.name}:`, error);
      return null;
    }
  }

  // Build system prompt for tarot reading
  private buildTarotSystemPrompt(): string {
    return `You are a wise and intuitive tarot reader providing insightful guidance and personal reflection.

Your role is to:
1. Provide personalized, insightful tarot interpretations
2. Connect the traditional card meaning with the specific question asked
3. Keep interpretations supportive, encouraging, and thought-provoking
4. Write in a warm, understanding, and slightly mystical tone
5. Provide practical guidance for personal growth and self-reflection
6. Keep responses concise but meaningful (100-150 words)
7. Focus on emotional insights and personal development
8. When relevant, gently weave in how the message may show up in relationships and loved ones

Guidelines:
- Address the reader directly as "you"
- Connect the card's energy to the specific question being asked
- Provide both insight and gentle guidance
- Keep the tone mystical but accessible
- Avoid overly dramatic predictions
- Focus on personal growth and self-awareness
- If referencing loved ones, keep it general and supportive (do not invent specific names, events, or facts)

Write each interpretation as a flowing, personalized reading that directly answers the question asked.`;
  }

  // Build user prompt for specific card and question
  private buildTarotUserPrompt(params: {
    card: TarotCard;
    question: string;
    cardIndex: number;
  }): string {
    const cardPosition = params.cardIndex + 1;

    let prompt = `Please provide a tarot reading for:\n\n`;
    prompt += `Card Position: ${cardPosition} of 6\n`;
    prompt += `Card Name: ${params.card.name}\n`;
    prompt += `Question: "${params.question}"\n\n`;
    
    prompt += `Traditional Card Meaning:\n${params.card.description}\n\n`;
    
    prompt += `Instructions:\n`;
    prompt += `Create a personalized interpretation that directly addresses the question "${params.question}" `;
    prompt += `using the energy and symbolism of ${params.card.name}. `;
    prompt += `Connect the traditional meaning to this specific life context. `;
    prompt += `Write as if speaking directly to the reader as "you" in a warm, insightful manner. `;
    prompt += `Focus on emotional insights, personal growth, and self-awareness. `;
    prompt += `When relevant, include how this may relate to your relationships and loved ones (without assuming specific details).`;

    return prompt;
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `tarot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility method to get reading by session ID
  async getReadingSession(sessionId: string): Promise<TarotReadingSession | null> {
    try {
      // This would typically retrieve from a database or storage
      // For now, we'll return null as sessions are managed by the store
      console.log('🔮 Retrieving tarot session:', sessionId);
      return null;
    } catch (error) {
      console.error('Error retrieving tarot session:', error);
      return null;
    }
  }
}

// Export singleton instance
export const aiTarotReadingService = new AiTarotReadingService();

// Export utility functions
export const tarotReadingUtils = {
  // Test if AI service is working
  async testConnection(): Promise<boolean> {
    try {
      return aiTarotReadingService.isConfigured();
    } catch {
      return false;
    }
  },

  // Format reading for display
  formatReading(reading: TarotCardReading): string {
    return `**${reading.question}**\n\n*${reading.cardName}*\n\n${reading.aiInterpretation}`;
  },

  // Get reading summary
  getSessionSummary(session: TarotReadingSession): string {
    const completionStatus = session.isComplete ? 'Complete' : 'Incomplete';
    return `Tarot Reading - ${completionStatus} (${session.readings.length}/6 cards)`;
  }
};

export default AiTarotReadingService;