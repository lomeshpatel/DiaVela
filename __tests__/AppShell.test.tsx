import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppShell from '@/components/AppShell';

// Mock child components to isolate AppShell behavior
vi.mock('@/components/AppHeader', () => ({
  default: ({ panelOpen, onTogglePanel }: { panelOpen: boolean; onTogglePanel: () => void }) => (
    <div data-testid="app-header" data-panel-open={panelOpen}>
      <button data-testid="toggle-panel" onClick={onTogglePanel}>Toggle</button>
    </div>
  ),
}));

vi.mock('@/components/dashboard/DashboardPanel', () => ({
  default: () => <div data-testid="dashboard-panel">Dashboard Content</div>,
}));

vi.mock('@/components/chat/ChatPanel', () => ({
  default: () => <div data-testid="chat-panel">Chat Content</div>,
}));

vi.mock('@/lib/dashboard-context', () => ({
  useDashboard: () => ({
    readings: [],
    medications: [],
    stats: { count: 0, average: null, min: null, max: null, inRangePercent: null },
    loading: false,
    days: 7,
    setDays: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('AppShell', () => {
  it('renders header, dashboard panel, and chat panel', () => {
    render(<AppShell />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    // Single instances of each panel (no duplicate rendering)
    expect(screen.getByTestId('dashboard-panel')).toBeInTheDocument();
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });

  it('toggles dashboard panel visibility', () => {
    render(<AppShell />);

    const header = screen.getByTestId('app-header');
    expect(header).toHaveAttribute('data-panel-open', 'true');

    fireEvent.click(screen.getByTestId('toggle-panel'));

    expect(screen.getByTestId('app-header')).toHaveAttribute('data-panel-open', 'false');
  });

  it('renders mobile tab bar with Chat and Dashboard buttons', () => {
    render(<AppShell />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav.textContent).toContain('Chat');
    expect(nav.textContent).toContain('Dashboard');
  });

  it('switches mobile tabs on click', () => {
    render(<AppShell />);

    const nav = screen.getByRole('navigation');
    const buttons = nav.querySelectorAll('button');
    const chatBtn = buttons[0];
    const dashboardBtn = buttons[1];

    // Initially Chat tab is active
    expect(chatBtn.className).toContain('text-teal');
    expect(dashboardBtn.className).toContain('text-muted-foreground');

    // Click Dashboard tab
    fireEvent.click(dashboardBtn);
    expect(dashboardBtn.className).toContain('text-teal');
    expect(chatBtn.className).toContain('text-muted-foreground');

    // Click Chat tab back
    fireEvent.click(chatBtn);
    expect(chatBtn.className).toContain('text-teal');
  });
});
