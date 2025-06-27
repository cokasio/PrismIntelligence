import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from "@google/genai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_OPENAI_MODEL = "gpt-4o";

// The newest Anthropic model is "claude-sonnet-4-20250514", not older 3.x models
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export interface LLMResponse {
  content: string;
  model: string;
  timestamp: Date;
}

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "" 
    });
  }

  async analyze(prompt: string, context?: string): Promise<LLMResponse> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a specialized Income Statement Analyst with expertise in revenue analysis, expense patterns, and profitability metrics. You excel at identifying operational efficiency indicators and understanding property earning capacity. ${context || ""}`
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const response = await this.client.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 2000,
    });

    return {
      content: response.choices[0].message.content || "No response generated",
      model: DEFAULT_OPENAI_MODEL,
      timestamp: new Date()
    };
  }
}

export class AnthropicClient {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY || "",
    });
  }

  async analyze(prompt: string, context?: string): Promise<LLMResponse> {
    const systemPrompt = `You are an expert Balance Sheet Analyst with deep expertise in asset management, capital structure analysis, and financial position assessment. You specialize in evaluating liquidity, solvency, leverage ratios, and overall financial health. ${context || ""}`;

    const message = await this.client.messages.create({
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
      model: DEFAULT_ANTHROPIC_MODEL,
      system: systemPrompt,
      temperature: 0.1,
    });

    return {
      content: message.content[0].type === 'text' ? message.content[0].text : "No response generated",
      model: DEFAULT_ANTHROPIC_MODEL,
      timestamp: new Date()
    };
  }
}

export class GeminiClient {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
    });
  }

  async analyze(prompt: string, context?: string): Promise<LLMResponse> {
    const systemPrompt = `You are a cash flow analysis specialist focused on understanding cash generation, investment patterns, and financing activities. You excel at analyzing free cash flow, capital allocation efficiency, and cash flow sustainability. ${context || ""}`;

    const response = await this.client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: `${systemPrompt}\n\n${prompt}`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 2000,
      }
    });

    return {
      content: response.text || "No response generated",
      model: DEFAULT_GEMINI_MODEL,
      timestamp: new Date()
    };
  }
}

export class DeepSeekClient {
  private baseUrl: string = "https://api.deepseek.com/v1";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY || "";
  }

  async analyze(prompt: string, context?: string): Promise<LLMResponse> {
    const systemPrompt = `You are a strategic financial advisor who synthesizes insights from multiple financial perspectives to provide comprehensive recommendations. You excel at identifying strategic opportunities, assessing risks, and developing actionable plans for financial optimization and growth. ${context || ""}`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices?.[0]?.message?.content || "No response generated",
      model: "deepseek-chat",
      timestamp: new Date()
    };
  }
}

export const llmClients = {
  openai: new OpenAIClient(),
  anthropic: new AnthropicClient(),
  gemini: new GeminiClient(),
  deepseek: new DeepSeekClient(),
};
