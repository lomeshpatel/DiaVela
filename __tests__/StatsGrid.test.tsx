import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsGrid from '@/components/dashboard/StatsGrid';
import type { Stats } from '@/lib/dashboard-context';

describe('StatsGrid', () => {
  it('renders stats with values', () => {
    const stats: Stats = {
      count: 5,
      average: 125.3,
      min: 80,
      max: 190,
      inRangePercent: 80,
    };

    render(<StatsGrid stats={stats} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('125.3')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('190')).toBeInTheDocument();
  });

  it('renders em dashes for null values', () => {
    const stats: Stats = {
      count: 0,
      average: null,
      min: null,
      max: null,
      inRangePercent: null,
    };

    render(<StatsGrid stats={stats} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    // 3 null values should render em dashes
    const dashes = screen.getAllByText('\u2014');
    expect(dashes.length).toBe(3);
  });

  it('applies red color for out-of-range average', () => {
    const stats: Stats = {
      count: 1,
      average: 200,
      min: 200,
      max: 200,
      inRangePercent: 0,
    };

    render(<StatsGrid stats={stats} />);

    // The average and max should have red text
    const avgElement = screen.getAllByText('200')[0].closest('p');
    expect(avgElement?.className).toContain('text-red-600');
  });
});
