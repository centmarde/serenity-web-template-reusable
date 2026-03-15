import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  dangerouslyAllowBrowser: true // Allow client-side usage (be careful in production)
});

// Base types for AI responses
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BaseAIResponse {
  success: boolean;
  message?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CelebrationMessageRequest {
  celebrationType: 'monthsary' | 'anniversary';
  monthsCompleted: number;
  yearsCompleted: number;
  userName: string;
  partnerName: string;
  coupleOfficialDate: string;
  customContext?: string;
}

export interface CelebrationMessageResponse extends BaseAIResponse {
  celebrationMessage?: {
    title: string;
    subtitle: string;
    personalMessage: string;
    tone: 'romantic' | 'playful' | 'heartfelt' | 'joyful';
  };
}

export interface SimpleMessageRequest {
  prompt: string;
  userName?: string;
  context?: string;
  maxWords?: number;
}

export interface SimpleMessageResponse extends BaseAIResponse {
  generatedMessage?: string;
}

// Main reusable AI service class
class BaseAIService {
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

  // Generate personalized celebration messages
  async generateCelebrationMessage(request: CelebrationMessageRequest): Promise<CelebrationMessageResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      const systemPrompt = this.buildCelebrationSystemPrompt();
      const userPrompt = this.buildCelebrationUserPrompt(request);

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 800,
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
      const celebrationData = this.parseCelebrationResponse(response);
      
      return {
        success: true,
        message: 'Celebration message generated successfully',
        celebrationMessage: celebrationData,
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Error generating celebration message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate celebration message'
      };
    }
  }

  // Generate simple AI messages for various purposes
  async generateSimpleMessage(request: SimpleMessageRequest): Promise<SimpleMessageResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      const maxWords = request.maxWords || 100;
      let prompt = request.prompt;
      
      if (request.userName) {
        prompt += ` The user's name is ${request.userName}.`;
      }
      
      if (request.context) {
        prompt += ` Additional context: ${request.context}`;
      }
      
      prompt += ` Keep the response under ${maxWords} words and make it personal and heartfelt.`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a caring, romantic, and thoughtful AI assistant who creates personalized messages with warmth and authenticity.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: Math.min(maxWords * 2, 300), // Rough estimate of tokens
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
        message: 'Message generated successfully',
        generatedMessage: message.trim(),
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Error generating simple message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate message'
      };
    }
  }

  // General chat functionality
  async chat(messages: AIMessage[]): Promise<BaseAIResponse> {
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
  private buildCelebrationSystemPrompt(): string {
    return `You are a romantic and thoughtful AI assistant specialized in creating personalized celebration messages for couples celebrating their relationship milestones.

Your role is to:
1. Create warm, romantic, and deeply personal celebration messages
2. Be genuine and avoid generic or cliché phrases
3. Capture the joy and significance of relationship milestones
4. Write with emotional depth and authenticity
5. Make each message feel unique and special

Always respond with a JSON object containing:
{
  "title": "A celebratory title for the milestone (keep it joyful and personal)",
  "subtitle": "A brief subtitle capturing the essence of this timeframe",
  "personalMessage": "A heartfelt personal message (150-250 words) that feels genuine and romantic",
  "tone": "romantic|playful|heartfelt|joyful"
}

Make each message deeply personal and avoid generic relationship advice.`;
  }

  private buildCelebrationUserPrompt(request: CelebrationMessageRequest): string {
    const { celebrationType, monthsCompleted, yearsCompleted, userName, partnerName, coupleOfficialDate, customContext } = request;
    
    let prompt = `Create a personalized ${celebrationType} celebration message:\n\n`;
    
    if (celebrationType === 'monthsary') {
      prompt += `Celebrating: ${monthsCompleted} month${monthsCompleted === 1 ? '' : 's'} together\n`;
    } else {
      prompt += `Celebrating: ${yearsCompleted} year${yearsCompleted === 1 ? '' : 's'} anniversary\n`;
    }
    
    prompt += `Partner's name: ${userName}\n`;
    prompt += `Message from: ${partnerName}\n`;
    prompt += `Official couple date: ${coupleOfficialDate}\n\n`;
    
    if (customContext) {
      prompt += `Additional context: ${customContext}\n\n`;
    }
    
    prompt += `Create a message that feels genuinely personal to ${userName}, celebrates this specific milestone meaningfully, and captures the unique joy of ${celebrationType === 'monthsary' ? 'reaching this monthly milestone' : 'completing a full year together'}. `;
    prompt += `Make it romantic but authentic, avoiding overly sweet clichés.`;
    
    return prompt;
  }

  private parseCelebrationResponse(response: string): { title: string; subtitle: string; personalMessage: string; tone: 'romantic' | 'playful' | 'heartfelt' | 'joyful' } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      // Ensure tone is one of the allowed values
      const validTones = ['romantic', 'playful', 'heartfelt', 'joyful'] as const;
      const tone = validTones.includes(parsed.tone) ? parsed.tone : 'romantic';
      
      return {
        title: parsed.title || "Celebrating Us",
        subtitle: parsed.subtitle || "Another milestone in our beautiful journey",
        personalMessage: parsed.personalMessage || response,
        tone: tone
      };
    } catch {
      // If not JSON, create a structured response
      return {
        title: "Celebrating Us",
        subtitle: "Another milestone in our beautiful journey",
        personalMessage: response,
        tone: "romantic" as const
      };
    }
  }
}

// Utility functions for the base AI service
export const aiUtils = {
  // Test if AI service is working
  async testConnection(): Promise<boolean> {
    try {
      const response = await baseAIService.generateSimpleMessage({
        prompt: 'Generate a simple test message',
        maxWords: 20
      });
      return response.success;
    } catch {
      return false;
    }
  },

  // Create time-based greetings
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
  },

  // Generate celebration fallback messages
  getFallbackCelebrationMessage(celebrationType: 'monthsary' | 'anniversary', count: number, userName: string): {
    title: string;
    subtitle: string;
    personalMessage: string;
    tone: 'romantic' | 'playful' | 'heartfelt' | 'joyful';
  } {
    if (celebrationType === 'monthsary') {
      return {
        title: `Happy ${count} Month${count === 1 ? '' : 's'} Together! 🎉`,
        subtitle: `${count} month${count === 1 ? '' : 's'} of love, laughter, and beautiful memories`,
        personalMessage: `My dearest ${userName}, today marks ${count} wonderful month${count === 1 ? '' : 's'} since we officially became a couple. Every moment with you has been a treasure, and I can't wait for all the adventures still to come! Thank you for being the most amazing partner. Every day with you is a celebration! 💕`,
        tone: 'romantic' as const
      };
    } else {
      return {
        title: `Happy ${count} Year Anniversary! 🎊`,
        subtitle: `${count} amazing year${count === 1 ? '' : 's'} of love and togetherness`,
        personalMessage: `Today we celebrate ${count} incredible year${count === 1 ? '' : 's'} together! From our first day to this moment, every memory we've created has been precious. Here's to many more years of love, growth, and happiness together! Thank you for being my everything, ${userName}. 💖`,
        tone: 'heartfelt' as const
      };
    }
  }
};

// Export singleton instance
export const baseAIService = new BaseAIService();

// Export default class
export default BaseAIService;