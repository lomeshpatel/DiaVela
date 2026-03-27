'use client';

import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import ToolResultRenderer from '@/components/chat/ToolResultRenderer';
import type { ToolUIPart, DynamicToolUIPart } from 'ai';

const TOOL_LABELS: Record<string, string> = {
  log_glucose_reading: 'Log Glucose Reading',
  get_glucose_trends: 'Fetch Glucose Trends',
  search_nutrition: 'Look Up Nutrition Data',
  add_medication_reminder: 'Add Medication Reminder',
  list_medications: 'Fetch Medications',
  search_diabetes_knowledge: 'Search Knowledge Base',
};

type ToolPart = ToolUIPart | DynamicToolUIPart;

export default function ChatToolCall({ part }: { part: ToolPart }) {
  const isDynamic = part.type === 'dynamic-tool';
  const toolName = isDynamic
    ? (part as DynamicToolUIPart).toolName
    : part.type.replace(/^tool-/, '');
  const title = TOOL_LABELS[toolName] ?? toolName;
  const hasOutput = part.state === 'output-available' && part.output != null;

  const headerProps = isDynamic
    ? { type: 'dynamic-tool' as const, state: part.state as DynamicToolUIPart['state'], toolName: (part as DynamicToolUIPart).toolName, title }
    : { type: part.type as ToolUIPart['type'], state: part.state as ToolUIPart['state'], title };

  return (
    <Tool defaultOpen={hasOutput}>
      <ToolHeader {...headerProps} />
      <ToolContent>
        <ToolInput input={part.input} />
        {hasOutput ? (
          <div className="space-y-2">
            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Result</h4>
            <ToolResultRenderer toolName={toolName} output={part.output} />
          </div>
        ) : (
          <ToolOutput output={part.output} errorText={part.errorText} />
        )}
      </ToolContent>
    </Tool>
  );
}
