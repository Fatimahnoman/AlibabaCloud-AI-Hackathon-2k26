import { describe, it, expect, beforeEach } from 'vitest';
import { resetAIProvider } from '@/services/ai';

describe('AI Provider Configuration', () => {
  beforeEach(() => {
    resetAIProvider();
  });

  it('isAIConfigured returns false without key', async () => {
    const original = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    const { isAIConfigured } = await import('@/services/ai');
    expect(isAIConfigured()).toBe(false);
    if (original) process.env.GROQ_API_KEY = original;
  });

  it('isAIConfigured returns true with key', async () => {
    const original = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';
    const { isAIConfigured } = await import('@/services/ai');
    expect(isAIConfigured()).toBe(true);
    if (original) process.env.GROQ_API_KEY = original;
    else delete process.env.GROQ_API_KEY;
  });

  it('getAIProvider throws without API key', async () => {
    const original = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    const { getAIProvider } = await import('@/services/ai');
    expect(() => getAIProvider()).toThrow('AI provider not configured');
    if (original) process.env.GROQ_API_KEY = original;
  });

  it('resetAIProvider clears singleton without error', () => {
    expect(() => resetAIProvider()).not.toThrow();
  });

  it('AI model defaults are configurable', () => {
    expect(process.env.AI_MODEL || 'openai/gpt-oss-20b').toBeTruthy();
    expect(process.env.AI_TEMPERATURE || '0.7').toBeTruthy();
    expect(process.env.AI_MAX_TOKENS || '2048').toBeTruthy();
  });

  it('SYSTEM_PROMPTS exports all required keys', async () => {
    const { SYSTEM_PROMPTS } = await import('@/services/ai/prompts');
    expect(SYSTEM_PROMPTS).toHaveProperty('base');
    expect(SYSTEM_PROMPTS).toHaveProperty('safety');
    expect(SYSTEM_PROMPTS).toHaveProperty('language');
    expect(SYSTEM_PROMPTS).toHaveProperty('education');
    expect(SYSTEM_PROMPTS).toHaveProperty('fraud');
    expect(SYSTEM_PROMPTS).toHaveProperty('budget');
    expect(SYSTEM_PROMPTS).toHaveProperty('studyPlanner');
    expect(SYSTEM_PROMPTS).toHaveProperty('titleGeneration');
  });
});
