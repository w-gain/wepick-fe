import { Outlet, useLocation } from 'react-router-dom';

import { dataMode } from './enableMocking';
import { BottomNav } from '../shared/ui';

export function AppLayout() {
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/picks/') || location.pathname === '/profile/edit';

  return (
    <div className="app-viewport">
      <main className="app-shell">
        {import.meta.env.DEV && dataMode === 'mock' && (
          <span className="mock-mode-badge">MOCK</span>
        )}
        <Outlet />
        {!isDetail && <BottomNav />}
      </main>
    </div>
  );
}
