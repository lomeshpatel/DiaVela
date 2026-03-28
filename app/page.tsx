import { DashboardProvider } from '@/lib/dashboard-context';
import AppShell from '@/components/AppShell';

export default function Home() {
  return (
    <DashboardProvider>
      <AppShell />
    </DashboardProvider>
  );
}
