import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  dangerouslyAllowBrowser: true // Allow client-side usage (be careful in production)
});

// Types for AI responses
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ComfortLetterRequest {
  userResponses: {
    overwhelmed: boolean;
    needsComfort: boolean;
    needsLoveReminder: boolean;
  };
  userName: string;
  partnerName: string;
  customContext?: string;
}

export interface ComfortLetterResponse extends AIResponse {
  letter?: {
    title: string;
    content: string;
    tone: 'gentle' | 'encouraging' | 'loving' | 'supportive';
    category: string;
  };
}

// Main AI class
class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!this.apiKey) {
      console.error('AI API key is missing from environment variables');
    }
  }

  // Check if API key is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Generate personalized comfort letter based on user responses
  async generateComfortLetter(request: ComfortLetterRequest): Promise<ComfortLetterResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request);

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile', // Using Groq's Llama model
        temperature: 0.8,
        max_tokens: 1000,
        top_p: 0.9,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          success: false,
          error: 'No response generated from AI service'
        };
      }

      // Parse the JSON response
      const letterData = this.parseLetterResponse(response);
      
      return {
        success: true,
        message: 'Comfort letter generated successfully',
        letter: letterData,
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Error generating comfort letter:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate comfort letter'
      };
    }
  }

  // Generate encouraging messages for different scenarios
  async generateEncouragingMessage(scenario: 'sad' | 'stressed' | 'lonely' | 'overwhelmed', userName: string): Promise<AIResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      const prompt = `Generate a short, heartfelt, and encouraging message for someone named ${userName} who is feeling ${scenario}. 
      Keep it personal, warm, and under 100 words. Make it sound like it's coming from someone who cares deeply about them.
      Return just the message text, no JSON formatting.`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a compassionate and caring AI assistant who provides emotional support and encouragement.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200,
        top_p: 0.8
      });

      const message = completion.choices[0]?.message?.content;
      
      if (!message) {
        return {
          success: false,
          error: 'No message generated'
        };
      }

      return {
        success: true,
        message: message.trim(),
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Error generating encouraging message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate message'
      };
    }
  }

  // Chat with AI for general conversation
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          success: false,
          error: 'No response generated'
        };
      }

      return {
        success: true,
        message: response,
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Error in chat:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process chat'
      };
    }
  }

  // Private helper methods
  private buildSystemPrompt(): string {
    return `You are a compassionate AI assistant specialized in creating personalized comfort letters for people who are feeling sad or emotional. 

Your role is to:
1. Create warm, heartfelt, and genuinely caring messages
2. Be empathetic and understanding
3. Provide gentle encouragement without being dismissive of feelings
4. Write in a personal, intimate tone as if from a loving partner or friend
5. Keep messages authentic and avoid being overly cheerful or generic

Always respond with a JSON object containing:
{
  "title": "A gentle, caring title for the letter",
  "content": "The main body of the comfort letter (200-400 words)",
  "tone": "gentle|encouraging|loving|supportive",
  "category": "sad"
}

Make each letter unique and personalized based on the user's responses.`;
  }

  private buildUserPrompt(request: ComfortLetterRequest): string {
    const { userResponses, userName, partnerName, customContext } = request;
    
    let prompt = `Create a personalized comfort letter for ${userName} from ${partnerName}.\n\n`;
    
    prompt += `Based on their responses:\n`;
    prompt += `- Feeling overwhelmed: ${userResponses.overwhelmed ? 'Yes' : 'No'}\n`;
    prompt += `- Needs gentle comfort: ${userResponses.needsComfort ? 'Yes' : 'No'}\n`;
    prompt += `- Needs love reminder: ${userResponses.needsLoveReminder ? 'Yes' : 'No'}\n\n`;
    
    if (customContext) {
      prompt += `Additional context: ${customContext}\n\n`;
    }
    
    prompt += `Create a letter that addresses their specific needs, is personal to ${userName}, and feels like it's genuinely from ${partnerName}. 
    Make it heartfelt, comforting, and tailored to their emotional state.`;
    
    return prompt;
  }

  private parseLetterResponse(response: string): { title: string; content: string; tone: 'gentle' | 'encouraging' | 'loving' | 'supportive'; category: string } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      // Ensure tone is one of the allowed values
      const validTones = ['gentle', 'encouraging', 'loving', 'supportive'] as const;
      const tone = validTones.includes(parsed.tone) ? parsed.tone : 'loving';
      
      return {
        title: parsed.title || "A Message of Love",
        content: parsed.content || response,
        tone: tone,
        category: parsed.category || "sad"
      };
    } catch {
      // If not JSON, create a structured response
      return {
        title: "A Message of Love",
        content: response,
        tone: "loving" as const,
        category: "sad"
      };
    }
  }
}

// Utility functions for AI service
export const aiUtils = {
  // Test if AI service is working
  async testConnection(): Promise<boolean> {
    try {
      const response = await aiService.generateEncouragingMessage('sad', 'Test User');
      return response.success;
    } catch {
      return false;
    }
  },

  // Generate multiple comfort letters for different scenarios
  async generateMultipleComfortLetters(request: ComfortLetterRequest): Promise<ComfortLetterResponse[]> {
    const scenarios = [
      { ...request, customContext: 'Focus on providing gentle comfort and understanding' },
      { ...request, customContext: 'Emphasize inner strength and resilience' },
      { ...request, customContext: 'Remind them of happy memories and future possibilities' }
    ];

    const promises = scenarios.map(scenario => aiService.generateComfortLetter(scenario));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<ComfortLetterResponse> => 
        result.status === 'fulfilled' && result.value.success
      )
      .map(result => result.value);
  },

  // Create a personalized greeting based on time of day
  getTimeBasedGreeting(userName: string): string {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 6) {
      greeting = `Good night, ${userName} 🌙`;
    } else if (hour < 12) {
      greeting = `Good morning, ${userName} ☀️`;
    } else if (hour < 17) {
      greeting = `Good afternoon, ${userName} 🌤️`;
    } else if (hour < 21) {
      greeting = `Good evening, ${userName} 🌆`;
    } else {
      greeting = `Good night, ${userName} 🌙`;
    }
    
    return greeting;
  },

  // Format AI response for display
  formatResponse(response: string): string {
    return response
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .trim();
  }
};

// Export singleton instance
export const aiService = new AIService();

// Export default class
export default AIService;
