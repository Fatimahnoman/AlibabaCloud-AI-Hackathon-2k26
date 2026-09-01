export type ConversationStatus = 'active' | 'archived' | 'deleted';
export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'voice' | 'image' | 'document' | 'url';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  status: ConversationStatus;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  deletedAt?: Date;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
  messageType: MessageType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ConversationSummary {
  id: string;
  conversationId: string;
  summaryText: string;
  tokenCount: number;
  messageRangeStart: number;
  messageRangeEnd: number;
  createdAt: Date;
}

export interface CreateConversationRequest {
  title?: string;
  firstMessage?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  metadata?: Record<string, unknown>;
}

export interface ChatStreamEvent {
  type: 'message' | 'error' | 'done';
  content?: string;
  messageId?: string;
  error?: string;
}
