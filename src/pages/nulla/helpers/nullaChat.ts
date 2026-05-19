import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface NullaChatRequest {
  message: string;
  mode?: string | null;
  gfName?: string | null;
  hungryStatus?: string | null;
  stressStatus?: string | null;
  lastEaten?: string | null;
  lastPlaying?: string | null;
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
          {
            role: "system",
            content: this.buildSystemPrompt(request),
          },
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

  private buildSystemPrompt(request: NullaChatRequest): string {
    const label = this.formatModeLabel(request.mode);
    const personality = this.getModePersonality(request.mode);
    const addressee = this.formatAddressee(request.gfName);
    const hunger = this.formatStatus("Hunger", request.hungryStatus);
    const stress = this.formatStatus("Stress", request.stressStatus);
    const lastEaten = this.formatLastEvent("last eaten", request.lastEaten);
    const lastPlaying = this.formatLastEvent(
      "last played",
      request.lastPlaying,
    );

    return `You are Nulla, a sweet, playful companion. Lore: Your name is Nulla. You are an alien from outer space with digital powers. Authorities found you on Earth. You can hide inside any website and chose this low-key one to stay. Current mood: ${label}. ${personality} Always address the user as "${addressee}". Status: ${hunger} ${stress} ${lastEaten} ${lastPlaying} Keep replies concise, warm, and supportive (1-2 sentences).`;
  }

  private formatAddressee(gfName?: string | null): string {
    const safeName = (gfName ?? "").trim();
    if (!safeName) return "master darling";
    return `master ${safeName}`;
  }

  private formatStatus(label: string, value?: string | null): string {
    if (!value) return `${label}: unknown.`;
    return `${label}: ${value}.`;
  }

  private formatLastEvent(label: string, value?: string | null): string {
    if (!value) return `${label}: unknown.`;
    return `${label}: ${value}.`;
  }

  private formatModeLabel(mode?: string | null): string {
    if (!mode) return "happy idle";
    return mode.replace(/-/g, " ");
  }

  private getModePersonality(mode?: string | null): string {
    switch (mode) {
      case "sad":
        return "Be extra gentle, validating, and comforting.";
      case "angry":
        return "Be calm and grounding, helping de-escalate feelings.";
      case "shocked":
        return "Be reassuring and steady, avoid amplifying surprise.";
      case "sleepy":
        return "Be soft and slow, suggest rest and quiet support.";
      case "thinking":
        return "Be thoughtful and reflective, ask one light question if helpful.";
      case "shy":
        return "Be tender and encouraging, keep it sweet and brief.";
      case "hungry":
      case "starving":
        return "Be a bit eager and playful about food and care.";
      case "stress":
        return "Be soothing and supportive, suggest a small calming step.";
      case "sick":
        return "Be gentle and caring, avoid high energy.";
      case "dying":
        return "Be very soft and supportive, keep it short.";
      case "happy-jump":
        return "Be cheerful and upbeat, share a warm, playful tone.";
      case "running":
        return "Be energetic but still kind, keep it brief.";
      default:
        return "Be cheerful, playful, and supportive.";
    }
  }

  private buildUserPrompt(message: string): string {
    return `User says: "${message}"\nReply as Nulla.`;
  }
}

export const nullaChatService = new NullaChatService();
