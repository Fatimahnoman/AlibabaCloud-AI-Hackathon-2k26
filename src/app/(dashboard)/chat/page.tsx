'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatEmpty from '@/components/chat/ChatEmpty';
import ChatSettings from '@/components/chat/ChatSettings';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessageAt?: string;
  isArchived?: boolean;
  createdAt?: string;
}

interface Settings {
  easyMode: boolean;
  autoRead: boolean;
  language: string;
  chatHistory: boolean;
  memoryEnabled: boolean;
  messageFontSize: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    easyMode: false,
    autoRead: false,
    language: 'auto',
    chatHistory: true,
    memoryEnabled: true,
    messageFontSize: 'normal',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const available = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setVoiceAvailable(available);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const s = data.data.settings;
        setSettings({
          easyMode: s.easyMode,
          autoRead: s.autoRead,
          language: s.language,
          chatHistory: s.chatHistory,
          memoryEnabled: s.memoryEnabled,
          messageFontSize: s.messageFontSize || 'normal',
        });
      }
    } catch {
      // Use defaults
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('accessToken');
      const [activeRes, archivedRes] = await Promise.all([
        fetch('/api/chat/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/chat/conversations?archived=true', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const activeData = await activeRes.json();
      const archivedData = await archivedRes.json();
      if (activeData.success) setConversations(activeData.data.conversations);
      if (archivedData.success) setArchivedConversations(archivedData.data.conversations);
    } catch {
      // Silently fail
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages.map((m: Message) => ({
          ...m,
          createdAt: m.createdAt || new Date().toISOString(),
        })));
        setHasMoreMessages(data.data.messages.length >= 50);
      }
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages]);

  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container || !activeConversationId || isLoadingMore || !hasMoreMessages) return;

    if (container.scrollTop < 50) {
      setIsLoadingMore(true);
      try {
        const token = localStorage.getItem('accessToken');
        const oldestMessage = messages[0];
        if (!oldestMessage) {
          setIsLoadingMore(false);
          return;
        }

        const res = await fetch(
          `/api/chat/messages?conversationId=${activeConversationId}&page=2&limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success && data.data.messages.length > 0) {
          setMessages((prev) => [...data.data.messages.reverse(), ...prev]);
          setHasMoreMessages(data.data.messages.length >= 50);
        } else {
          setHasMoreMessages(false);
        }
      } catch {
        // Ignore
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [activeConversationId, messages, isLoadingMore, hasMoreMessages]);

  const handleNewChat = async () => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
  };

  const handleSendMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
    setError(null);

    let convId = activeConversationId;

    if (!convId) {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: 'New Chat' }),
        });
        const data = await res.json();
        if (data.success) {
          convId = data.data.conversation.id;
          setActiveConversationId(convId);
          setConversations((prev) => [
            { id: convId!, title: data.data.conversation.title },
            ...prev,
          ]);
        } else {
          setError('Failed to create conversation');
          return;
        }
      } catch {
        setError('Failed to create conversation');
        return;
      }
    }

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsStreaming(true);
    const assistantId = `streaming-${Date.now()}`;
    let streamedContent = '';

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
    ]);

    try {
      const token = localStorage.getItem('accessToken');
      abortControllerRef.current = new AbortController();

      const metadata: Record<string, unknown> = {};
      if (type === 'voice') metadata.voiceTranscription = true;

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId: convId, content, messageType: type, metadata }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'chunk' && event.content) {
                streamedContent += event.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: streamedContent } : m
                  )
                );
              } else if (event.type === 'done' && event.messageId) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, id: event.messageId } : m
                  )
                );
              } else if (event.type === 'error') {
                throw new Error(event.error);
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      }

      fetchConversations();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;

      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      const errMsg = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errMsg);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setError(null);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/chat/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setArchivedConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch {
      // Silently fail
    }
  };

  const handleArchiveConversation = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/chat/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      fetchConversations();
    } catch {
      // Silently fail
    }
  };

  const handleRenameConversation = async (id: string, title: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/chat/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
    } catch {
      // Silently fail
    }
  };

  const handleRegenerate = async (_messageId: string) => {
    if (!activeConversationId) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/chat/${activeConversationId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchMessages(activeConversationId);
      }
    } catch {
      // Silently fail
    }
  };

  const handleListen = async (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.language === 'urdu' ? 'ur-PK' : settings.language === 'roman_urdu' ? 'en-US' : 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setError('Voice input not available in this browser');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionAPI = (window as unknown as Record<string, unknown>).SpeechRecognition
      || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('Voice recognition not supported in this browser');
      return;
    }
    // eslint-disable-next-line
    const recognition = new (SpeechRecognitionAPI as any)();
    recognition.lang = settings.language === 'urdu' ? 'ur-PK' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
      const text = event.results[0]?.[0]?.transcript;
      if (text) {
        handleSendMessage(text, 'voice');
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setError('Voice recognition failed. Please try again or type your message.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    setIsRecording(true);
    recognition.start();
  };

  const handleDeleteAllChats = async () => {
    if (!confirm('This will delete all your saved conversations. This action cannot be easily undone. Are you sure?')) {
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/chat/delete-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations([]);
        setArchivedConversations([]);
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch {
      // Silently fail
    }
  };

  const handleExport = async () => {
    if (!activeConversationId) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/chat/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId: activeConversationId }),
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([data.data.export], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${activeConversationId.slice(0, 8)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Silently fail
    }
  };

  const fontSizeClass = settings.messageFontSize === 'large' ? 'text-lg' : settings.messageFontSize === 'small' ? 'text-xs' : '';

  return (
    <div className={`flex h-[calc(100vh-3rem)] -m-6 ${fontSizeClass}`}>
      <ChatSidebar
        conversations={conversations}
        archivedConversations={archivedConversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        onArchive={handleArchiveConversation}
        onRename={handleRenameConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSettings={() => setSettingsOpen(true)}
        onDeleteAll={handleDeleteAllChats}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg hover:bg-white/5 ${settings.easyMode ? 'p-3' : ''}`}
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-300 flex-1 truncate">
            {activeConversationId
              ? conversations.find((c) => c.id === activeConversationId)?.title || 'Chat'
              : 'New Chat'}
          </span>
          {activeConversationId && (
            <div className="flex gap-1">
              <button
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-500"
                title="Export chat"
                aria-label="Export conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {activeConversationId && (
          <div className="hidden md:flex items-center justify-between px-4 py-1.5 border-b border-white/10 bg-white/5">
            <div className="text-sm font-medium text-gray-300 truncate">
              {conversations.find((c) => c.id === activeConversationId)?.title || 'Chat'}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleExport}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-400 text-xs flex items-center gap-1"
                title="Export chat"
                aria-label="Export conversation"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        )}

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {messages.length === 0 && !error ? (
            <ChatEmpty onSendMessage={handleSendMessage} easyMode={settings.easyMode} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6">
              {isLoadingMore && (
                <div className="text-center py-2">
                  <div className="inline-block w-5 h-5 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  id={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.createdAt}
                  isStreaming={isStreaming && msg.role === 'assistant' && msg.id.startsWith('streaming-') && !msg.content}
                  onRegenerate={msg.role === 'assistant' && !msg.id.startsWith('streaming-') ? handleRegenerate : undefined}
                  onListen={msg.role === 'assistant' && !msg.id.startsWith('streaming-') ? handleListen : undefined}
                  easyMode={settings.easyMode}
                />
              ))}
              {error && (
                <div className="flex justify-center my-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300 max-w-md">
                    <p className="font-medium mb-1">Error</p>
                    <p>{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput
          onSend={handleSendMessage}
          isStreaming={isStreaming}
          onStop={handleStop}
          easyMode={settings.easyMode}
          onVoiceInput={voiceAvailable ? handleVoiceInput : undefined}
          isRecording={isRecording}
          voiceAvailable={voiceAvailable}
        />
      </div>

      <ChatSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
