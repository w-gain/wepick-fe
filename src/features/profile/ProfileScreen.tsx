import { useNavigate } from 'react-router-dom';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  MoonIcon,
  useToast,
} from '../../shared/ui';
import { useAuthFlow } from '../auth/authFlow';
import { LoginRequiredSheet } from '../auth/LoginRequiredSheet';
import { useLogout, useMemberProfile } from './api';

export function ProfileScreen() {
  const query = useMemberProfile();
  const logout = useLogout();
  const { status, retrySession } = useAuthFlow();
  const navigate = useNavigate();
  const { notify } = useToast();

  async function handleLogout() {
    if (logout.isPending) return;
    try {
      await logout.mutateAsync();
      notify({ tone: 'success', title: '로그아웃했어요.' });
      navigate('/');
    } catch {
      notify({
        tone: 'error',
        title: '로그아웃하지 못했어요.',
        description: '다시 시도해 주세요.',
      });
    }
  }

  return (
    <section className="profile-screen" aria-labelledby="profile-title">
      <div className="mobile-status-bar" aria-hidden="true">
        <span>9:41</span>
        <span>▴ ◔ ▣</span>
      </div>
      <header className="pick-header profile-header">
        <span className="pick-header__brand">WePick</span>
        <button
          className="pick-header__action"
          type="button"
          aria-label="테마 전환"
          onClick={() => {
            const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next;
          }}
        >
          <MoonIcon />
        </button>
      </header>
      <h1 id="profile-title">프로필</h1>
      {status === 'unknown' && <LoadingState label="로그인 상태를 확인하는 중이에요" />}
      {status === 'unavailable' && (
        <ErrorState
          title="로그인 상태를 확인하지 못했어요"
          description="연결 상태를 확인하고 다시 시도해 주세요."
          onRetry={retrySession}
        />
      )}
      {status === 'anonymous' && (
        <LoginRequiredSheet
          open
          actionLabel="프로필"
          intent={{ action: 'view-profile', returnTo: '/profile' }}
          onOpenChange={(open) => {
            if (!open) navigate('/');
          }}
        />
      )}
      {status === 'authenticated' && query.isLoading && (
        <LoadingState label="프로필을 불러오는 중이에요" />
      )}
      {status === 'authenticated' && query.isError && (
        <ErrorState
          title="프로필을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          onRetry={() => query.refetch()}
        />
      )}
      {status === 'authenticated' && !query.isError && query.data && (
        <>
          <section className="profile-summary" aria-label="내 프로필">
            <button
              className="profile-summary__edit"
              type="button"
              onClick={() => navigate('/profile/edit')}
            >
              편집
            </button>
            <div
              className="profile-summary__avatar"
              aria-label={`${query.data.nickname} 프로필 이미지`}
            >
              {query.data.profileImage.kind === 'url' ? (
                <img src={query.data.profileImage.url} alt="" />
              ) : (
                query.data.nickname.slice(0, 1)
              )}
            </div>
            <strong>{query.data.nickname}</strong>
          </section>
          <section className="profile-account" aria-labelledby="profile-account-title">
            <h2 id="profile-account-title">계정 관리</h2>
            <button type="button" disabled={logout.isPending} onClick={handleLogout}>
              {logout.isPending ? '로그아웃하는 중…' : '로그아웃'}
            </button>
            <ConfirmDialog
              trigger={
                <button
                  className="profile-account__danger"
                  type="button"
                  disabled={logout.isPending}
                >
                  회원 탈퇴
                </button>
              }
              title="회원 탈퇴"
              description="탈퇴하면 프로필과 투표 기록을 복구할 수 없어요. 정말 탈퇴할까요?"
              confirmLabel="탈퇴하기"
              danger
              onConfirm={() => notify({ tone: 'info', title: '현재 지원하지 않는 기능이에요.' })}
            />
          </section>
        </>
      )}
      {status === 'authenticated' && !query.isError && !query.isLoading && !query.data && (
        <EmptyState title="프로필을 찾을 수 없어요" description="다시 시도해 주세요." />
      )}
    </section>
  );
}
