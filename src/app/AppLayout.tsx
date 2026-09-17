import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="app-viewport">
      <main className="app-shell">
        <Outlet />
      </main>
    </div>
  );
}
