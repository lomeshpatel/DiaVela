'use client';

import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import ChatToolCall from '@/components/chat/ChatToolCall';
import { isTextUIPart, isToolOrDynamicToolUIPart } from 'ai';
import type { UIMessage, ToolUIPart, DynamicToolUIPart } from 'ai';

export default function ChatMessage({ message }: { message: UIMessage }) {
  const parts = message.parts ?? [];

  return (
    <Message from={message.role}>
      <MessageContent>
        {parts.map((part, i) => {
          if (isToolOrDynamicToolUIPart(part)) {
            const key = 'toolCallId' in part ? (part as ToolUIPart).toolCallId : i;
            return <ChatToolCall key={key} part={part as ToolUIPart | DynamicToolUIPart} />;
          }
          if (isTextUIPart(part) && part.text) {
            if (message.role === 'user') {
              return (
                <div key={i} className="whitespace-pre-wrap">
                  {part.text}
                </div>
              );
            }
            return <MessageResponse key={i}>{part.text}</MessageResponse>;
          }
          return null;
        })}
      </MessageContent>
    </Message>
  );
}
