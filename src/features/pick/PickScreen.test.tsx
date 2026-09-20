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
import { AuthFlowProvider } from '../auth/AuthFlowProvider';
import { PickScreen } from './PickScreen';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthFlowProvider initialStatus="authenticated">
          <ToastProvider>
            <PickScreen />
          </ToastProvider>
        </AuthFlowProvider>
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

  it('opens the opinion editor with the existing opinion in edit mode', async () => {
    const user = userEvent.setup();
    server.use(http.get('*/api/__mock/picks/today', () => HttpResponse.json(todayPickAfterVote)));
    renderScreen();

    await screen.findByRole('heading', { name: todayPickAfterVote.question });
    await user.click(screen.getByRole('button', { name: '내 의견 수정' }));

    expect(screen.getByRole('dialog', { name: '의견 수정' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '선택한 이유를 남겨주세요' })).toHaveValue(
      '계획이 있으면 여행지에서 마음이 더 편해요.',
    );
    expect(screen.getByText('24 / 300')).toBeInTheDocument();
  });

  it('asks for confirmation before deleting my opinion', async () => {
    const user = userEvent.setup();
    server.use(http.get('*/api/__mock/picks/today', () => HttpResponse.json(todayPickAfterVote)));
    renderScreen();

    await screen.findByRole('heading', { name: todayPickAfterVote.question });
    const deleteButtons = screen.getAllByRole('button', { name: '삭제' });
    expect(deleteButtons.length).toBeGreaterThan(0);
    await user.click(deleteButtons[0]!);

    const dialog = screen.getByRole('alertdialog', { name: '의견을 삭제할까요?' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/삭제한 의견은 복구할 수 없어요/)).toBeInTheDocument();
    expect(screen.getByText(/투표 기록은 그대로 유지돼요/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(dialog).not.toBeInTheDocument();
    expect(screen.getAllByText('계획이 있으면 여행지에서 마음이 더 편해요.')).toHaveLength(2);
  });
});
