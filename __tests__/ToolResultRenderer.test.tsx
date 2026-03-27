import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ToolResultRenderer from '@/components/chat/ToolResultRenderer';

// Mock heavy components
vi.mock('@/components/GlucoseChart', () => ({
  default: ({ readings }: { readings: unknown[] }) => (
    <div data-testid="glucose-chart" data-count={readings.length} />
  ),
}));

vi.mock('@/components/MedicationCard', () => ({
  default: ({ medications }: { medications: unknown[] }) => (
    <div data-testid="medication-card" data-count={medications.length} />
  ),
}));

vi.mock('@/components/ai-elements/message', () => ({
  MessageResponse: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="message-response">{children}</div>
  ),
}));

describe('ToolResultRenderer', () => {
  it('renders GlucoseChart for get_glucose_trends', () => {
    const output = {
      readings: [
        { id: 1, value_mgdl: 120, timestamp: '2024-01-01T12:00:00', notes: null },
        { id: 2, value_mgdl: 85, timestamp: '2024-01-01T08:00:00', notes: null },
      ],
      stats: { count: 2, average: 102.5, min: 85, max: 120, inRangePercent: 100 },
    };

    render(<ToolResultRenderer toolName="get_glucose_trends" output={output} />);

    expect(screen.getByTestId('glucose-chart')).toHaveAttribute('data-count', '2');
    expect(screen.getByText('102.5 mg/dL')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders MedicationCard for list_medications', () => {
    const output = {
      medications: [
        { id: 1, name: 'Metformin', dose: '500mg', schedule_time: 'breakfast', notes: null, created_at: '2024-01-01' },
      ],
    };

    render(<ToolResultRenderer toolName="list_medications" output={output} />);

    expect(screen.getByTestId('medication-card')).toHaveAttribute('data-count', '1');
  });

  it('renders nutrition data for search_nutrition', () => {
    const output = {
      query: 'oatmeal',
      foods: [
        { description: 'Oatmeal, cooked', calories: 158, carbs_g: 27, protein_g: 6, fat_g: 3, fiber_g: 4, sugar_g: 1 },
      ],
    };

    render(<ToolResultRenderer toolName="search_nutrition" output={output} />);

    expect(screen.getByText('Oatmeal, cooked')).toBeInTheDocument();
    expect(screen.getByText(/158 cal/)).toBeInTheDocument();
    expect(screen.getByText(/27g carbs/)).toBeInTheDocument();
  });

  it('renders string output via MessageResponse', () => {
    render(<ToolResultRenderer toolName="search_diabetes_knowledge" output="Some knowledge text" />);

    expect(screen.getByTestId('message-response')).toHaveTextContent('Some knowledge text');
  });

  it('renders JSON fallback for unknown object output', () => {
    render(<ToolResultRenderer toolName="unknown_tool" output={{ foo: 'bar' }} />);

    expect(screen.getByText(/\"foo\"/)).toBeInTheDocument();
    expect(screen.getByText(/\"bar\"/)).toBeInTheDocument();
  });
});
