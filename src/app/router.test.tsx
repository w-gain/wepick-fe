import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { routes } from './router';
import { ToastProvider } from '../shared/ui';

describe('application routes', () => {
  it('opens a nested screen from a direct URL', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/profile/edit'] });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={testRouter} />
        </ToastProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('renders the route error screen for an unknown URL', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/missing'] });

    render(<RouterProvider router={testRouter} />);

    expect(
      await screen.findByRole('heading', { name: '화면을 찾을 수 없어요' }),
    ).toBeInTheDocument();
    expect(document.querySelector('.app-shell')).not.toBeInTheDocument();
    expect(document.querySelector('.route-status__content')).toBeInTheDocument();
  });
});
