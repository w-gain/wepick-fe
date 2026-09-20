import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AuthFlowProvider } from './AuthFlowProvider';
import { useAuthFlow } from './authFlow';

function AuthFlowFixture() {
  const { pendingIntent, beginLogin, consumeLoginIntent } = useAuthFlow();
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
      <output>
        {pendingIntent ? `${pendingIntent.action}:${pendingIntent.returnTo}` : '없음'}
      </output>
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
});
