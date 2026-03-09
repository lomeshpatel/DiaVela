'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isTextUIPart, isToolOrDynamicToolUIPart, UIMessage } from 'ai';
import { Button } from '@/components/ui/button';

const TOOL_LABELS: Record<string, string> = {
  log_glucose_reading: '📊 Logging glucose reading',
  get_glucose_trends: '📈 Fetching glucose trends',
  search_nutrition: '🥗 Looking up nutrition data',
  add_medication_reminder: '💊 Adding medication reminder',
  list_medications: '💊 Fetching medications',
  search_diabetes_knowledge: '🔍 Searching knowledge base',
};

const SUGGESTED_PROMPTS = [
  'My blood sugar is 140 mg/dL after lunch',
  'What are normal blood glucose levels?',
  'How many carbs are in 1 cup of oatmeal?',
  'Add metformin 500mg at breakfast as a reminder',
  'Show my glucose trends for the past week',
  'Explain what HbA1c means',
];

const transport = new DefaultChatTransport({ api: '/api/chat' });

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: '0',
    role: 'assistant',
    parts: [{
      type: 'text',
      text: "Hello! I'm DiaVela, your AI diabetes care assistant. 👋\n\nI can help you with:\n• 📊 Logging and tracking blood glucose readings\n• 🥗 Looking up nutrition and carb information\n• 💊 Managing medication reminders\n• 📚 Answering diabetes education questions\n\nWhat can I help you with today?",
    }],
  },
];

type AnyToolPart = { type: string; toolName?: string; state?: string };

function ToolCallBadge({ part }: { part: AnyToolPart }) {
  // type is 'tool-<toolName>' for static tools, or 'dynamic-tool' with toolName field
  const toolName = part.toolName ?? part.type.replace(/^tool-/, '');
  const label = TOOL_LABELS[toolName] ?? `🔧 ${toolName}`;
  const isRunning = part.state === 'input-streaming' || part.state === 'input-available';
  const isError = part.state === 'output-error';

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 my-1">
      {isRunning && <span className="animate-spin">⏳</span>}
      {!isRunning && !isError && <span>✅</span>}
      {isError && <span>❌</span>}
      <span>{label}{isRunning ? '...' : ''}</span>
    </div>
  );
}

export default function ChatInterface() {
  const { messages, sendMessage, status } = useChat({ transport, messages: INITIAL_MESSAGES });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  function submit() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map(message => {
          const isUser = message.role === 'user';
          const parts = message.parts ?? [];

          return (
            <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold mr-2 shrink-0 mt-1">
                  D
                </div>
              )}
              <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                {parts.map((part, i) => {
                  if (isToolOrDynamicToolUIPart(part)) {
                    return <ToolCallBadge key={i} part={part as AnyToolPart} />;
                  }
                  if (isTextUIPart(part) && part.text) {
                    return (
                      <div
                        key={i}
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{part.text}</div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold ml-2 shrink-0 mt-1">
                  U
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold mr-2">
              D
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setInput(''); sendMessage({ text: prompt }); }}
                className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about glucose levels, nutrition, medications..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-gray-50 placeholder:text-gray-400 max-h-32"
            style={{ lineHeight: '1.5' }}
            disabled={isLoading}
          />
          <Button
            onClick={submit}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 h-auto"
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          DiaVela provides educational info only — always consult your healthcare provider
        </p>
      </div>
    </div>
  );
}
