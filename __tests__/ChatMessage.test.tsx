import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from '@/components/chat/ChatMessage';
import type { UIMessage } from 'ai';

// Mock the AI Elements message components
vi.mock('@/components/ai-elements/message', () => ({
  Message: ({ children, from }: { children: React.ReactNode; from: string }) => (
    <div data-testid="message" data-from={from}>{children}</div>
  ),
  MessageContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="message-content">{children}</div>
  ),
  MessageResponse: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="message-response">{children}</div>
  ),
}));

// Mock ChatToolCall
vi.mock('@/components/chat/ChatToolCall', () => ({
  default: ({ part }: { part: { type: string; state: string } }) => (
    <div data-testid="tool-call" data-type={part.type} data-state={part.state} />
  ),
}));

describe('ChatMessage', () => {
  it('renders user text message', () => {
    const message: UIMessage = {
      id: '1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello world' }],
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByTestId('message')).toHaveAttribute('data-from', 'user');
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders assistant text via MessageResponse', () => {
    const message: UIMessage = {
      id: '2',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Here is your answer' }],
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByTestId('message')).toHaveAttribute('data-from', 'assistant');
    expect(screen.getByTestId('message-response')).toHaveTextContent('Here is your answer');
  });

  it('renders tool call parts', () => {
    const message: UIMessage = {
      id: '3',
      role: 'assistant',
      parts: [
        {
          type: 'tool-log_glucose_reading',
          toolCallId: 'tc1',
          toolName: 'log_glucose_reading',
          state: 'output-available',
          args: { value_mgdl: 120 },
          output: { reading: { id: 1, value_mgdl: 120 } },
        } as unknown as UIMessage['parts'][number],
      ],
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByTestId('tool-call')).toBeInTheDocument();
  });

  it('renders mixed text and tool parts', () => {
    const message: UIMessage = {
      id: '4',
      role: 'assistant',
      parts: [
        {
          type: 'tool-log_glucose_reading',
          toolCallId: 'tc1',
          toolName: 'log_glucose_reading',
          state: 'output-available',
          args: { value_mgdl: 120 },
          output: { reading: { id: 1, value_mgdl: 120 } },
        } as unknown as UIMessage['parts'][number],
        { type: 'text', text: 'I logged your reading.' },
      ],
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByTestId('tool-call')).toBeInTheDocument();
    expect(screen.getByTestId('message-response')).toHaveTextContent('I logged your reading.');
  });

  it('skips empty text parts', () => {
    const message: UIMessage = {
      id: '5',
      role: 'assistant',
      parts: [{ type: 'text', text: '' }],
    };

    render(<ChatMessage message={message} />);

    expect(screen.queryByTestId('message-response')).not.toBeInTheDocument();
  });
});
