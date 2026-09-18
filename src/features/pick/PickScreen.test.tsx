import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { todayPickAfterVote, todayPickBeforeVote } from '../../mocks/fixtures';
import { handlers } from '../../mocks/handlers';
import { ToastProvider } from '../../shared/ui';
import { PickScreen } from './PickScreen';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <PickScreen />
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('PickScreen', () => {
  it('hides results before voting and enables submission after selecting', async () => {
    const user = userEvent.setup();
    renderScreen();

    expect(
      await screen.findByRole('heading', { name: todayPickBeforeVote.question }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '투표 결과' })).not.toBeInTheDocument();

    const submit = screen.getByRole('button', { name: '투표하기' });
    expect(submit).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /A\s*꼼꼼하게 계획대로/ }));
    expect(submit).toBeEnabled();
  });

  it('shows the result and opinions after a successful vote', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/api/__mock/picks/today', () => HttpResponse.json(todayPickBeforeVote)),
      http.post('*/api/__mock/picks/:pickId/votes', () => HttpResponse.json(todayPickAfterVote)),
    );
    renderScreen();

    await screen.findByRole('heading', { name: todayPickBeforeVote.question });
    await user.click(screen.getByRole('button', { name: /A\s*꼼꼼하게 계획대로/ }));
    await user.click(screen.getByRole('button', { name: '투표하기' }));

    expect(await screen.findByRole('heading', { name: '투표 결과' })).toBeInTheDocument();
    expect(screen.getAllByText('계획이 있으면 여행지에서 마음이 더 편해요.')).toHaveLength(2);
  });
});
