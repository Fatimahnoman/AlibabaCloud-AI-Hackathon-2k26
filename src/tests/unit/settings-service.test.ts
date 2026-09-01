import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from '@/services/chat/settings.service';

vi.mock('@/lib/prisma', () => {
  const mock = {
    userSettings: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    conversation: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    conversationMessage: {
      deleteMany: vi.fn(),
    },
    conversationSummary: {
      deleteMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SettingsService();
  });

  describe('getSettings', () => {
    it('returns existing settings', async () => {
      const settings = { id: '1', userId: 'u1', language: 'urdu', chatHistory: true, memoryEnabled: true, autoRead: false, voiceTranscriptionStorage: false, easyMode: false, theme: 'light', messageFontSize: 'normal', createdAt: new Date(), updatedAt: new Date() };
      mockedPrisma.userSettings.findUnique.mockResolvedValue(settings);

      const result = await service.getSettings('u1');
      expect(result).toEqual(settings);
    });

    it('creates default settings when none exist', async () => {
      const created = { id: '1', userId: 'u1', language: 'auto', chatHistory: true, memoryEnabled: true, autoRead: false, voiceTranscriptionStorage: false, easyMode: false, theme: 'light', messageFontSize: 'normal', createdAt: new Date(), updatedAt: new Date() };
      mockedPrisma.userSettings.findUnique.mockResolvedValue(null);
      mockedPrisma.userSettings.create.mockResolvedValue(created);

      const result = await service.getSettings('u1');
      expect(result.language).toBe('auto');
      expect(result.chatHistory).toBe(true);
      expect(result.memoryEnabled).toBe(true);
      expect(result.easyMode).toBe(false);
      expect(mockedPrisma.userSettings.create).toHaveBeenCalledWith({
        data: { userId: 'u1', language: 'auto', chatHistory: true, memoryEnabled: true, autoRead: false, voiceTranscriptionStorage: false, easyMode: false, theme: 'light', messageFontSize: 'normal' },
      });
    });
  });

  describe('updateSettings', () => {
    it('updates existing settings', async () => {
      const existing = { id: '1', userId: 'u1' };
      const updated = { ...existing, language: 'urdu', easyMode: true };
      mockedPrisma.userSettings.findUnique.mockResolvedValue(existing as never);
      mockedPrisma.userSettings.update.mockResolvedValue(updated as never);

      const result = await service.updateSettings('u1', { language: 'urdu', easyMode: true });
      expect(mockedPrisma.userSettings.update).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: { language: 'urdu', easyMode: true },
      });
    });

    it('creates settings with merged defaults when none exist', async () => {
      const created = { id: '1', userId: 'u1', language: 'urdu', easyMode: true, chatHistory: true };
      mockedPrisma.userSettings.findUnique.mockResolvedValue(null);
      mockedPrisma.userSettings.create.mockResolvedValue(created as never);

      const result = await service.updateSettings('u1', { language: 'urdu', easyMode: true });
      expect(mockedPrisma.userSettings.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ language: 'urdu', easyMode: true, chatHistory: true }),
      });
    });
  });

  describe('deleteAllChats', () => {
    it('soft-deletes all conversations and their messages', async () => {
      mockedPrisma.conversation.findMany.mockResolvedValue([
        { id: 'c1' },
        { id: 'c2' },
      ]);
      mockedPrisma.conversationMessage.deleteMany.mockResolvedValue({ count: 10 });
      mockedPrisma.conversationSummary.deleteMany.mockResolvedValue({ count: 2 });
      mockedPrisma.conversation.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.deleteAllChats('u1');

      expect(result).toEqual({ deleted: 2 });
      expect(mockedPrisma.conversationMessage.deleteMany).toHaveBeenCalledWith({
        where: { conversationId: { in: ['c1', 'c2'] } },
      });
      expect(mockedPrisma.conversationSummary.deleteMany).toHaveBeenCalledWith({
        where: { conversationId: { in: ['c1', 'c2'] } },
      });
      expect(mockedPrisma.conversation.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: expect.objectContaining({ status: 'deleted' }),
      });
    });

    it('returns 0 deleted when no conversations exist', async () => {
      mockedPrisma.conversation.findMany.mockResolvedValue([]);

      const result = await service.deleteAllChats('u1');
      expect(result).toEqual({ deleted: 0 });
    });
  });
});
