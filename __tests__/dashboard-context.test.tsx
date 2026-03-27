import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '@/lib/dashboard-context';

const mockReadings = [
  { id: 1, value_mgdl: 120, timestamp: '2024-01-01T12:00:00', notes: null },
  { id: 2, value_mgdl: 85, timestamp: '2024-01-01T08:00:00', notes: 'fasting' },
  { id: 3, value_mgdl: 200, timestamp: '2024-01-01T18:00:00', notes: null },
];

const mockMedications = [
  { id: 1, name: 'Metformin', dose: '500mg', schedule_time: 'breakfast', notes: null, created_at: '2024-01-01' },
];

function mockResponse(data: unknown): Response {
  return { ok: true, json: () => Promise.resolve(data) } as Response;
}

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn((url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    if (urlStr.includes('/api/glucose')) {
      return Promise.resolve(mockResponse({ readings: mockReadings }));
    }
    if (urlStr.includes('/api/medications')) {
      return Promise.resolve(mockResponse({ medications: mockMedications }));
    }
    return Promise.resolve(mockResponse({}));
  }) as unknown as typeof fetch;
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}

describe('DashboardContext', () => {
  it('fetches data on mount and computes stats', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.readings).toEqual(mockReadings);
    expect(result.current.medications).toEqual(mockMedications);
    expect(result.current.stats.count).toBe(3);
    expect(result.current.stats.average).toBe(135);
    expect(result.current.stats.min).toBe(85);
    expect(result.current.stats.max).toBe(200);
    expect(result.current.stats.inRangePercent).toBe(67);
  });

  it('defaults to 7 days', async () => {
    renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/glucose?days=7');
    });
  });

  it('refetches when days change', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setDays(14);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/glucose?days=14');
    });
  });

  it('refresh re-fetches current days', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callCount = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callCount);
    });
  });

  it('computes stats correctly for empty readings', async () => {
    global.fetch = vi.fn((url: string | URL | Request) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes('/api/glucose')) {
        return Promise.resolve(mockResponse({ readings: [] }));
      }
      return Promise.resolve(mockResponse({ medications: [] }));
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats.count).toBe(0);
    expect(result.current.stats.average).toBeNull();
    expect(result.current.stats.min).toBeNull();
    expect(result.current.stats.max).toBeNull();
    expect(result.current.stats.inRangePercent).toBeNull();
  });

  it('throws when useDashboard is used outside provider', () => {
    expect(() => {
      renderHook(() => useDashboard());
    }).toThrow('useDashboard must be used within a DashboardProvider');
  });
});
