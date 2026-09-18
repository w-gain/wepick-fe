import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  BackIcon,
  Button,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  MoonIcon,
  useToast,
} from '../../shared/ui';
import type { MemberProfile } from '../../shared/contracts';
import { useMemberProfile } from './api';

export function ProfileEditScreen() {
  const query = useMemberProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (query.data) setNickname(query.data.nickname);
  }, [query.data]);

  if (query.isLoading) {
    return (
      <section className="profile-edit-screen">
        <LoadingState label="프로필을 불러오는 중이에요" />
      </section>
    );
  }
  if (query.isError || !query.data) {
    return (
      <section className="profile-edit-screen">
        <ErrorState
          title="프로필을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          onRetry={() => query.refetch()}
        />
      </section>
    );
  }

  const changed = nickname !== query.data.nickname || imageUrl !== null;
  const valid = nickname.trim().length >= 2;
  const nicknameError = nickname.trim().length > 0 && !valid;

  function selectImage(file?: File) {
    if (!file) return;
    setImageError(false);
    const reader = new FileReader();
    reader.onload = () => setImageUrl(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => setImageError(true);
    reader.readAsDataURL(file);
  }

  function save() {
    if (!changed || !valid) return;
    queryClient.setQueryData<MemberProfile>(['member-profile'], (current) =>
      current ? { ...current, nickname: nickname.trim() } : current,
    );
    notify({ tone: 'success', title: '프로필을 저장했어요.' });
    navigate('/profile');
  }

  function leave() {
    navigate('/profile');
  }

  return (
    <section className="profile-edit-screen" aria-labelledby="profile-edit-title">
      <div className="mobile-status-bar" aria-hidden="true">
        <span>9:41</span>
        <span>▴ ◔ ▣</span>
      </div>
      <header className="pick-header profile-edit-app-header">
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
      <header className="profile-edit-title-row">
        {changed ? (
          <ConfirmDialog
            trigger={
              <button type="button" aria-label="프로필로 돌아가기">
                <BackIcon />
              </button>
            }
            title="변경사항을 버릴까요?"
            description="저장하지 않은 변경사항은 사라져요."
            confirmLabel="버리고 나가기"
            onConfirm={leave}
          />
        ) : (
          <button type="button" aria-label="프로필로 돌아가기" onClick={leave}>
            <BackIcon />
          </button>
        )}
        <h1 id="profile-edit-title">프로필 편집</h1>
      </header>
      <div className="profile-edit-avatar-wrap">
        <div className="profile-edit-avatar" aria-label={`${query.data.nickname} 프로필 이미지`}>
          {imageUrl ? <img src={imageUrl} alt="" /> : query.data.nickname.slice(0, 1)}
        </div>
        <button type="button" onClick={() => inputRef.current?.click()}>
          사진 변경
        </button>
        {imageError && (
          <small className="profile-edit-field__error">
            사진을 읽지 못했어요. 다시 선택해 주세요.
          </small>
        )}
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={(event) => selectImage(event.target.files?.[0])}
        />
      </div>
      <label className="profile-edit-field">
        <span>닉네임</span>
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          aria-describedby="nickname-help"
          aria-invalid={nicknameError}
        />
        <small
          id="nickname-help"
          className={nicknameError ? 'profile-edit-field__error' : undefined}
        >
          {nicknameError
            ? '닉네임은 2자 이상 입력해 주세요.'
            : '변경한 이름은 WePick 안에서만 사용돼요.'}
        </small>
      </label>
      <Button disabled={!changed || !valid} onClick={save}>
        변경사항 저장
      </Button>
    </section>
  );
}
