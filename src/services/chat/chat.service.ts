import prisma from '@/lib/prisma';
import { aiService } from '@/services/ai';
import type { Conversation, ConversationMessage, CreateConversationRequest, SendMessageRequest } from '@/types';
import type { AIMessage } from '@/services/ai/types';
import { contextManager } from './context-manager';
import { memoryService } from './memory.service';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export class ChatService {
  async createConversation(userId: string, data: CreateConversationRequest): Promise<Conversation> {
    const title = data.firstMessage
      ? await aiService.generateTitle(data.firstMessage)
      : data.title || 'New Chat';

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title,
        status: 'active',
      },
    });

    if (data.firstMessage) {
      await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          userId,
          role: 'user',
          content: data.firstMessage,
          messageType: 'text',
        },
      });

      try {
        const aiResponse = await aiService.generateResponse(
          [{ role: 'user', content: data.firstMessage }],
          { userId, conversationId: conversation.id }
        );

        await prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            userId,
            role: 'assistant',
            content: aiResponse.content,
            messageType: 'text',
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });

        const settings = await prisma.userSettings.findUnique({ where: { userId } });
        if (settings?.memoryEnabled) {
          await memoryService.extractAndStoreFacts(userId, data.firstMessage);
        }
      } catch {
        // AI failure — user message is saved, conversation exists
      }
    }

    return this.formatConversation(conversation);
  }

  async getConversations(
    userId: string,
    options?: { page?: number; limit?: number; archived?: boolean }
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, options?.limit || DEFAULT_PAGE_SIZE));
    const archived = options?.archived ?? false;

    const where = {
      userId,
      deletedAt: null,
      isArchived: archived,
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.conversation.count({ where }),
    ]);

    return {
      conversations: conversations.map((c) => this.formatConversation(c)),
      total,
    };
  }

  async getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
        deletedAt: null,
      },
    });

    return conversation ? this.formatConversation(conversation) : null;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    options?: { page?: number; limit?: number; direction?: 'asc' | 'desc' }
  ): Promise<{ messages: ConversationMessage[]; total: number }> {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, deletedAt: null },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, options?.limit || 50));
    const direction = options?.direction || 'asc';

    const [messages, total] = await Promise.all([
      prisma.conversationMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: direction },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.conversationMessage.count({ where: { conversationId } }),
    ]);

    return {
      messages: messages.map((m) => this.formatMessage(m)),
      total,
    };
  }

  async sendMessage(
    userId: string,
    data: SendMessageRequest,
    onChunk?: (chunk: { content: string; done: boolean }) => void
  ): Promise<ConversationMessage> {
    const conversation = await prisma.conversation.findFirst({
      where: { id: data.conversationId, userId, deletedAt: null },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const settings = await prisma.userSettings.findUnique({ where: { userId } });

    await prisma.conversationMessage.create({
      data: {
        conversationId: data.conversationId,
        userId,
        role: 'user',
        content: data.content,
        messageType: data.messageType || 'text',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageAt: new Date() },
    });

    if (settings?.memoryEnabled) {
      await memoryService.extractAndStoreFacts(userId, data.content);
    }

    const { messages: contextMessages, chatContext } = await contextManager.buildContext({
      userId,
      conversationId: data.conversationId,
      includeMemory: settings?.memoryEnabled ?? true,
    });

    contextMessages.push({ role: 'user', content: data.content });

    let aiContent: string;

    if (onChunk) {
      let fullContent = '';
      const stream = aiService.streamResponse(contextMessages, chatContext);
      for await (const chunk of stream) {
        fullContent += chunk.content;
        onChunk({ content: chunk.content, done: chunk.done });
      }
      aiContent = fullContent;
    } else {
      const response = await aiService.generateResponse(contextMessages, chatContext);
      aiContent = response.content;
    }

    const assistantMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: data.conversationId,
        userId,
        role: 'assistant',
        content: aiContent,
        messageType: 'text',
      },
    });

    if (await contextManager.shouldSummarize(data.conversationId)) {
      await contextManager.generateSummary(data.conversationId);
    }

    return this.formatMessage(assistantMessage);
  }

  async regenerateMessage(
    userId: string,
    messageId: string
  ): Promise<ConversationMessage> {
    const message = await prisma.conversationMessage.findFirst({
      where: { id: messageId, userId, role: 'assistant' },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: message.conversationId, userId, deletedAt: null },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await prisma.conversationMessage.delete({ where: { id: messageId } });

    const recentMessages = await prisma.conversationMessage.findMany({
      where: { conversationId: message.conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: { role: true, content: true },
    });

    const aiMessages: AIMessage[] = recentMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { select: { educationLevel: true, occupation: true } } },
    });

    const context = {
      userId,
      conversationId: message.conversationId,
      userProfile: userProfile
        ? {
            educationLevel: userProfile.profile?.educationLevel || undefined,
            occupation: userProfile.profile?.occupation || undefined,
            country: userProfile.country || undefined,
            preferredLanguage: userProfile.preferredLanguage,
          }
        : undefined,
    };

    const response = await aiService.generateResponse(aiMessages, context);

    const newMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: message.conversationId,
        userId,
        role: 'assistant',
        content: response.content,
        messageType: 'text',
      },
    });

    return this.formatMessage(newMessage);
  }

  async regenerateLastAssistant(
    conversationId: string,
    userId: string
  ): Promise<ConversationMessage> {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, deletedAt: null },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const lastAssistant = await prisma.conversationMessage.findFirst({
      where: { conversationId, userId, role: 'assistant' },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastAssistant) {
      throw new Error('Message not found');
    }

    return this.regenerateMessage(userId, lastAssistant.id);
  }

  async updateConversation(
    conversationId: string,
    userId: string,
    data: { title?: string; status?: string }
  ): Promise<Conversation> {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, deletedAt: null },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) {
      const sanitized = data.title.replace(/[<>&"']/g, '').trim();
      updateData.title = sanitized.slice(0, 200);
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    return this.formatConversation(updated);
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, deletedAt: null },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedAt: new Date(), status: 'deleted' },
    });
  }

  async archiveConversation(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, deletedAt: null },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { isArchived: !conversation.isArchived },
    });

    return this.formatConversation(updated);
  }

  async searchConversations(userId: string, query: string): Promise<Conversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { title: { contains: query } },
          {
            messages: {
              some: { content: { contains: query } },
            },
          },
        ],
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      take: 20,
    });

    return conversations.map((c) => this.formatConversation(c));
  }

  async exportConversation(
    conversationId: string,
    userId: string,
    format: 'txt' = 'txt'
  ): Promise<string> {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, deletedAt: null },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true, createdAt: true },
    });

    const lines: string[] = [];
    lines.push(`Title: ${conversation.title || 'Untitled'}`);
    lines.push(`Date: ${conversation.createdAt.toLocaleDateString()}`);
    lines.push('---');
    lines.push('');

    for (const msg of messages) {
      const role = msg.role === 'user' ? 'You' : 'EduGuard AI';
      const time = msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lines.push(`[${time}] ${role}:`);
      lines.push(msg.content);
      lines.push('');
    }

    if (format === 'txt') {
      return lines.join('\n');
    }

    return lines.join('\n');
  }

  async getConversationSummary(conversationId: string): Promise<string | null> {
    const summary = await prisma.conversationSummary.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });

    return summary?.summaryText || null;
  }

  private formatConversation(c: Record<string, unknown>): Conversation {
    return {
      id: c.id as string,
      userId: c.userId as string,
      title: (c.title as string) || 'New Chat',
      status: c.status as Conversation['status'],
      isArchived: c.isArchived as boolean,
      createdAt: c.createdAt as Date,
      updatedAt: c.updatedAt as Date,
      lastMessageAt: (c.lastMessageAt as Date) || undefined,
      deletedAt: (c.deletedAt as Date) || undefined,
    };
  }

  private formatMessage(m: Record<string, unknown>): ConversationMessage {
    return {
      id: m.id as string,
      conversationId: m.conversationId as string,
      userId: m.userId as string,
      role: m.role as ConversationMessage['role'],
      content: m.content as string,
      messageType: m.messageType as ConversationMessage['messageType'],
      metadata: m.metadata ? JSON.parse(m.metadata as string) : undefined,
      createdAt: m.createdAt as Date,
    };
  }
}

export const chatService = new ChatService();
