'use client';

import { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolOrDynamicToolUIPart } from 'ai';
import { HeartPulse, Activity, Utensils, BookOpen } from 'lucide-react';
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

  // Use a ref to avoid stale closure in onFinish capturing an old refresh
  const refreshRef = useRef(dashboard.refresh);
  useEffect(() => { refreshRef.current = dashboard.refresh; }, [dashboard.refresh]);

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onFinish: (result) => {
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
              <div className="flex flex-col items-center gap-4 animate-scale-in">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-light to-amber-light flex items-center justify-center">
                    <HeartPulse className="size-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-amber flex items-center justify-center shadow-sm">
                    <Activity className="size-3.5 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="font-display font-bold text-xl tracking-tight text-foreground">
                    Welcome to DiaVela
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-1.5 max-w-xs">
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
            <div className="flex gap-1.5 text-muted-foreground">
              <Activity className="size-3.5" />
              <Utensils className="size-3.5" />
              <BookOpen className="size-3.5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Try asking</span>
          </div>
          <Suggestions>
            {SUGGESTED_PROMPTS.map(prompt => (
              <Suggestion key={prompt} suggestion={prompt} onClick={handleSuggestion} />
            ))}
          </Suggestions>
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
