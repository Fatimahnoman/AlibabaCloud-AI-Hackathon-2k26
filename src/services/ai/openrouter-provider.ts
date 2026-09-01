import OpenAI from 'openai';
import {
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIProviderConfig,
} from './types';
import { BaseAIProvider } from './provider';

/**
 * OpenRouter AI provider implementation.
 * Uses the OpenAI-compatible OpenRouter API.
 */
export class OpenRouterProvider extends BaseAIProvider {
  readonly name = 'openrouter';
  private client: OpenAI;
  private readonly defaultModel: string;

  /** Models available on OpenRouter. */
  private static readonly AVAILABLE_MODELS = [
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
    'mistralai/mistral-large-2',
    'mistralai/mistral-medium',
    'google/gemini-2.0-flash-exp:free',
    'anthropic/claude-3.5-sonnet',
  ];

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    this.defaultModel = config.defaultModel || 'meta-llama/llama-3.1-70b-instruct';
  }

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
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OpenRouter complete() failed: ${message}`);
    }
  }

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
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OpenRouter stream() failed: ${message}`);
    }
  }

  getAvailableModels(): string[] {
    return OpenRouterProvider.AVAILABLE_MODELS;
  }
}
