import prisma from '@/lib/prisma';
import type { AIMessage } from '@/services/ai/types';
import { aiService } from '@/services/ai';
import type { ChatContext } from '@/services/ai/ai.service';

const MAX_RECENT_MESSAGES = 10;
const SUMMARY_THRESHOLD = 20;

export interface ContextBuildOptions {
  userId: string;
  conversationId: string;
  includeMemory?: boolean;
  maxMessages?: number;
}

export class ContextManager {
  async buildContext(options: ContextBuildOptions): Promise<{
    messages: AIMessage[];
    chatContext: ChatContext;
  }> {
    const { userId, conversationId, includeMemory = true } = options;

    const recentMessages = await this.getRecentMessages(conversationId, MAX_RECENT_MESSAGES);
    const summary = await this.getConversationSummary(conversationId);
    const facts = await this.getConversationFacts(conversationId);
    const userMemory = includeMemory ? await this.getUserMemory(userId) : null;
    const userProfile = await this.getUserProfile(userId);

    const contextMessages = this.buildMessageArray(recentMessages, summary, facts);

    const chatContext: ChatContext = {
      userId,
      conversationId,
      conversationSummary: this.formatSummary(summary, facts),
      userProfile: userProfile || undefined,
    };

    if (userMemory) {
      chatContext.additionalMemory = userMemory;
    }

    try {
      const { studentAssistantService } = await import('@/services/student-assistant/student-assistant.service');
      const lastUserMessage = recentMessages.filter((m) => m.role === 'user').pop();
      if (lastUserMessage) {
        const assistantContext = await studentAssistantService.buildAssistantContext(userId, lastUserMessage.content);
        if (assistantContext.privacyFilteredContext) {
          const existingMemory = chatContext.additionalMemory
            ? Object.entries(chatContext.additionalMemory)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            : '';
          chatContext.additionalMemory = {
            studentAssistant: existingMemory
              ? `${existingMemory}\n\n${assistantContext.privacyFilteredContext}`
              : assistantContext.privacyFilteredContext,
          };
        }
      }
    } catch {
      // Gracefully degrade if student assistant is unavailable
    }

    return { messages: contextMessages, chatContext };
  }

  private async getRecentMessages(conversationId: string, limit: number) {
    return prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { role: true, content: true, createdAt: true },
    });
  }

  private async getConversationSummary(conversationId: string) {
    return prisma.conversationSummary.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      select: { summaryText: true, importantFacts: true },
    });
  }

  private async getConversationFacts(conversationId: string) {
    const summary = await this.getConversationSummary(conversationId);
    if (!summary?.importantFacts) return null;
    try {
      return JSON.parse(summary.importantFacts) as Record<string, string>;
    } catch {
      return null;
    }
  }

  private async getUserMemory(userId: string) {
    const memories = await prisma.userMemory.findMany({
      where: { userId },
      select: { key: true, value: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    if (memories.length === 0) return null;

    const memoryObj: Record<string, string> = {};
    for (const m of memories) {
      memoryObj[m.key] = m.value;
    }
    return memoryObj;
  }

  private async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            educationLevel: true,
            occupation: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      educationLevel: user.profile?.educationLevel || undefined,
      occupation: user.profile?.occupation || undefined,
      country: user.country || undefined,
      preferredLanguage: user.preferredLanguage,
    };
  }

  private buildMessageArray(
    recentMessages: Array<{ role: string; content: string; createdAt: Date }>,
    summary: { summaryText: string; importantFacts?: string | null } | null,
    facts: Record<string, string> | null
  ): AIMessage[] {
    const messages: AIMessage[] = [];

    if (summary || facts) {
      const contextParts: string[] = [];
      if (summary?.summaryText) {
        contextParts.push(`Previous conversation summary: ${summary.summaryText}`);
      }
      if (facts) {
        const factStr = Object.entries(facts)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        contextParts.push(`Known facts: ${factStr}`);
      }
      messages.push({
        role: 'system',
        content: contextParts.join('\n\n'),
      });
    }

    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }

    return messages;
  }

  private formatSummary(
    summary: { summaryText: string } | null,
    facts: Record<string, string> | null
  ): string | undefined {
    const parts: string[] = [];
    if (summary?.summaryText) parts.push(summary.summaryText);
    if (facts) {
      const factStr = Object.entries(facts)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
      parts.push(`Known facts: ${factStr}`);
    }
    return parts.length > 0 ? parts.join('\n') : undefined;
  }

  async shouldSummarize(conversationId: string): Promise<boolean> {
    const count = await prisma.conversationMessage.count({
      where: { conversationId },
    });
    return count >= SUMMARY_THRESHOLD;
  }

  async generateSummary(conversationId: string): Promise<void> {
    const messages = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });

    if (messages.length < 5) return;

    const messageText = messages
      .slice(-30)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    try {
      const response = await aiService.generateResponse(
        [{ role: 'user', content: `Summarize this conversation in 2-3 sentences, extracting key facts:\n\n${messageText}` }],
        {}
      );

      const factsMatch = response.content.match(/facts?:?\s*(.*)/i);

      await prisma.conversationSummary.create({
        data: {
          conversationId,
          summaryText: response.content.slice(0, 1000),
          importantFacts: factsMatch ? JSON.stringify(this.extractFacts(response.content)) : null,
          tokenCount: Math.ceil(response.content.length / 4),
          messageRangeStart: Math.max(0, messages.length - 30),
          messageRangeEnd: messages.length,
        },
      });
    } catch {
      // Summary generation failure is non-critical
    }
  }

  private extractFacts(summaryText: string): Record<string, string> {
    const facts: Record<string, string> = {};
    const patterns = [
      { key: 'education_level', pattern: /education[:\s]+([^\n,.]+)/i },
      { key: 'field', pattern: /field[:\s]+([^\n,.]+)/i },
      { key: 'country', pattern: /country[:\s]+([^\n,.]+)/i },
      { key: 'grades', pattern: /grades?[:\s]+([^\n,.]+)/i },
      { key: 'career_goal', pattern: /career[:\s]+([^\n,.]+)/i },
      { key: 'budget', pattern: /budget[:\s]+([^\n,.]+)/i },
      { key: 'language_preference', pattern: /language[:\s]+([^\n,.]+)/i },
    ];

    for (const { key, pattern } of patterns) {
      const match = summaryText.match(pattern);
      if (match) facts[key] = match[1].trim();
    }

    return facts;
  }
}

export const contextManager = new ContextManager();
