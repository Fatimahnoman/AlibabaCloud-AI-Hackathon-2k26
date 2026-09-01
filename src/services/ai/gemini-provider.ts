import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIProviderConfig,
  AIMessage,
} from './types';
import { BaseAIProvider } from './provider';

/**
 * Google Gemini AI provider implementation.
 * Uses the Google Generative AI SDK.
 */
export class GeminiProvider extends BaseAIProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;
  private readonly defaultModel: string;

  /** Models available on Gemini. */
  private static readonly AVAILABLE_MODELS = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.defaultModel = config.defaultModel || 'gemini-2.0-flash-exp';
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || this.defaultModel;
    const messages = this.mergeSystemPrompt(request.messages, request.systemPrompt);

    try {
      const genModel = this.client.getGenerativeModel({ model });
      
      // Convert messages to Gemini format
      const contents = this.convertToGeminiFormat(messages);
      
      const result = await genModel.generateContent({
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 2048,
        },
      });

      const response = result.response;
      const content = response.text();

      return {
        content,
        model,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
        },
        finishReason: 'stop',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Gemini complete() failed: ${message}`);
    }
  }

  async *stream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    const model = request.model || this.defaultModel;
    const messages = this.mergeSystemPrompt(request.messages, request.systemPrompt);

    try {
      const genModel = this.client.getGenerativeModel({ model });
      const contents = this.convertToGeminiFormat(messages);

      const result = await genModel.generateContentStream({
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 2048,
        },
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield {
          content: text,
          done: false,
        };
      }

      yield {
        content: '',
        done: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Gemini stream() failed: ${message}`);
    }
  }

  getAvailableModels(): string[] {
    return GeminiProvider.AVAILABLE_MODELS;
  }

  /**
   * Converts OpenAI-style messages to Gemini format.
   */
  private convertToGeminiFormat(messages: AIMessage[]): any[] {
    return messages.map(msg => {
      if (msg.role === 'system') {
        // Gemini doesn't have system role, prepend to first user message
        return null;
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      };
    }).filter(Boolean);
  }
}
