import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextManager } from '@/services/chat/context-manager';

vi.mock('@/lib/prisma', () => {
  const mock = {
    conversationMessage: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    conversationSummary: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    userMemory: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('ContextManager', () => {
  let manager: ContextManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ContextManager();
  });

  describe('buildContext', () => {
    it('returns recent messages in correct order', async () => {
      mockedPrisma.conversationMessage.findMany.mockResolvedValue([
        { role: 'assistant', content: 'Hello!', createdAt: new Date('2024-01-02') },
        { role: 'user', content: 'Hi there', createdAt: new Date('2024-01-01') },
      ]);
      mockedPrisma.conversationSummary.findFirst.mockResolvedValue(null);
      mockedPrisma.userMemory.findMany.mockResolvedValue([]);
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await manager.buildContext({
        userId: 'u1',
        conversationId: 'c1',
      });

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].content).toBe('Hi there');
      expect(result.messages[1].content).toBe('Hello!');
    });

    it('includes summary as system message when available', async () => {
      mockedPrisma.conversationMessage.findMany.mockResolvedValue([
        { role: 'user', content: 'Hello', createdAt: new Date() },
      ]);
      mockedPrisma.conversationSummary.findFirst.mockResolvedValue({
        summaryText: 'User is from Pakistan',
        importantFacts: null,
      });
      mockedPrisma.userMemory.findMany.mockResolvedValue([]);
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await manager.buildContext({
        userId: 'u1',
        conversationId: 'c1',
      });

      expect(result.messages[0].role).toBe('system');
      expect(result.messages[0].content).toContain('User is from Pakistan');
    });

    it('includes facts in summary when available', async () => {
      mockedPrisma.conversationMessage.findMany.mockResolvedValue([
        { role: 'user', content: 'Hello', createdAt: new Date() },
      ]);
      mockedPrisma.conversationSummary.findFirst.mockResolvedValue({
        summaryText: 'Discussion about education',
        importantFacts: JSON.stringify({ education_level: 'bachelors', field: 'CS' }),
      });
      mockedPrisma.userMemory.findMany.mockResolvedValue([]);
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await manager.buildContext({
        userId: 'u1',
        conversationId: 'c1',
      });

      expect(result.messages[0].content).toContain('education_level: bachelors');
      expect(result.messages[0].content).toContain('field: CS');
    });

    it('includes user memory when enabled', async () => {
      mockedPrisma.conversationMessage.findMany.mockResolvedValue([]);
      mockedPrisma.conversationSummary.findFirst.mockResolvedValue(null);
      mockedPrisma.userMemory.findMany.mockResolvedValue([
        { key: 'country', value: 'Pakistan' },
      ]);
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await manager.buildContext({
        userId: 'u1',
        conversationId: 'c1',
        includeMemory: true,
      });

      expect(result.chatContext.additionalMemory).toEqual({ country: 'Pakistan' });
    });

    it('excludes user memory when disabled', async () => {
      mockedPrisma.conversationMessage.findMany.mockResolvedValue([]);
      mockedPrisma.conversationSummary.findFirst.mockResolvedValue(null);
      mockedPrisma.userMemory.findMany.mockResolvedValue([]);
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await manager.buildContext({
        userId: 'u1',
        conversationId: 'c1',
        includeMemory: false,
      });

      expect(result.chatContext.additionalMemory).toBeUndefined();
    });

    it('includes user profile when available', async () => {
      mockedPrisma.conversationMessage.findMany.mockResolvedValue([]);
      mockedPrisma.conversationSummary.findFirst.mockResolvedValue(null);
      mockedPrisma.userMemory.findMany.mockResolvedValue([]);
      mockedPrisma.user.findUnique.mockResolvedValue({
        country: 'Pakistan',
        preferredLanguage: 'urdu',
        profile: { educationLevel: 'bachelors', occupation: 'student' },
      });

      const result = await manager.buildContext({
        userId: 'u1',
        conversationId: 'c1',
      });

      expect(result.chatContext.userProfile).toEqual({
        educationLevel: 'bachelors',
        occupation: 'student',
        country: 'Pakistan',
        preferredLanguage: 'urdu',
      });
    });

    it('sets undefined userProfile when user not found', async () => {
      mockedPrisma.conversationMessage.findMany.mockResolvedValue([]);
      mockedPrisma.conversationSummary.findFirst.mockResolvedValue(null);
      mockedPrisma.userMemory.findMany.mockResolvedValue([]);
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await manager.buildContext({
        userId: 'u1',
        conversationId: 'c1',
      });

      expect(result.chatContext.userProfile).toBeUndefined();
    });
  });

  describe('shouldSummarize', () => {
    it('returns true when message count >= 20', async () => {
      mockedPrisma.conversationMessage.count.mockResolvedValue(25);
      expect(await manager.shouldSummarize('c1')).toBe(true);
    });

    it('returns false when message count < 20', async () => {
      mockedPrisma.conversationMessage.count.mockResolvedValue(10);
      expect(await manager.shouldSummarize('c1')).toBe(false);
    });
  });

  describe('generateSummary', () => {
    it('does nothing when messages < 5', async () => {
      mockedPrisma.conversationMessage.findMany.mockResolvedValue([
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' },
      ]);

      await manager.generateSummary('c1');
      expect(mockedPrisma.conversationSummary.create).not.toHaveBeenCalled();
    });
  });
});
