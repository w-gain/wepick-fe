import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { router } from './app/router';
import { dataMode, enableMocking } from './app/enableMocking';
import { AuthFlowProvider } from './features/auth/AuthFlowProvider';
import { ToastProvider } from './shared/ui';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const root = document.getElementById('root');

if (!root) {
  throw new Error('React root element was not found.');
}

async function bootstrap() {
  await enableMocking();
  const mockAuthStatus =
    new URLSearchParams(window.location.search).get('auth') === 'anonymous'
      ? 'anonymous'
      : 'authenticated';

  createRoot(root as HTMLElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthFlowProvider initialStatus={dataMode === 'mock' ? mockAuthStatus : 'unknown'}>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthFlowProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
