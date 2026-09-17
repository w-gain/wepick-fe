import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { todayPickAfterVote } from '../../mocks/fixtures';
import { Button, ConfirmDialog, ResultBar, VoteChoice } from '.';

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
});
