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
    'gemini-3.6-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.defaultModel = config.defaultModel || 'gemini-3.6-flash';
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
   * Gemini doesn't have a system role, so system messages are prepended
   * to the first user message to preserve critical context.
   */
  private convertToGeminiFormat(messages: AIMessage[]): any[] {
    // Collect all system content to prepend to the first user message
    const systemParts: string[] = [];
    const nonSystemMessages: AIMessage[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemParts.push(msg.content);
      } else {
        nonSystemMessages.push(msg);
      }
    }

    const systemPrefix = systemParts.join('\n\n');

    const converted = nonSystemMessages.map((msg, index) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      let text = msg.content;

      // Prepend system content to the first user message
      if (role === 'user' && systemPrefix && index === this.findFirstUserIndex(nonSystemMessages)) {
        text = systemPrefix + '\n\n' + text;
      }

      return {
        role,
        parts: [{ text }],
      };
    });

    // If no user messages exist but we have system content, add it as a user message
    if (converted.length === 0 && systemPrefix) {
      converted.push({
        role: 'user',
        parts: [{ text: systemPrefix }],
      });
    }

    return converted;
  }

  /**
   * Finds the index of the first user message in the array.
   */
  private findFirstUserIndex(messages: AIMessage[]): number {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user') return i;
    }
    return 0;
  }
}
