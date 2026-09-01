'use client';

import { useState, useEffect } from 'react';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  language: string;
  chatHistory: boolean;
  memoryEnabled: boolean;
  autoRead: boolean;
  voiceTranscriptionStorage: boolean;
  easyMode: boolean;
  messageFontSize: string;
}

const defaultSettings: Settings = {
  language: 'auto',
  chatHistory: true,
  memoryEnabled: true,
  autoRead: false,
  voiceTranscriptionStorage: false,
  easyMode: false,
  messageFontSize: 'normal',
};

export default function ChatSettings({ isOpen, onClose }: ChatSettingsProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadMemories();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data.settings);
      }
    } catch {
      // Use defaults
    }
  };

  const loadMemories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/memory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMemories(data.data.memories);
      }
    } catch {
      // Ignore
    }
  };

  const updateSetting = async (key: string, value: unknown) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data.settings);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (key: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/memory?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemories((prev) => prev.filter((m) => m.key !== key));
    } catch {
      // Ignore
    }
  };

  const deleteAllMemory = async () => {
    if (!confirm('Delete all saved memories? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/memory', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemories([]);
    } catch {
      // Ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-label="Chat settings">
      <div className="bg-[#0f172a] rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
          <h2 className="text-lg font-semibold gradient-text">Chat Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1e293b] text-gray-500"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-100 mb-3">Language</h3>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-[#334155] rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
              aria-label="Language preference"
            >
              <option value="auto">Auto-detect</option>
              <option value="english">English</option>
              <option value="roman_urdu">Roman Urdu</option>
              <option value="urdu">Urdu</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-100 mb-3">Display</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer" htmlFor="easy-mode-toggle">
                <input
                  id="easy-mode-toggle"
                  type="checkbox"
                  checked={settings.easyMode}
                  onChange={(e) => updateSetting('easyMode', e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm text-gray-300">Easy Mode</span>
                  <p className="text-xs text-gray-400">Large buttons, simple language, voice support</p>
                </div>
              </label>

              <div>
                <label className="text-sm text-gray-300 block mb-1" htmlFor="font-size-select">Message Size</label>
                <select
                  id="font-size-select"
                  value={settings.messageFontSize}
                  onChange={(e) => updateSetting('messageFontSize', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-[#334155] rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-100 mb-3">Chat</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer" htmlFor="chat-history-toggle">
                <input
                  id="chat-history-toggle"
                  type="checkbox"
                  checked={settings.chatHistory}
                  onChange={(e) => updateSetting('chatHistory', e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm text-gray-300">Chat History</span>
                  <p className="text-xs text-gray-400">Save conversations for future access</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer" htmlFor="memory-toggle">
                <input
                  id="memory-toggle"
                  type="checkbox"
                  checked={settings.memoryEnabled}
                  onChange={(e) => updateSetting('memoryEnabled', e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm text-gray-300">Memory</span>
                  <p className="text-xs text-gray-400">Remember facts across conversations</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-100 mb-3">Voice</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer" htmlFor="auto-read-toggle">
                <input
                  id="auto-read-toggle"
                  type="checkbox"
                  checked={settings.autoRead}
                  onChange={(e) => updateSetting('autoRead', e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm text-gray-300">Auto Read Responses</span>
                  <p className="text-xs text-gray-400">Automatically read AI responses aloud</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer" htmlFor="voice-storage-toggle">
                <input
                  id="voice-storage-toggle"
                  type="checkbox"
                  checked={settings.voiceTranscriptionStorage}
                  onChange={(e) => updateSetting('voiceTranscriptionStorage', e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm text-gray-300">Voice Transcription Storage</span>
                  <p className="text-xs text-gray-400">Save voice transcriptions</p>
                </div>
              </label>
            </div>
          </div>

          {memories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-100">Saved Memory</h3>
                <button
                  onClick={deleteAllMemory}
                  className="text-xs text-red-500 hover:text-red-700"
                  aria-label="Delete all memory"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {memories.map((m) => (
                  <div key={m.key} className="flex items-center justify-between py-1.5 px-2 bg-[#0b1120] rounded-lg">
                    <div className="text-xs">
                      <span className="font-medium text-gray-300">{m.key}:</span>{' '}
                      <span className="text-gray-500">{m.value}</span>
                    </div>
                    <button
                      onClick={() => deleteMemory(m.key)}
                      className="text-gray-400 hover:text-red-500 p-0.5"
                      aria-label={`Delete memory: ${m.key}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#1e293b]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
