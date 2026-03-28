import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReadingsTable from '@/components/dashboard/ReadingsTable';
import type { GlucoseReading } from '@/lib/dashboard-context';

describe('ReadingsTable', () => {
  it('renders nothing for empty readings', () => {
    const { container } = render(<ReadingsTable readings={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders readings with correct status labels', () => {
    const readings: GlucoseReading[] = [
      { id: 1, value_mgdl: 65, timestamp: '2024-01-01T12:00:00Z', notes: null },
      { id: 2, value_mgdl: 110, timestamp: '2024-01-01T08:00:00Z', notes: 'fasting' },
      { id: 3, value_mgdl: 160, timestamp: '2024-01-01T18:00:00Z', notes: null },
      { id: 4, value_mgdl: 250, timestamp: '2024-01-01T20:00:00Z', notes: null },
    ];

    render(<ReadingsTable readings={readings} />);

    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Slightly High')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('fasting')).toBeInTheDocument();
  });

  it('classifies exact boundary 140 as Normal and 141 as Slightly High', () => {
    const readings: GlucoseReading[] = [
      { id: 1, value_mgdl: 140, timestamp: '2024-01-01T10:00:00Z', notes: null },
      { id: 2, value_mgdl: 141, timestamp: '2024-01-01T11:00:00Z', notes: null },
    ];

    render(<ReadingsTable readings={readings} />);

    expect(screen.getAllByText('Normal').length).toBe(1);
    expect(screen.getAllByText('Slightly High').length).toBe(1);
  });

  it('classifies exact boundary 180 as Slightly High and 181 as High', () => {
    const readings: GlucoseReading[] = [
      { id: 1, value_mgdl: 180, timestamp: '2024-01-01T10:00:00Z', notes: null },
      { id: 2, value_mgdl: 181, timestamp: '2024-01-01T11:00:00Z', notes: null },
    ];

    render(<ReadingsTable readings={readings} />);

    expect(screen.getAllByText('Slightly High').length).toBe(1);
    expect(screen.getAllByText('High').length).toBe(1);
  });

  it('limits display to 10 readings', () => {
    const readings: GlucoseReading[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      value_mgdl: 100 + i,
      timestamp: `2024-01-01T${String(i).padStart(2, '0')}:00:00Z`,
      notes: null,
    }));

    render(<ReadingsTable readings={readings} />);

    const rows = screen.getAllByRole('row');
    // 1 header row + 10 data rows
    expect(rows.length).toBe(11);
  });
});
