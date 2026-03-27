'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolOrDynamicToolUIPart } from 'ai';
import type { UIMessage } from 'ai';
import { HeartPulse } from 'lucide-react';
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
            <ConversationEmptyState
              icon={<HeartPulse className="size-12" />}
              title="Welcome to DiaVela"
              description="I can help you track glucose, look up nutrition, manage medications, and answer diabetes questions."
            />
          ) : (
            messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages.length === 0 && (
        <div className="px-4 pb-2">
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
            <span className="text-xs text-muted-foreground">
              DiaVela provides educational info only
            </span>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
