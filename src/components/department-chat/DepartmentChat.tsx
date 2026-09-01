'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import {
  getAllConversations,
  getActiveConversationId,
  setActiveConversationId,
  createConversation,
  updateConversation,
  deleteConversation,
  type Conversation,
  type ConversationMessage,
} from '@/lib/conversation-storage';
import { getSTTProvider, getTTSProvider, isVoiceAvailable } from '@/services/voice/voice.service';

interface DepartmentChatProps {
  department: 'fraud' | 'finance' | 'budget' | 'education' | 'scholarships' | 'internships';
  chatId?: string;
  title: string;
  subtitle: string;
  avatar: string;
  avatarColor: string;
  suggestions: string[];
  systemMessage?: string;
  freshStart?: boolean;
  noHistory?: boolean;
  onMessageComplete?: (content: string) => void;
}

const VOICE_PREF_KEY = 'eduguard_voice_prefs';

function detectLanguage(text: string): string {
  const urduPattern = /[\u0600-\u06FF]/;
  if (urduPattern.test(text)) return 'urdu';
  const romanUrduWords = /\b(kya|hai|hain|ka|ke|ki|mein|mera|meri|mujhe|batao|karo|ho|ye|wo|aur|se|ko|nahi|haan|chahiye|kaise|kahan|kab|kyun|waala|wala|pata|samajh|madad|please|bhai|yaar|theek|galat|accha|bura)\b/i;
  if (romanUrduWords.test(text)) return 'roman_urdu';
  return 'english';
}

const TTS_LANG_MAP: Record<string, string> = {
  english: 'en-US',
  urdu: 'ur-PK',
  roman_urdu: 'ur-PK',
};

export default function DepartmentChat({
  department,
  chatId,
  title,
  subtitle,
  avatar,
  avatarColor,
  suggestions,
  systemMessage,
  freshStart,
  noHistory,
  onMessageComplete,
}: DepartmentChatProps) {
  const storageDept = chatId || department;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceSupported] = useState(() => isVoiceAvailable());
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sendMessageRef = useRef<(content: string) => void>(() => {});

  useEffect(() => {
    const convos = getAllConversations(storageDept);
    setConversations(convos);
    if (!freshStart) {
      const activeId = getActiveConversationId(storageDept);
      if (activeId && convos.find((c) => c.id === activeId)) {
        setActiveConvId(activeId);
        setMessages(convos.find((c) => c.id === activeId)!.messages);
      }
    }
  }, [storageDept, freshStart]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOICE_PREF_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        if (typeof prefs.autoRead === 'boolean') setAutoRead(prefs.autoRead);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(VOICE_PREF_KEY, JSON.stringify({ autoRead }));
    } catch {}
  }, [autoRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setShowSidebar(false);
      }
    };
    if (showSidebar) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSidebar]);

  const refreshConversations = useCallback(() => {
    setConversations(getAllConversations(storageDept));
  }, [storageDept]);

  const handleNewChat = useCallback(() => {
    if (!noHistory) {
      const conv = createConversation(storageDept);
      setActiveConvId(conv.id);
      refreshConversations();
    }
    setMessages([]);
    setShowSidebar(false);
  }, [storageDept, refreshConversations, noHistory]);

  const handleSelectChat = useCallback((id: string) => {
    const conv = getAllConversations(storageDept).find((c) => c.id === id);
    if (conv) {
      setActiveConvId(id);
      setActiveConversationId(storageDept, id);
      setMessages(conv.messages);
    }
    setShowSidebar(false);
  }, [storageDept]);

  const handleDeleteChat = useCallback((id: string) => {
    deleteConversation(storageDept, id);
    const convos = getAllConversations(storageDept);
    setConversations(convos);
    if (id === activeConvId) {
      if (convos.length > 0) {
        setActiveConvId(convos[0].id);
        setActiveConversationId(storageDept, convos[0].id);
        setMessages(convos[0].messages);
      } else {
        const conv = createConversation(storageDept);
        setActiveConvId(conv.id);
        setMessages([]);
      }
    }
    refreshConversations();
  }, [activeConvId, storageDept, refreshConversations]);

  const speakText = useCallback(async (text: string) => {
    if (!text.trim()) return;
    try {
      const tts = getTTSProvider();
      if (!tts.isAvailable()) return;
      const lang = detectLanguage(text);
      await tts.synthesize(text, {
        language: TTS_LANG_MAP[lang] || 'ur-PK',
        rate: 0.95,
      });
    } catch {}
  }, []);

  const stopSpeaking = useCallback(() => {
    try {
      const tts = getTTSProvider();
      tts.stop();
    } catch {}
  }, []);

  const startVoiceInput = useCallback(async () => {
    if (isRecording) {
      try {
        const stt = getSTTProvider();
        stt.stop();
      } catch {}
      setIsRecording(false);
      return;
    }

    if (!voiceSupported) {
      setVoiceError('Voice not supported in this browser. Use Chrome or Edge.');
      setTimeout(() => setVoiceError(''), 4000);
      return;
    }

    setVoiceError('');
    setIsRecording(true);

    try {
      const stt = getSTTProvider();

      const result = await stt.transcribe(new Blob(), {
        language: 'en-US',
      });

      if (result.text && result.text.trim()) {
        sendMessageRef.current(result.text);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Voice input failed';
      setVoiceError(msg);
      setTimeout(() => setVoiceError(''), 5000);
    } finally {
      setIsRecording(false);
    }
  }, [isRecording, voiceSupported]);

  const sendMessage = useCallback(async (content: string) => {
    stopSpeaking();

    let convId = activeConvId;
    if (!convId && !noHistory) {
      const conv = createConversation(storageDept);
      convId = conv.id;
      setActiveConvId(convId);
      refreshConversations();
    }

    const userMsg: ConversationMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const assistantMsg: ConversationMessage = {
      id: 'assistant-' + Date.now(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMsg, assistantMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamContent('');

    const chatMessages = [...messages, userMsg].map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      abortRef.current = new AbortController();

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/chat/department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          department,
          messages: chatMessages,
          systemMessage,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error('Request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (!reader) throw new Error('No reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            let event: { type?: string; content?: string; error?: string; messageId?: string };
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue; // skip parse errors
            }

            if (event.type === 'chunk' && event.content) {
              accumulated += event.content;
              setStreamContent(accumulated);
            }

            if (event.type === 'done') {
              const finalContent = accumulated || 'No response generated.';
              const finalMsgs = updatedMessages.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: finalContent, isStreaming: false, id: event.messageId || m.id }
                  : m
              );
              setMessages(finalMsgs);

              if (convId && !noHistory) {
                updateConversation(storageDept, convId, {
                  messages: finalMsgs.filter((m) => m.content),
                });
                refreshConversations();
              }

              if (autoRead && finalContent && finalContent !== 'No response generated.') {
                speakText(finalContent);
              }

              onMessageComplete?.(finalContent);
            }

            if (event.type === 'error') {
              throw new Error(event.error);
            }
          }
        }
      }

      if (accumulated) {
        const finalMsgs = updatedMessages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: accumulated, isStreaming: false }
            : m
        );
        setMessages(finalMsgs);

        if (convId && !noHistory) {
          updateConversation(storageDept, convId, {
            messages: finalMsgs.filter((m) => m.content),
          });
          refreshConversations();
        }

        if (autoRead) {
          speakText(accumulated);
        }
      } else {
        // Stream ended with no content — finalize the message
        const finalMsgs = updatedMessages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: 'Sorry, no response was received. Please try again.', isStreaming: false }
            : m
        );
        setMessages(finalMsgs);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        const finalMsgs = updatedMessages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: streamContent || 'Generation stopped.', isStreaming: false }
            : m
        );
        setMessages(finalMsgs);
        if (convId && !noHistory) {
          updateConversation(storageDept, convId, { messages: finalMsgs.filter((m) => m.content) });
          refreshConversations();
        }
      } else {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[DepartmentChat] Send error:', errMsg);
        const finalMsgs = updatedMessages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: `Sorry, an error occurred: ${errMsg}`, isStreaming: false }
            : m
        );
        setMessages(finalMsgs);
      }
    } finally {
      setIsStreaming(false);
      setStreamContent('');
      abortRef.current = null;
    }
  }, [storageDept, messages, activeConvId, streamContent, autoRead, speakText, stopSpeaking, refreshConversations, department, systemMessage, noHistory]);

  useEffect(() => { sendMessageRef.current = sendMessage; });

  const handleStop = () => {
    abortRef.current?.abort();
    stopSpeaking();
  };

  const handleClear = () => {
    if (activeConvId && !noHistory) {
      updateConversation(storageDept, activeConvId, { messages: [] });
      refreshConversations();
    }
    setMessages([]);
  };

  const handleListen = (text: string) => {
    speakText(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-[#0f172a] rounded-2xl shadow-lg border border-[#1e293b] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0b1120]">
        <div className="flex items-center gap-3">
          {!noHistory && (
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-1.5 rounded-lg hover:bg-[#1e293b] text-gray-500 transition-colors lg:hidden"
              title="Chat history"
              aria-label="Toggle chat history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          {!noHistory && (
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-[#1e293b] text-gray-500 transition-colors"
              title="Chat history"
              aria-label="Toggle chat history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${avatarColor}`}>
            <span className="text-lg">{avatar}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">{title}</h3>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {voiceSupported && (
            <label className="flex items-center gap-1.5 cursor-pointer" title="Auto-read responses">
              <input
                type="checkbox"
                checked={autoRead}
                onChange={(e) => setAutoRead(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 10a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1h-1a1 1 0 01-1-1v-4z" />
              </svg>
            </label>
          )}
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Online</span>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="ml-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
              title="Clear chat"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Conversation Sidebar */}
        {showSidebar && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
            <div
              ref={sidebarRef}
              className="fixed lg:relative z-50 lg:z-auto w-72 h-full bg-[#0b1120] border-r border-[#1e293b] flex flex-col transition-transform lg:translate-x-0"
            >
              <div className="p-3 border-b border-[#1e293b] space-y-2">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">No conversations yet</div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        activeConvId === conv.id
                          ? 'bg-blue-500/10 text-blue-700'
                          : 'hover:bg-[#1e293b] text-gray-300'
                      }`}
                      onClick={() => handleSelectChat(conv.id)}
                    >
                      <svg className="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{conv.title}</p>
                        <p className="text-[10px] text-gray-400">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this chat?')) handleDeleteChat(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#334155] text-gray-400 hover:text-red-500 transition-all"
                        title="Delete chat"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${avatarColor} mb-4`}>
                  <span className="text-3xl">{avatar}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">{subtitle}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="text-left px-4 py-3 rounded-xl border border-[#1e293b] hover:border-[#334155] hover:bg-[#0b1120] transition-all text-sm text-gray-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {voiceSupported && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <button
                      onClick={startVoiceInput}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                      title="Speak to AI"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-400">or click to speak</p>
                  </div>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                isStreaming={msg.isStreaming && isStreaming}
                onListen={msg.role === 'assistant' ? handleListen : undefined}
              />
            ))}

            {isStreaming && streamContent && messages.length > 0 && !messages[messages.length - 1]?.content && (
              <ChatMessage
                role="assistant"
                content={streamContent}
                isStreaming={true}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Recording Indicator */}
          {isRecording && (
            <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/30 flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-300 font-medium">Listening... Speak now</span>
              <div className="flex-1" />
              <button
                onClick={startVoiceInput}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Voice Error */}
          {voiceError && !isRecording && (
            <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30 flex items-center gap-3">
              <span className="text-sm text-amber-300">{voiceError}</span>
            </div>
          )}

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            isStreaming={isStreaming}
            onStop={handleStop}
            onVoiceInput={voiceSupported ? startVoiceInput : undefined}
            isRecording={isRecording}
            voiceAvailable={voiceSupported}
          />
        </div>
      </div>
    </div>
  );
}
