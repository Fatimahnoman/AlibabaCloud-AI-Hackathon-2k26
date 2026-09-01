'use client';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_PREFIX = 'eduguard_conversations_';

function getKey(department: string): string {
  return `${STORAGE_PREFIX}${department}`;
}

export function getAllConversations(department: string): Conversation[] {
  try {
    const raw = localStorage.getItem(getKey(department));
    if (!raw) return [];
    const convos: Conversation[] = JSON.parse(raw);
    return convos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export function getConversation(department: string, id: string): Conversation | null {
  const convos = getAllConversations(department);
  return convos.find((c) => c.id === id) || null;
}

export function getActiveConversationId(department: string): string | null {
  try {
    return localStorage.getItem(`${getKey(department)}_active`);
  } catch {
    return null;
  }
}

export function setActiveConversationId(department: string, id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(`${getKey(department)}_active`, id);
    } else {
      localStorage.removeItem(`${getKey(department)}_active`);
    }
  } catch {}
}

export function createConversation(department: string, title?: string): Conversation {
  const convos = getAllConversations(department);
  const now = new Date().toISOString();
  const conv: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title || `Chat ${convos.length + 1}`,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  convos.unshift(conv);
  saveConversations(department, convos);
  setActiveConversationId(department, conv.id);
  return conv;
}

export function updateConversation(department: string, id: string, updates: Partial<Pick<Conversation, 'messages' | 'title'>>): void {
  const convos = getAllConversations(department);
  const idx = convos.findIndex((c) => c.id === id);
  if (idx === -1) return;

  if (updates.messages) {
    convos[idx].messages = updates.messages;
  }
  if (updates.title) {
    convos[idx].title = updates.title;
  }
  convos[idx].updatedAt = new Date().toISOString();

  if (updates.messages && updates.messages.length > 0 && !updates.title) {
    const lastUserMsg = [...updates.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      convos[idx].title = lastUserMsg.content.slice(0, 50) + (lastUserMsg.content.length > 50 ? '...' : '');
    }
  }

  saveConversations(department, convos);
}

export function deleteConversation(department: string, id: string): void {
  const convos = getAllConversations(department);
  const filtered = convos.filter((c) => c.id !== id);
  saveConversations(department, filtered);
  if (getActiveConversationId(department) === id) {
    setActiveConversationId(department, filtered[0]?.id || null);
  }
}

export function deleteAllConversations(department: string): void {
  localStorage.removeItem(getKey(department));
  localStorage.removeItem(`${getKey(department)}_active`);
}

function saveConversations(department: string, convos: Conversation[]): void {
  try {
    localStorage.setItem(getKey(department), JSON.stringify(convos));
  } catch {}
}
