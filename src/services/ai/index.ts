import type { AIProvider } from './types';
import { GroqProvider } from './provider';
import { GeminiProvider } from './gemini-provider';
import { OpenRouterProvider } from './openrouter-provider';

export type AIProviderType = 'groq' | 'gemini' | 'openrouter';

let providerInstance: AIProvider | null = null;
let fallbackProviderInstance: AIProvider | null = null;
let secondFallbackProviderInstance: AIProvider | null = null;

/**
 * Returns a singleton instance of the configured AI provider.
 * Defaults to Groq if AI_PROVIDER env var is not set.
 */
export function getAIProvider(): AIProvider {
  if (providerInstance) return providerInstance;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'AI provider not configured. Set GROQ_API_KEY in your environment variables.'
    );
  }

  const provider = process.env.AI_PROVIDER || 'groq';

  switch (provider) {
    case 'groq':
    default:
      providerInstance = new GroqProvider({
        apiKey,
        defaultModel: process.env.AI_MODEL || 'openai/gpt-oss-120b',
      });
  }

  return providerInstance;
}

/**
 * Returns a singleton instance of the fallback AI provider (Gemini).
 * Used when the primary provider fails.
 */
export function getFallbackProvider(): AIProvider | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (fallbackProviderInstance) return fallbackProviderInstance;

  fallbackProviderInstance = new GeminiProvider({
    apiKey: process.env.GEMINI_API_KEY,
    defaultModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  });

  return fallbackProviderInstance;
}

/**
 * Returns a singleton instance of the second fallback AI provider (OpenRouter).
 * Used when both primary and first fallback fail.
 */
export function getSecondFallbackProvider(): AIProvider | null {
  if (!process.env.OPENROUTER_API_KEY) {
    return null;
  }

  if (secondFallbackProviderInstance) return secondFallbackProviderInstance;

  secondFallbackProviderInstance = new OpenRouterProvider({
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultModel: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-70b-instruct',
  });

  return secondFallbackProviderInstance;
}

/**
 * Resets the provider singleton. Useful for testing or switching providers.
 */
export function resetAIProvider(): void {
  providerInstance = null;
  fallbackProviderInstance = null;
  secondFallbackProviderInstance = null;
}

/**
 * Checks if the AI provider is configured.
 */
export function isAIConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export type { AIProvider, AICompletionRequest, AICompletionResponse, AIStreamChunk } from './types';
export { BaseAIProvider, GroqProvider } from './provider';
export { GeminiProvider } from './gemini-provider';
export { OpenRouterProvider } from './openrouter-provider';
export { SYSTEM_PROMPTS, buildContextPrompt, type SystemPromptKey } from './prompts';
export { detectLanguage, type DetectedLanguage, getLanguageLabel } from './language-detection';
export { detectIntent, type ChatIntent, getIntentLabel } from './intent-detection';
export { aiService, AIService, type ChatContext, type AIResponse } from './ai.service';
export { logAIUsage, getUserUsageStats, type LogAIUsageParams } from './usage-tracker';
