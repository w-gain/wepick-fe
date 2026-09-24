import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AuthFlowProvider } from './AuthFlowProvider';
import { useAuthFlow } from './authFlow';

function AuthFlowFixture() {
  const { status, pendingIntent, beginLogin, consumeLoginIntent, retrySession } = useAuthFlow();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          beginLogin({
            action: 'write-opinion',
            returnTo: '/picks/pick-1',
            targetId: 'pick-1',
            draft: '내 의견',
          })
        }
      >
        로그인 시작
      </button>
      <button type="button" onClick={consumeLoginIntent}>
        복귀 정보 사용
      </button>
      <button type="button" onClick={retrySession}>
        다시 시도
      </button>
      <output>
        {pendingIntent ? `${pendingIntent.action}:${pendingIntent.returnTo}` : '없음'}
      </output>
      <output aria-label="인증 상태">{status}</output>
    </>
  );
}

describe('AuthFlowProvider', () => {
  it('keeps the intended action and return URL until login completion consumes them', async () => {
    const user = userEvent.setup();
    render(
      <AuthFlowProvider>
        <AuthFlowFixture />
      </AuthFlowProvider>,
    );

    await user.click(screen.getByRole('button', { name: '로그인 시작' }));
    expect(screen.getByText('write-opinion:/picks/pick-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '복귀 정보 사용' }));
    expect(screen.getByText('없음')).toBeInTheDocument();
  });

  it('resolves an unknown initial session without coupling the provider to an API shape', async () => {
    render(
      <AuthFlowProvider
        initialStatus="unknown"
        resolveInitialStatus={() => Promise.resolve('anonymous')}
      >
        <AuthFlowFixture />
      </AuthFlowProvider>,
    );

    expect(screen.getByLabelText('인증 상태')).toHaveTextContent('unknown');
    await waitFor(() => expect(screen.getByLabelText('인증 상태')).toHaveTextContent('anonymous'));
  });

  it('shows an unavailable state and retries session confirmation', async () => {
    const user = userEvent.setup();
    let attempts = 0;
    render(
      <AuthFlowProvider
        initialStatus="unknown"
        resolveInitialStatus={() => {
          attempts += 1;
          return attempts === 1
            ? Promise.reject(new Error('network unavailable'))
            : Promise.resolve('authenticated');
        }}
      >
        <AuthFlowFixture />
      </AuthFlowProvider>,
    );

    await waitFor(() => expect(screen.getByLabelText('인증 상태')).toHaveTextContent('unavailable'));
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(screen.getByLabelText('인증 상태')).toHaveTextContent('authenticated'));
    expect(attempts).toBe(2);
  });
});
