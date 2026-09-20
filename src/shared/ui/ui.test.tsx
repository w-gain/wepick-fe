import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { todayPickAfterVote } from '../../mocks/fixtures';
import { Button, ConfirmDialog, ResultBar, ToastProvider, useToast, VoteChoice } from '.';

function ToastQueueFixture() {
  const { notify } = useToast();
  return (
    <>
      <button type="button" onClick={() => notify({ tone: 'success', title: '첫 번째 알림' })}>
        첫 번째 추가
      </button>
      <button type="button" onClick={() => notify({ tone: 'info', title: '두 번째 알림' })}>
        두 번째 추가
      </button>
    </>
  );
}

describe('common UI', () => {
  it('reports the selected vote choice', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<VoteChoice choice="A" label="계획대로" onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /계획대로/ }));
    expect(onSelect).toHaveBeenCalledWith('A');
  });

  it('describes the result to assistive technology', () => {
    if (!todayPickAfterVote.result) throw new Error('Test fixture must have a result.');
    render(<ResultBar result={todayPickAfterVote.result} selectedChoice="A" />);

    expect(screen.getByRole('region', { name: '투표 결과, 전체 1,248표' })).toBeInTheDocument();
    expect(screen.getByText('A 57% · 711표')).toBeInTheDocument();
  });

  it('requires confirmation before a destructive action', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        trigger={<Button>삭제 열기</Button>}
        title="삭제할까요?"
        description="되돌릴 수 없어요."
        confirmLabel="삭제"
        danger
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: '삭제 열기' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('shows queued notifications one at a time', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastQueueFixture />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '첫 번째 추가' }));
    await user.click(screen.getByRole('button', { name: '두 번째 추가' }));

    expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
    expect(screen.queryByText('두 번째 알림')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
    expect(await screen.findByText('두 번째 알림')).toBeInTheDocument();
  });
});
