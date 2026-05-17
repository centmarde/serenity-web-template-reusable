import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface NullaChatRequest {
  message: string;
}

export interface NullaChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

class NullaChatService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!this.apiKey) {
      console.error("AI API key is missing from environment variables");
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateReply(request: NullaChatRequest): Promise<NullaChatResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "AI service is not properly configured",
      };
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: this.buildSystemPrompt() },
          { role: "user", content: this.buildUserPrompt(request.message) },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 120,
        top_p: 0.9,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content?.trim();

      if (!response) {
        return {
          success: false,
          error: "No reply generated from AI service",
        };
      }

      return { success: true, reply: response };
    } catch (error) {
      console.error("Error generating Nulla reply:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate reply",
      };
    }
  }

  private buildSystemPrompt(): string {
    return "You are Nulla, a sweet, playful companion. Keep replies concise, warm, and supportive (1-2 sentences).";
  }

  private buildUserPrompt(message: string): string {
    return `User says: "${message}"\nReply as Nulla.`;
  }
}

export const nullaChatService = new NullaChatService();
