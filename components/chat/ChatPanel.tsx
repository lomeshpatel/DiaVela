'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolOrDynamicToolUIPart } from 'ai';
import { HeartPulse, Activity, Utensils, BookOpen, Sparkles, AlertCircle, X } from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  PromptInputBody,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';
import ChatMessage from '@/components/chat/ChatMessage';
import { useDashboard } from '@/lib/dashboard-context';

const transport = new DefaultChatTransport({ api: '/api/chat' });

const DATA_MUTATION_TOOLS = new Set(['log_glucose_reading', 'add_medication_reminder']);

const SUGGESTED_PROMPTS = [
  'My blood sugar is 140 mg/dL after lunch',
  'What are normal blood glucose levels?',
  'How many carbs are in 1 cup of oatmeal?',
  'Add metformin 500mg at breakfast as a reminder',
  'Show my glucose trends for the past week',
  'Explain what HbA1c means',
];

export default function ChatPanel() {
  const dashboard = useDashboard();
  const [chatError, setChatError] = useState<string | null>(null);

  // Use a ref to avoid stale closure in onFinish capturing an old refresh
  const refreshRef = useRef(dashboard.refresh);
  useEffect(() => { refreshRef.current = dashboard.refresh; }, [dashboard.refresh]);

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (err) => {
      console.error('[ChatPanel] useChat error:', err);
      setChatError('Something went wrong. Please try again.');
    },
    onFinish: (result) => {
      setChatError(null);
      const parts = result.message.parts ?? [];
      const hasMutation = parts.some(p => {
        if (!isToolOrDynamicToolUIPart(p)) return false;
        const toolName = 'toolName' in p ? p.toolName : p.type.replace(/^tool-/, '');
        return DATA_MUTATION_TOOLS.has(toolName);
      });
      if (hasMutation) refreshRef.current();
    },
  });

  const handleSubmit = (msg: PromptInputMessage) => {
    if (!msg.text.trim()) return;
    sendMessage({ text: msg.text });
  };

  const handleSuggestion = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div className="flex flex-col h-full">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <div className="flex flex-col items-center gap-5 animate-scale-in">
                {/* Vivid icon composition */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal to-teal-vivid flex items-center justify-center shadow-xl shadow-teal/30 animate-pulse-glow">
                    <HeartPulse className="size-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-br from-amber to-amber-vivid flex items-center justify-center shadow-lg shadow-amber/30">
                    <Sparkles className="size-4 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="font-display font-bold text-2xl tracking-tight text-foreground">
                    Welcome to <span className="text-teal">Dia</span><span className="text-amber">Vela</span>
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-2 max-w-sm">
                    Your AI-powered diabetes care assistant. Track glucose, look up nutrition,
                    manage medications, and get evidence-based answers.
                  </p>
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages.length === 0 && (
        <div className="px-4 pb-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex gap-1.5">
              <Activity className="size-3.5 text-teal" />
              <Utensils className="size-3.5 text-amber" />
              <BookOpen className="size-3.5 text-sage" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Try asking</span>
          </div>
          <Suggestions>
            {SUGGESTED_PROMPTS.map(prompt => (
              <Suggestion key={prompt} suggestion={prompt} onClick={handleSuggestion} />
            ))}
          </Suggestions>
        </div>
      )}

      {chatError && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-rose-accent/20 bg-rose-bg/40 px-3 py-2 text-xs text-rose-accent animate-fade-in">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="flex-1">{chatError}</span>
          <button onClick={() => setChatError(null)} className="shrink-0 opacity-60 hover:opacity-100">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="px-4 pb-4 pt-2">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="Ask about glucose levels, nutrition, medications..." />
          </PromptInputBody>
          <PromptInputFooter>
            <span className="text-[11px] text-muted-foreground/70 tracking-wide">
              Educational information only — not medical advice
            </span>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
