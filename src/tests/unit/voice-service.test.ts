import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BrowserSTTProvider,
  BrowserTTSProvider,
  getSTTProvider,
  getTTSProvider,
} from '@/services/voice/voice.service';

describe('BrowserSTTProvider', () => {
  let provider: BrowserSTTProvider;

  beforeEach(() => {
    provider = new BrowserSTTProvider();
  });

  it('has browser as provider name', () => {
    expect(provider.name).toBe('browser');
  });

  it('isAvailable returns false in non-browser environment', () => {
    expect(provider.isAvailable()).toBe(false);
  });

  it('stop does not throw when no recognition active', () => {
    expect(() => provider.stop()).not.toThrow();
  });

  it('transcribe rejects when not available', async () => {
    const blob = new Blob(['test'], { type: 'audio/wav' });
    await expect(provider.transcribe(blob)).rejects.toThrow('Speech recognition not supported');
  });
});

describe('BrowserTTSProvider', () => {
  let provider: BrowserTTSProvider;

  beforeEach(() => {
    provider = new BrowserTTSProvider();
  });

  it('has browser as provider name', () => {
    expect(provider.name).toBe('browser');
  });

  it('isAvailable returns false in non-browser environment', () => {
    expect(provider.isAvailable()).toBe(false);
  });

  it('synthesize rejects when not available', async () => {
    await expect(provider.synthesize('Hello')).rejects.toThrow('Speech synthesis not supported');
  });
});

describe('Voice Provider Singletons', () => {
  it('getSTTProvider returns singleton', () => {
    const p1 = getSTTProvider();
    const p2 = getSTTProvider();
    expect(p1).toBe(p2);
  });

  it('getTTSProvider returns singleton', () => {
    const p1 = getTTSProvider();
    const p2 = getTTSProvider();
    expect(p1).toBe(p2);
  });
});
