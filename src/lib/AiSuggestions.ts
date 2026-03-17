import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  dangerouslyAllowBrowser: true // Allow client-side usage (be careful in production)
});

export interface MemorySuggestionRequest {
  type: 'title' | 'description' | 'detail';
  currentText?: string;
  context?: {
    date?: string;
    existingTitle?: string;
    existingDescription?: string;
    details?: string[];
  };
  userName?: string;
  partnerName?: string;
}

export interface MemorySuggestionResponse {
  success: boolean;
  suggestions?: string[];
  enhancedText?: string;
  error?: string;
}

class AISuggestionsService {
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

  // Generate memory title suggestions
  async generateTitleSuggestions(request: MemorySuggestionRequest): Promise<MemorySuggestionResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      const systemPrompt = this.buildTitleSystemPrompt();
      const userPrompt = this.buildTitleUserPrompt(request);

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 300,
        top_p: 0.9,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          success: false,
          error: 'No suggestions generated from AI service'
        };
      }

      // Parse the suggestions
      const suggestions = this.parseSuggestions(response);
      
      return {
        success: true,
        suggestions: suggestions
      };

    } catch (error) {
      console.error('Error generating title suggestions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate title suggestions'
      };
    }
  }

  // Generate memory detail suggestions (single sentences)
  async generateDetailSuggestions(request: MemorySuggestionRequest): Promise<MemorySuggestionResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      const systemPrompt = this.buildDetailSystemPrompt();
      const userPrompt = this.buildDetailUserPrompt(request);

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 200,
        top_p: 0.9,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          success: false,
          error: 'No detail suggestions generated from AI service'
        };
      }

      // Parse the suggestions
      const suggestions = this.parseSuggestions(response);
      
      return {
        success: true,
        suggestions: suggestions
      };

    } catch (error) {
      console.error('Error generating detail suggestions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate detail suggestions'
      };
    }
  }

  // Generate memory description suggestions
  async generateDescriptionSuggestion(request: MemorySuggestionRequest): Promise<MemorySuggestionResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      const systemPrompt = this.buildDescriptionSystemPrompt();
      const userPrompt = this.buildDescriptionUserPrompt(request);

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 400,
        top_p: 0.8,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          success: false,
          error: 'No description generated from AI service'
        };
      }

      return {
        success: true,
        enhancedText: response.trim()
      };

    } catch (error) {
      console.error('Error generating description suggestion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate description suggestion'
      };
    }
  }

  // Enhance existing text (title or description)
  async enhanceText(request: MemorySuggestionRequest): Promise<MemorySuggestionResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'AI service is not properly configured'
      };
    }

    try {
      let systemPrompt: string;
      if (request.type === 'title') {
        systemPrompt = this.buildTitleEnhancementSystemPrompt();
      } else if (request.type === 'detail') {
        systemPrompt = this.buildDetailSystemPrompt();
      } else {
        systemPrompt = this.buildDescriptionEnhancementSystemPrompt();
      }
        
      const userPrompt = this.buildEnhancementUserPrompt(request);

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: request.type === 'title' || request.type === 'detail' ? 200 : 250,
        top_p: 0.8,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          success: false,
          error: 'No enhancement generated from AI service'
        };
      }

      if (request.type === 'title' || request.type === 'detail') {
        // For titles and details, return suggestions
        const suggestions = this.parseSuggestions(response);
        return {
          success: true,
          suggestions: suggestions
        };
      } else {
        // For descriptions, return enhanced text
        return {
          success: true,
          enhancedText: response.trim()
        };
      }

    } catch (error) {
      console.error('Error enhancing text:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enhance text'
      };
    }
  }

  // Private helper methods
  private buildTitleSystemPrompt(): string {
    return `You are a creative and romantic AI assistant specialized in creating beautiful memory titles for couples.

Your role is to:
1. Generate 3-4 creative, romantic, and meaningful titles
2. Make each title unique and evocative
3. Keep titles concise but emotionally resonant (3-8 words)
4. Avoid generic or cliché phrases
5. Make them feel personal and special

Return only the titles, one per line, without numbering or bullets.
Examples of good titles:
- "Our First Adventure Together"
- "Dancing Under the Stars"
- "Coffee Shop Confessions"
- "Sunset Promises"
- "Home is Where You Are"`;
  }

  private buildDescriptionSystemPrompt(): string {
    return `You are a thoughtful and romantic AI assistant specialized in helping couples write beautiful memory descriptions.

Your role is to:
1. Create warm, personal, and emotionally rich descriptions
2. Use vivid but authentic language
3. Keep descriptions concise and heartfelt (50-80 words)
4. Avoid overly dramatic or cliché expressions
5. Focus on emotions, sensations, and meaningful details
6. Make it feel like a love letter excerpt

Write in a warm, intimate tone that captures the essence of a cherished memory. Keep it short but meaningful.`;
  }

  private buildTitleEnhancementSystemPrompt(): string {
    return `You are a creative AI assistant helping enhance memory titles for couples.

Your role is to:
1. Take an existing title and create 3-4 enhanced versions
2. Make titles more romantic, creative, or emotionally resonant
3. Keep the original meaning but make it more beautiful
4. Vary the style - some poetic, some playful, some deeply romantic
5. Keep titles concise (3-8 words)

Return only the enhanced titles, one per line, without numbering or bullets.`;
  }

  private buildDescriptionEnhancementSystemPrompt(): string {
    return `You are a thoughtful AI assistant helping enhance memory descriptions for couples.

Your role is to:
1. Take existing text and make it more beautiful and romantic
2. Add emotional depth and vivid details
3. Maintain the original story but enhance the language
4. Keep it authentic and not overly dramatic (50-80 words)
5. Make it feel more intimate and personal

Return only the enhanced description as a flowing narrative. Keep it concise but meaningful.`;
  }

  private buildDetailSystemPrompt(): string {
    return `You are a creative AI assistant specialized in generating romantic memory detail tags for couples.

Your role is to:
1. Generate 3-4 short, meaningful detail phrases (3-6 words each)
2. Make them romantic, sweet, and relevant to relationship memories
3. Use emotional, sensory, or milestone-based descriptions
4. Keep each suggestion as a single phrase, not a full sentence
5. Make them feel personal and special

Return only the detail phrases, one per line, without numbering or bullets.
Examples: "First Kiss", "Candlelit Dinner", "Dancing in the Rain", "Sunset Walk Together"`;
  }

  private buildTitleUserPrompt(request: MemorySuggestionRequest): string {
    let prompt = 'Generate creative memory titles based on:\n\n';
    
    if (request.context?.date) {
      prompt += `Date: ${request.context.date}\n`;
    }
    
    if (request.context?.existingDescription) {
      prompt += `Context: ${request.context.existingDescription}\n`;
    }
    
    if (request.context?.details && request.context.details.length > 0) {
      prompt += `Details: ${request.context.details.join(', ')}\n`;
    }
    
    if (request.currentText) {
      prompt += `Current title: ${request.currentText}\n`;
    }
    
    prompt += '\nGenerate 3-4 beautiful, romantic titles that would capture this memory perfectly.';
    
    return prompt;
  }

  private buildDescriptionUserPrompt(request: MemorySuggestionRequest): string {
    let prompt = 'Create a beautiful memory description based on:\n\n';
    
    if (request.context?.existingTitle) {
      prompt += `Title: ${request.context.existingTitle}\n`;
    }
    
    if (request.context?.date) {
      prompt += `Date: ${request.context.date}\n`;
    }
    
    if (request.context?.details && request.context.details.length > 0) {
      prompt += `Details: ${request.context.details.join(', ')}\n`;
    }
    
    if (request.currentText) {
      prompt += `Current description: ${request.currentText}\n`;
    }
    
    prompt += '\nWrite a concise, warm, romantic description (50-80 words) that tells the story of this beautiful memory. Make it personal and emotionally rich but keep it short.';
    
    return prompt;
  }

  private buildDetailUserPrompt(request: MemorySuggestionRequest): string {
    let prompt = 'Generate romantic detail phrases for this memory:\n\n';
    
    if (request.context?.existingTitle) {
      prompt += `Title: ${request.context.existingTitle}\n`;
    }
    
    if (request.context?.date) {
      prompt += `Date: ${request.context.date}\n`;
    }
    
    if (request.context?.existingDescription) {
      prompt += `Description: ${request.context.existingDescription}\n`;
    }
    
    prompt += '\nGenerate 3-4 romantic, meaningful detail phrases (3-6 words each) that capture special moments or aspects of this memory.';
    
    return prompt;
  }

  private buildEnhancementUserPrompt(request: MemorySuggestionRequest): string {
    const textType = request.type === 'title' ? 'title' : request.type === 'detail' ? 'detail' : 'description';
    let prompt = `Enhance this memory ${textType}:\n\n`;
    
    prompt += `Current ${textType}: "${request.currentText}"\n\n`;
    
    if (request.context?.date) {
      prompt += `Date: ${request.context.date}\n`;
    }
    
    if (request.type === 'title' && request.context?.existingDescription) {
      prompt += `Context: ${request.context.existingDescription}\n`;
    }
    
    if (request.type === 'description' && request.context?.existingTitle) {
      prompt += `Title: ${request.context.existingTitle}\n`;
    }

    if (request.type === 'detail' && request.context?.existingTitle) {
      prompt += `Title: ${request.context.existingTitle}\n`;
    }
    
    if (request.type === 'title') {
      prompt += '\nCreate 3-4 enhanced versions that are more romantic and beautiful while keeping the original meaning.';
    } else if (request.type === 'detail') {
      prompt += '\nCreate 3-4 enhanced detail phrases (3-6 words each) that are more romantic and meaningful while keeping the original essence.';
    } else {
      prompt += '\nEnhance this description to be more romantic, detailed, and emotionally resonant while keeping the original story. Keep it concise (50-80 words).';
    }
    
    return prompt;
  }

  private parseSuggestions(response: string): string[] {
    // Split by newlines and clean up
    const lines = response.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove numbering, bullets, or quotes
        return line.replace(/^\d+\.?\s*/, '')
                  .replace(/^[-•*]\s*/, '')
                  .replace(/^["']/g, '')
                  .replace(/["']$/g, '')
                  .trim();
      })
      .filter(line => line.length > 0);
    
    // Return first 4 suggestions
    return lines.slice(0, 4);
  }
}

// Export singleton instance
export const aiSuggestionsService = new AISuggestionsService();

// Export utility functions
export const suggestionUtils = {
  // Test if AI service is working
  async testConnection(): Promise<boolean> {
    try {
      const response = await aiSuggestionsService.generateTitleSuggestions({
        type: 'title',
        currentText: 'Test memory'
      });
      return response.success;
    } catch {
      return false;
    }
  }
};

export default AISuggestionsService;
