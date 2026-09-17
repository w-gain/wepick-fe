import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { routes } from './router';

describe('application routes', () => {
  it('opens a nested screen from a direct URL', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/profile/edit'] });

    render(<RouterProvider router={testRouter} />);

    expect(await screen.findByRole('heading', { name: '프로필 편집' })).toBeInTheDocument();
    expect(screen.getByText('SCR-006')).toBeInTheDocument();
  });

  it('renders the route error screen for an unknown URL', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/missing'] });

    render(<RouterProvider router={testRouter} />);

    expect(
      await screen.findByRole('heading', { name: '화면을 찾을 수 없어요' }),
    ).toBeInTheDocument();
  });
});
