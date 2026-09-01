import { getAIProvider, getFallbackProvider, getSecondFallbackProvider } from './index';
import { AIMessage, AIStreamChunk } from './types';
import { SYSTEM_PROMPTS, buildContextPrompt } from './prompts';
import { detectLanguage, DetectedLanguage } from './language-detection';
import { detectIntent, ChatIntent } from './intent-detection';
import { logAIUsage, LogAIUsageParams } from './usage-tracker';
import { retrieveEducationContext } from './education-context';
import { detectAgentDomain, getAgentResponse, streamAgentResponse } from './specialized-agents';

const MAX_CONTEXT_MESSAGES = 20;

export interface ChatContext {
  userId?: string;
  conversationId?: string;
  userProfile?: { educationLevel?: string; occupation?: string; country?: string; preferredLanguage?: string };
  conversationSummary?: string;
  additionalMemory?: Record<string, string> | null;
}

export interface AIResponse {
  content: string;
  language: DetectedLanguage;
  intent: ChatIntent;
  model: string;
  tokensUsed: number;
}

export class AIService {
  async generateResponse(
    messages: AIMessage[],
    context: ChatContext = {}
  ): Promise<AIResponse> {
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop();
    const userText = lastUserMsg?.content || '';
    const language = detectLanguage(userText);
    const { intent } = detectIntent(userText);

    const agentDomain = detectAgentDomain(userText);
    const startTime = Date.now();
    const model = process.env.AI_MODEL || 'openai/gpt-oss-20b';

    if (agentDomain) {
      try {
        // Retrieve university-specific context for specialized agents
        const educationData = await retrieveEducationContext(userText, intent);
        
        const content = await getAgentResponse(agentDomain, messages, userText, '', educationData || undefined);
        const durationMs = Date.now() - startTime;

        await this.trackUsage({
          userId: context.userId,
          conversationId: context.conversationId,
          provider: 'groq',
          model,
          intent,
          language,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          durationMs,
          status: 'success',
        });

        return {
          content,
          language,
          intent,
          model,
          tokensUsed: 0,
        };
      } catch {
        // Fall through to regular AI if agent fails
      }
    }

    const systemPrompt = await this.buildSystemPrompt(intent, language, context, userText);
    const trimmedMessages = this.trimContext(messages);

    const provider = getAIProvider();
    const fallbackProvider = getFallbackProvider();
    const secondFallbackProvider = getSecondFallbackProvider();

    try {
      const response = await provider.complete({
        messages: trimmedMessages,
        systemPrompt,
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
      });

      const durationMs = Date.now() - startTime;

      await this.trackUsage({
        userId: context.userId,
        conversationId: context.conversationId,
        provider: provider.name,
        model,
        intent,
        language,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        durationMs,
        status: 'success',
      });

      return {
        content: response.content,
        language,
        intent,
        model: response.model,
        tokensUsed: response.usage.totalTokens,
      };
    } catch (error) {
      // If primary provider fails, try first fallback (Gemini)
      if (fallbackProvider) {
        try {
          const fallbackResponse = await fallbackProvider.complete({
            messages: trimmedMessages,
            systemPrompt,
            temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
            maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
          });

          const durationMs = Date.now() - startTime;

          await this.trackUsage({
            userId: context.userId,
            conversationId: context.conversationId,
            provider: fallbackProvider.name,
            model: fallbackResponse.model,
            intent,
            language,
            promptTokens: fallbackResponse.usage.promptTokens,
            completionTokens: fallbackResponse.usage.completionTokens,
            totalTokens: fallbackResponse.usage.totalTokens,
            durationMs,
            status: 'success',
          });

          return {
            content: fallbackResponse.content,
            language,
            intent,
            model: fallbackResponse.model,
            tokensUsed: fallbackResponse.usage.totalTokens,
          };
        } catch (fallbackError) {
          // If first fallback fails, try second fallback (OpenRouter)
          if (secondFallbackProvider) {
            try {
              const secondFallbackResponse = await secondFallbackProvider.complete({
                messages: trimmedMessages,
                systemPrompt,
                temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
                maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
              });

              const durationMs = Date.now() - startTime;

              await this.trackUsage({
                userId: context.userId,
                conversationId: context.conversationId,
                provider: secondFallbackProvider.name,
                model: secondFallbackResponse.model,
                intent,
                language,
                promptTokens: secondFallbackResponse.usage.promptTokens,
                completionTokens: secondFallbackResponse.usage.completionTokens,
                totalTokens: secondFallbackResponse.usage.totalTokens,
                durationMs,
                status: 'success',
              });

              return {
                content: secondFallbackResponse.content,
                language,
                intent,
                model: secondFallbackResponse.model,
                tokensUsed: secondFallbackResponse.usage.totalTokens,
              };
            } catch (secondFallbackError) {
              // All three providers failed
              const secondFallbackErrorMessage = secondFallbackError instanceof Error ? secondFallbackError.message : 'Unknown error';
              const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
              const durationMs = Date.now() - startTime;
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';

              await this.trackUsage({
                userId: context.userId,
                conversationId: context.conversationId,
                provider: `${provider.name}+${fallbackProvider.name}+${secondFallbackProvider.name}`,
                model,
                intent,
                language,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                durationMs,
                status: 'error',
                errorMessage: `${errorMessage} | Fallback 1: ${fallbackErrorMessage} | Fallback 2: ${secondFallbackErrorMessage}`,
              });

              throw new Error('AI service temporarily unavailable. Please try again.');
            }
          }

          // No second fallback available
          const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
          const durationMs = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          await this.trackUsage({
            userId: context.userId,
            conversationId: context.conversationId,
            provider: `${provider.name}+${fallbackProvider.name}`,
            model,
            intent,
            language,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            durationMs,
            status: 'error',
            errorMessage: `${errorMessage} | Fallback: ${fallbackErrorMessage}`,
          });

          throw new Error('AI service temporarily unavailable. Please try again.');
        }
      }

      // No fallback available
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.trackUsage({
        userId: context.userId,
        conversationId: context.conversationId,
        provider: provider.name,
        model,
        intent,
        language,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        durationMs,
        status: 'error',
        errorMessage,
      });

      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  async *streamResponse(
    messages: AIMessage[],
    context: ChatContext = {}
  ): AsyncGenerator<AIStreamChunk> {
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop();
    const userText = lastUserMsg?.content || '';
    const language = detectLanguage(userText);
    const { intent } = detectIntent(userText);

    const agentDomain = detectAgentDomain(userText);
    const startTime = Date.now();
    const model = process.env.AI_MODEL || 'openai/gpt-oss-20b';
    let totalContent = '';

    if (agentDomain) {
      try {
        // Retrieve university-specific context for specialized agents
        const educationData = await retrieveEducationContext(userText, intent);
        
        const stream = streamAgentResponse(agentDomain, messages, userText, '', educationData || undefined);
        for await (const chunk of stream) {
          totalContent += chunk.content;
          yield chunk;
        }

        const durationMs = Date.now() - startTime;
        await this.trackUsage({
          userId: context.userId,
          conversationId: context.conversationId,
          provider: 'groq',
          model,
          intent,
          language,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          durationMs,
          status: 'success',
        });
        return;
      } catch {
        // Fall through to regular streaming if agent fails
      }
    }

    const systemPrompt = await this.buildSystemPrompt(intent, language, context, userText);
    const trimmedMessages = this.trimContext(messages);

    const provider = getAIProvider();
    const fallbackProvider = getFallbackProvider();
    const secondFallbackProvider = getSecondFallbackProvider();
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const stream = provider.stream({
        messages: trimmedMessages,
        systemPrompt,
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
      });

      for await (const chunk of stream) {
        totalContent += chunk.content;
        yield chunk;
      }

      const durationMs = Date.now() - startTime;

      await this.trackUsage({
        userId: context.userId,
        conversationId: context.conversationId,
        provider: provider.name,
        model,
        intent,
        language,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        durationMs,
        status: 'success',
      });
    } catch (error) {
      // If primary provider fails, try first fallback (Gemini)
      if (fallbackProvider) {
        try {
          const fallbackStream = fallbackProvider.stream({
            messages: trimmedMessages,
            systemPrompt,
            temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
            maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
          });

          // Reset content since we're starting fresh with fallback
          totalContent = '';
          
          for await (const chunk of fallbackStream) {
            totalContent += chunk.content;
            yield chunk;
          }

          const durationMs = Date.now() - startTime;

          await this.trackUsage({
            userId: context.userId,
            conversationId: context.conversationId,
            provider: fallbackProvider.name,
            model: fallbackProvider.name === 'gemini' ? 'gemini-2.0-flash-exp' : model,
            intent,
            language,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            durationMs,
            status: 'success',
          });

          return;
        } catch (fallbackError) {
          // If first fallback fails, try second fallback (OpenRouter)
          if (secondFallbackProvider) {
            try {
              const secondFallbackStream = secondFallbackProvider.stream({
                messages: trimmedMessages,
                systemPrompt,
                temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
                maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
              });

              // Reset content since we're starting fresh with second fallback
              totalContent = '';
              
              for await (const chunk of secondFallbackStream) {
                totalContent += chunk.content;
                yield chunk;
              }

              const durationMs = Date.now() - startTime;

              await this.trackUsage({
                userId: context.userId,
                conversationId: context.conversationId,
                provider: secondFallbackProvider.name,
                model: secondFallbackProvider.name === 'openrouter' ? 'meta-llama/llama-3.1-70b-instruct' : model,
                intent,
                language,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                durationMs,
                status: 'success',
              });

              return;
            } catch (secondFallbackError) {
              // All three providers failed
              const secondFallbackErrorMessage = secondFallbackError instanceof Error ? secondFallbackError.message : 'Unknown error';
              const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
              const durationMs = Date.now() - startTime;
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';

              await this.trackUsage({
                userId: context.userId,
                conversationId: context.conversationId,
                provider: `${provider.name}+${fallbackProvider.name}+${secondFallbackProvider.name}`,
                model,
                intent,
                language,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                durationMs,
                status: 'error',
                errorMessage: `${errorMessage} | Fallback 1: ${fallbackErrorMessage} | Fallback 2: ${secondFallbackErrorMessage}`,
              });

              throw new Error('AI service temporarily unavailable. Please try again.');
            }
          }

          // No second fallback available
          const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
          const durationMs = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          await this.trackUsage({
            userId: context.userId,
            conversationId: context.conversationId,
            provider: `${provider.name}+${fallbackProvider.name}`,
            model,
            intent,
            language,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            durationMs,
            status: 'error',
            errorMessage: `${errorMessage} | Fallback: ${fallbackErrorMessage}`,
          });

          throw new Error('AI service temporarily unavailable. Please try again.');
        }
      }

      // No fallback available
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.trackUsage({
        userId: context.userId,
        conversationId: context.conversationId,
        provider: provider.name,
        model,
        intent,
        language,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        durationMs,
        status: 'error',
        errorMessage,
      });

      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  async generateTitle(message: string): Promise<string> {
    try {
      const provider = getAIProvider();
      const response = await provider.complete({
        messages: [{ role: 'user', content: message }],
        systemPrompt: SYSTEM_PROMPTS.titleGeneration,
        temperature: 0.3,
        maxTokens: 30,
      });

      const title = response.content.trim().replace(/^["']|["']$/g, '');
      return title.length > 0 ? title.slice(0, 60) : this.fallbackTitle(message);
    } catch {
      return this.fallbackTitle(message);
    }
  }

  private async buildSystemPrompt(
    intent: ChatIntent,
    language: DetectedLanguage,
    context: ChatContext,
    userMessage?: string
  ): Promise<string> {
    let domainPrompt: string = SYSTEM_PROMPTS.base;

    switch (intent) {
      case 'scholarship':
      case 'university':
      case 'course':
      case 'admission':
      case 'visa':
      case 'education':
        domainPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.education}`;
        break;
      case 'career':
        domainPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.careerGuidance || SYSTEM_PROMPTS.education}`;
        break;
      case 'fraud':
      case 'url_scan':
      case 'document_scan':
        domainPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.fraud}`;
        break;
      case 'budget':
        domainPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.budget}`;
        break;
      case 'study_plan':
        domainPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.studyPlanner}`;
        break;
    }

    domainPrompt += `\n\n${SYSTEM_PROMPTS.safety}`;
    domainPrompt += `\n\n${SYSTEM_PROMPTS.language}`;

    const profileStr = context.userProfile
      ? [
          context.userProfile.educationLevel && `Education: ${context.userProfile.educationLevel}`,
          context.userProfile.occupation && `Occupation: ${context.userProfile.occupation}`,
          context.userProfile.country && `Country: ${context.userProfile.country}`,
        ]
          .filter(Boolean)
          .join(', ')
      : undefined;

    let additionalContext = context.additionalMemory
      ? Object.entries(context.additionalMemory).map(([k, v]) => `${k}: ${v}`).join(', ')
      : undefined;

    if (userMessage) {
      const educationData = await retrieveEducationContext(userMessage, intent);
      if (educationData) {
        additionalContext = additionalContext ? additionalContext + educationData : educationData;
      }
    }

    return buildContextPrompt(domainPrompt, {
      userLanguage: language !== 'unknown' ? language : undefined,
      conversationSummary: context.conversationSummary,
      userProfile: profileStr,
      additionalContext,
    });
  }

  private trimContext(messages: AIMessage[]): AIMessage[] {
    if (messages.length <= MAX_CONTEXT_MESSAGES) return messages;
    return messages.slice(messages.length - MAX_CONTEXT_MESSAGES);
  }

  private fallbackTitle(message: string): string {
    const cleaned = message.replace(/[^\w\s]/g, '').trim();
    const words = cleaned.split(/\s+/).slice(0, 5);
    return words.join(' ') || 'New Chat';
  }

  private async trackUsage(params: {
    userId?: string;
    conversationId?: string;
    provider: string;
    model: string;
    intent: ChatIntent;
    language: DetectedLanguage;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    durationMs: number;
    status: string;
    errorMessage?: string;
  }): Promise<void> {
    const logParams: LogAIUsageParams = {
      userId: params.userId,
      conversationId: params.conversationId,
      provider: params.provider,
      model: params.model,
      intent: params.intent,
      detectedLanguage: params.language,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      totalTokens: params.totalTokens,
      durationMs: params.durationMs,
      status: params.status,
      errorMessage: params.errorMessage,
    };
    await logAIUsage(logParams);
  }
}

export const aiService = new AIService();
