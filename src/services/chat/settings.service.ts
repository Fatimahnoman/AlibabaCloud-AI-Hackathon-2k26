import prisma from '@/lib/prisma';

export interface UserSettingsData {
  language?: string;
  chatHistory?: boolean;
  memoryEnabled?: boolean;
  autoRead?: boolean;
  voiceTranscriptionStorage?: boolean;
  easyMode?: boolean;
  theme?: string;
  messageFontSize?: string;
}

const DEFAULT_SETTINGS = {
  language: 'auto',
  chatHistory: true,
  memoryEnabled: true,
  autoRead: false,
  voiceTranscriptionStorage: false,
  easyMode: false,
  theme: 'light',
  messageFontSize: 'normal',
};

export class SettingsService {
  async getSettings(userId: string) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId, ...DEFAULT_SETTINGS },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, data: UserSettingsData) {
    const existing = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (existing) {
      return prisma.userSettings.update({
        where: { userId },
        data,
      });
    }

    return prisma.userSettings.create({
      data: { userId, ...DEFAULT_SETTINGS, ...data },
    });
  }

  async deleteAllChats(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    await prisma.conversationMessage.deleteMany({
      where: { conversationId: { in: conversationIds } },
    });

    await prisma.conversationSummary.deleteMany({
      where: { conversationId: { in: conversationIds } },
    });

    await prisma.conversation.updateMany({
      where: { userId },
      data: { deletedAt: new Date(), status: 'deleted' },
    });

    return { deleted: conversationIds.length };
  }
}

export const settingsService = new SettingsService();
