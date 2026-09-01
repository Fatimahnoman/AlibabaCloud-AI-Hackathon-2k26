'use client';

import { useState, useMemo } from 'react';

interface ChatMessageProps {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
  onRegenerate?: (messageId: string) => void;
  onListen?: (text: string) => void;
  easyMode?: boolean;
}

function parseContent(text: string): string {
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-[#334155]/60 rounded text-[13px] font-mono">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-[15px] font-bold text-gray-100 mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-[16px] font-bold text-gray-100 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-[17px] font-bold text-gray-100 mt-5 mb-2">$1</h1>');

  // Parse markdown tables into styled HTML tables
  html = html.replace(
    /(?:^|\n)((?:\|.*\|[ \t]*\n)+)/g,
    (_match, tableBlock: string) => {
      const rows = tableBlock.trim().split('\n');
      if (rows.length < 2) return tableBlock;
      // Check if second row is separator (---|---)
      const isSep = /^\|[\s-:|]+\|$/.test(rows[1].trim());
      if (!isSep) {
        // No separator row — convert each pipe-row to a bullet point
        return rows.map((row) => {
          const cells = row.split('|').filter((c) => c.trim() !== '').map((c) => c.trim());
          if (cells.length >= 2) {
            return `\n- **${cells[0]}** — ${cells.slice(1).join(' | ')}`;
          }
          return row;
        }).join('');
      }

      const parseRow = (row: string) =>
        row.split('|').slice(1, -1).map((cell) => cell.trim());

      const headers = parseRow(rows[0]);
      let tableHtml = '<table class="w-full my-3 border-collapse text-[13px]">';
      tableHtml += '<thead><tr>';
      for (const h of headers) {
        tableHtml += `<th class="text-left px-3 py-2 bg-[#1e293b] text-gray-200 font-semibold border border-[#334155] rounded">${h}</th>`;
      }
      tableHtml += '</tr></thead><tbody>';
      for (let i = 2; i < rows.length; i++) {
        const cells = parseRow(rows[i]);
        tableHtml += '<tr>';
        for (const cell of cells) {
          tableHtml += `<td class="px-3 py-1.5 border border-[#334155] text-gray-300">${cell}</td>`;
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';
      return tableHtml;
    }
  );

  // Also handle individual pipe-separated lines (partial table rows)
  html = html.replace(/^(\|.+\|)$/gm, (_match, row: string) => {
    const cells = row.split('|').filter((c: string) => c.trim() !== '').map((c: string) => c.trim());
    if (cells.length >= 2) {
      return `- **${cells[0]}** — ${cells.slice(1).join(' | ')}`;
    }
    return row;
  });

  const lines = html.split('\n');
  const processed: string[] = [];
  let inList: 'ul' | 'ol' | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { processed.push('<ul class="list-disc list-inside space-y-1 my-2 ml-1">'); inList = 'ul'; }
      processed.push(`<li class="text-[14px] leading-relaxed">${trimmed.slice(2)}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) { processed.push('<ol class="list-decimal list-inside space-y-1 my-2 ml-1">'); inList = 'ol'; }
      processed.push(`<li class="text-[14px] leading-relaxed">${trimmed.replace(/^\d+\.\s/, '')}</li>`);
    } else {
      if (inList) { processed.push(inList === 'ol' ? '</ol>' : '</ul>'); inList = null; }
      if (trimmed === '') {
        processed.push('<div class="h-2"></div>');
      } else if (!trimmed.startsWith('<h') && !trimmed.startsWith('<table') && !trimmed.startsWith('</table')) {
        processed.push(`<p class="text-[14px] leading-relaxed">${trimmed}</p>`);
      } else {
        processed.push(trimmed);
      }
    }
  }
  if (inList) processed.push(inList === 'ol' ? '</ol>' : '</ul>');
  return processed.join('');
}

export default function ChatMessage({
  id,
  role,
  content,
  timestamp,
  isStreaming,
  onRegenerate,
  onListen,
  easyMode,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  const parsedHtml = useMemo(() => isUser ? '' : parseContent(content), [content, isUser]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 group`} role="article" aria-label={isUser ? 'Your message' : 'AI response'}>
      <div className={`max-w-[82%] md:max-w-[72%]`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm" aria-hidden="true">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <span className="text-xs font-medium text-cyan-400">EduGuard AI</span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md shadow-sm'
              : 'bg-[#0f172a] text-gray-200 rounded-bl-md border border-gray-100 shadow-sm'
          } ${easyMode ? 'text-[15px]' : 'text-[14px]'}`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words leading-relaxed">{content}</div>
          ) : (
            <div
              className="prose-chat break-words [&_strong]:font-semibold [&_strong]:text-gray-100 [&_em]:italic [&_li]:ml-1 [&_li]:py-0.5"
              dangerouslySetInnerHTML={{ __html: parsedHtml }}
            />
          )}
          {isStreaming && (
            <span className="inline-block w-[3px] h-[16px] bg-blue-400 ml-0.5 animate-pulse rounded-full" aria-label="AI is typing" />
          )}
        </div>

        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {timestamp && (
            <time className="text-[10px] text-cyan-400" dateTime={timestamp}>
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          )}

          {!isUser && !isStreaming && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button onClick={handleCopy} className="p-1 rounded-md hover:bg-[#1e293b] transition-colors text-cyan-400 hover:text-cyan-300" title="Copy" aria-label="Copy message">
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
              </button>

              {onListen && (
                <button onClick={() => onListen(content)} className="p-1 rounded-md hover:bg-[#1e293b] transition-colors text-cyan-400 hover:text-cyan-300" title="Listen" aria-label="Listen to response">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 10a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1h-1a1 1 0 01-1-1v-4zM5.636 15.364A9 9 0 015 12a9 9 0 01.636-3.364" /></svg>
                </button>
              )}

              {onRegenerate && id && (
                <button onClick={() => onRegenerate(id)} className="p-1 rounded-md hover:bg-[#1e293b] transition-colors text-cyan-400 hover:text-cyan-300" title="Regenerate" aria-label="Regenerate response">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
