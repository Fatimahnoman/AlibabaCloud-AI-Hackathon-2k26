'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string, type?: 'text' | 'voice') => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  easyMode?: boolean;
  onVoiceInput?: () => void;
  isRecording?: boolean;
  voiceAvailable?: boolean;
}

export default function ChatInput({
  onSend,
  disabled,
  isStreaming,
  onStop,
  easyMode,
  onVoiceInput,
  isRecording,
  voiceAvailable = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed, 'text');
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[#1e293b] bg-[#0f172a] p-3 md:p-4" role="form" aria-label="Message input">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {voiceAvailable && onVoiceInput && (
          <button
            onClick={onVoiceInput}
            disabled={disabled || isStreaming}
            className={`flex-shrink-0 ${easyMode ? 'w-14 h-14' : 'w-10 h-10'} rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-[#1e293b] text-gray-400 hover:bg-[#334155]'
            }`}
            title={isRecording ? 'Stop recording' : 'Voice input'}
            aria-label={isRecording ? 'Stop recording' : 'Voice input'}
          >
            <svg className={`${easyMode ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={easyMode ? 'Message type karein...' : 'Type your message... (Shift+Enter for new line)'}
            disabled={disabled || isStreaming}
            rows={1}
            className={`w-full resize-none rounded-xl border border-[#334155] bg-[#1e293b] text-white placeholder-gray-500 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed max-h-[150px] ${
              easyMode ? 'text-base' : 'text-sm'
            }`}
            aria-label="Type your message"
          />
        </div>

        {isStreaming ? (
          <button
            onClick={onStop}
            className={`flex-shrink-0 ${easyMode ? 'w-14 h-14' : 'w-10 h-10'} rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors`}
            title="Stop generating"
            aria-label="Stop generating response"
          >
            <svg className={`${easyMode ? 'w-5 h-5' : 'w-4 h-4'}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={`flex-shrink-0 ${easyMode ? 'w-14 h-14' : 'w-10 h-10'} rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Send message"
            aria-label="Send message"
          >
            <svg className={`${easyMode ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
