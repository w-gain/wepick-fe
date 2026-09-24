import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { handlers } from '../../mocks/handlers';
import { ToastProvider } from '../../shared/ui';
import { AuthFlowProvider } from '../auth/AuthFlowProvider';
import type { AuthStatus } from '../auth/authFlow';
import { VoteHistoryScreen } from './VoteHistoryScreen';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderScreen(status: AuthStatus) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthFlowProvider initialStatus={status}>
          <ToastProvider>
            <VoteHistoryScreen />
          </ToastProvider>
        </AuthFlowProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('VoteHistoryScreen', () => {
  it('asks anonymous visitors to log in without loading private history', async () => {
    let historyRequests = 0;
    server.use(
      http.get('*/api/__mock/members/me/votes', () => {
        historyRequests += 1;
        return HttpResponse.json({ items: [], nextCursor: null });
      }),
    );

    renderScreen('anonymous');

    expect(screen.getByRole('dialog', { name: '로그인이 필요해요' })).toBeInTheDocument();
    expect(screen.getByText('내 투표 기록은 로그인 후 이용할 수 있어요.')).toBeInTheDocument();
    expect(screen.queryByLabelText('내 투표 기록 목록')).not.toBeInTheDocument();
    expect(historyRequests).toBe(0);
  });

  it('keeps the mock vote records visible to authenticated users', async () => {
    renderScreen('authenticated');

    expect(await screen.findByLabelText('내 투표 기록 목록')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /선택.*참여/ })).toHaveLength(2);
  });
});
