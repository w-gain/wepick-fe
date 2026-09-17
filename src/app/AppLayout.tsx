import { Outlet } from 'react-router-dom';

import { dataMode } from './enableMocking';
import { BottomNav } from '../shared/ui';

export function AppLayout() {
  return (
    <div className="app-viewport">
      <main className="app-shell">
        {import.meta.env.DEV && dataMode === 'mock' && (
          <span className="mock-mode-badge">MOCK</span>
        )}
        <Outlet />
        <BottomNav />
      </main>
    </div>
  );
}
