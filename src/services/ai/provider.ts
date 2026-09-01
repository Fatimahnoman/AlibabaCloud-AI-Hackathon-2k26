import Groq from 'groq-sdk';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIProviderConfig,
  AIMessage,
} from './types';

/**
 * Abstract base class for AI providers.
 * Provides common functionality and enforces the AIProvider interface.
 */
export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;
  abstract readonly name: string;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  abstract stream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk>;
  abstract getAvailableModels(): string[];

  /**
   * Builds the system prompt by prepending the base EduGuard system prompt
   * to any user-provided system prompt.
   */
  protected buildSystemPrompt(userSystemPrompt?: string): string {
    const base =
      'You are EduGuard AI, a helpful assistant for education guidance, fraud detection, and financial management. Be helpful, accurate, and safety-conscious.';
    return userSystemPrompt ? `${base}\n\n${userSystemPrompt}` : base;
  }

  /**
   * Merges the system prompt with the provided messages.
   */
  protected mergeSystemPrompt(
    messages: AIMessage[],
    systemPrompt?: string
  ): AIMessage[] {
    const systemContent = this.buildSystemPrompt(systemPrompt);
    const merged: AIMessage[] = [{ role: 'system', content: systemContent }];

    for (const msg of messages) {
      if (msg.role === 'system') {
        continue;
      }
      merged.push(msg);
    }

    return merged;
  }
}

/**
 * Groq AI provider implementation.
 * Uses the Groq SDK to interact with Groq-hosted models like LLaMA 3.
 */
export class GroqProvider extends BaseAIProvider {
  readonly name = 'groq';
  private client: Groq;
  private readonly defaultModel: string;

  /** Models available on the Groq platform. */
  private static readonly AVAILABLE_MODELS = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b',
    'qwen/qwen3.8-27b',
    'allam-2-7b',
  ];

  /**
   * Creates a new GroqProvider instance.
   * @param config - Provider configuration containing the API key and optional settings.
   */
  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new Groq({ apiKey: config.apiKey });
    this.defaultModel = config.defaultModel || 'openai/gpt-oss-20b';
  }

  /**
   * Sends a chat completion request and returns the full response.
   * @param request - The completion request with messages and optional parameters.
   * @returns The structured AI completion response.
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || this.defaultModel;
    const messages = this.mergeSystemPrompt(request.messages, request.systemPrompt);

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
      });

      const choice = response.choices[0];

      return {
        content: choice.message?.content || '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason || 'stop',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Groq complete() failed: ${message}`);
    }
  }

  /**
   * Streams a chat completion response as an async generator of chunks.
   * @param request - The completion request with messages and optional parameters.
   * @yields AIStreamChunk objects containing partial content and a done flag.
   */
  async *stream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    const model = request.model || this.defaultModel;
    const messages = this.mergeSystemPrompt(request.messages, request.systemPrompt);

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        const finished = chunk.choices[0]?.finish_reason !== null;

        yield {
          content: delta,
          done: finished,
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Groq stream() failed: ${message}`);
    }
  }

  /**
   * Returns the list of models available on the Groq platform.
   * @returns An array of model identifier strings.
   */
  getAvailableModels(): string[] {
    return [...GroqProvider.AVAILABLE_MODELS];
  }
}
