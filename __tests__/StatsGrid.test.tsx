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

    // The average and max should have out-of-range color
    const avgElement = screen.getAllByText('200')[0].closest('p');
    expect(avgElement?.className).toContain('text-rose-accent');
  });

  it('applies red color for low average (hypoglycemia)', () => {
    const stats: Stats = {
      count: 1,
      average: 55,
      min: 55,
      max: 55,
      inRangePercent: 0,
    };

    render(<StatsGrid stats={stats} />);

    const avgElement = screen.getAllByText('55')[0].closest('p');
    expect(avgElement?.className).toContain('text-rose-accent');
  });

  it('applies red color for low min (hypoglycemia)', () => {
    const stats: Stats = {
      count: 2,
      average: 100,
      min: 60,
      max: 140,
      inRangePercent: 50,
    };

    render(<StatsGrid stats={stats} />);

    const minElement = screen.getByText('60').closest('p');
    expect(minElement?.className).toContain('text-rose-accent');
  });
});
