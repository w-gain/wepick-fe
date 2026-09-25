import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router-dom';

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
import { dataMode } from '../../app/enableMocking';
import { useAuthFlow } from '../auth/authFlow';
import { saveProfileChanges, useMemberProfile, useNicknameAvailability } from './api';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const maxImageSize = 5 * 1024 * 1024;

export function ProfileEditScreen() {
  const query = useMemberProfile();
  const { status, retrySession } = useAuthFlow();

  if (status === 'anonymous') return <Navigate to="/profile" replace />;

  if (status === 'unavailable') {
    return (
      <section className="profile-edit-screen">
        <ErrorState
          title="로그인 상태를 확인하지 못했어요"
          description="연결 상태를 확인하고 다시 시도해 주세요."
          onRetry={retrySession}
        />
      </section>
    );
  }
  if (status === 'unknown' || query.isLoading) {
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

  return <ProfileEditForm key={query.data.id} profile={query.data} />;
}

function ProfileEditForm({ profile }: { profile: MemberProfile }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState(profile.nickname);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageReading, setImageReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [debouncedNickname, setDebouncedNickname] = useState(profile.nickname);
  const normalizedNickname = nickname.trim();
  const nicknameChanged = normalizedNickname !== profile.nickname;
  const realMode = dataMode !== 'mock' && import.meta.env.MODE !== 'test';
  const valid =
    normalizedNickname.length >= 1 &&
    normalizedNickname.length <= 30 &&
    !/\s/.test(normalizedNickname);
  const nicknameQuery = useNicknameAvailability(
    debouncedNickname,
    realMode && nicknameChanged && valid,
  );
  const checkingNickname =
    realMode &&
    nicknameChanged &&
    valid &&
    (debouncedNickname !== normalizedNickname ||
      nicknameQuery.isPending ||
      nicknameQuery.isFetching);
  const nicknameTaken =
    realMode &&
    nicknameChanged &&
    debouncedNickname === normalizedNickname &&
    nicknameQuery.data === false;
  const nicknameCheckFailed =
    realMode &&
    nicknameChanged &&
    debouncedNickname === normalizedNickname &&
    !nicknameQuery.isFetching &&
    nicknameQuery.isError;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedNickname(normalizedNickname), 350);
    return () => window.clearTimeout(timer);
  }, [normalizedNickname]);

  const changed = nicknameChanged || imageFile !== null;
  const nicknameError = !valid || nicknameTaken || nicknameCheckFailed;
  const canSave =
    changed &&
    valid &&
    !nicknameTaken &&
    !nicknameCheckFailed &&
    !checkingNickname &&
    !imageError &&
    !imageReading &&
    (!imageFile || imageUrl !== null) &&
    !saving;

  function selectImage(file?: File) {
    if (!file) return;
    if (!allowedImageTypes.has(file.type)) {
      setImageError('JPEG, PNG, GIF, WebP 이미지만 사용할 수 있어요.');
      return;
    }
    if (file.size > maxImageSize) {
      setImageError('이미지는 5MB 이하여야 해요.');
      return;
    }
    setImageError(null);
    setImageReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageFile(file);
        setImageUrl(reader.result);
      } else {
        setImageError('사진을 읽지 못했어요. 다시 선택해 주세요.');
      }
      setImageReading(false);
    };
    reader.onerror = () => {
      setImageError('사진을 읽지 못했어요. 다시 선택해 주세요.');
      setImageReading(false);
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      const updated = realMode
        ? await saveProfileChanges({
            nickname: nicknameChanged ? normalizedNickname : undefined,
            file: imageFile ?? undefined,
          })
        : {
            ...profile,
            nickname: normalizedNickname,
            profileImage: imageUrl
              ? ({ kind: 'url', url: imageUrl } as const)
              : profile.profileImage,
          };
      queryClient.setQueryData<MemberProfile>(['member-profile'], updated);
      notify({ tone: 'success', title: '프로필을 저장했어요.' });
      navigate('/profile');
    } catch {
      notify({
        tone: 'error',
        title: '프로필을 저장하지 못했어요.',
        description: '입력 내용을 유지했어요. 다시 시도해 주세요.',
      });
    } finally {
      setSaving(false);
    }
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
              <button type="button" aria-label="프로필로 돌아가기" disabled={saving}>
                <BackIcon />
              </button>
            }
            title="변경사항을 버릴까요?"
            description="저장하지 않은 변경사항은 사라져요."
            confirmLabel="버리고 나가기"
            onConfirm={leave}
          />
        ) : (
          <button type="button" aria-label="프로필로 돌아가기" onClick={leave} disabled={saving}>
            <BackIcon />
          </button>
        )}
        <h1 id="profile-edit-title">프로필 편집</h1>
      </header>
      <div className="profile-edit-avatar-wrap">
        <div className="profile-edit-avatar" aria-label={`${profile.nickname} 프로필 이미지`}>
          {imageUrl || profile.profileImage.kind === 'url' ? (
            <img
              src={
                imageUrl ?? (profile.profileImage.kind === 'url' ? profile.profileImage.url : '')
              }
              alt=""
            />
          ) : (
            profile.nickname.slice(0, 1)
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={saving || imageReading}
        >
          사진 변경
        </button>
        {imageError && <small className="profile-edit-field__error">{imageError}</small>}
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          disabled={saving}
          onChange={(event) => selectImage(event.target.files?.[0])}
        />
      </div>
      <div className="profile-edit-field">
        <label htmlFor="profile-nickname">닉네임</label>
        <input
          id="profile-nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          aria-describedby="nickname-help"
          aria-invalid={nicknameError}
          disabled={saving}
        />
        <small
          id="nickname-help"
          className={nicknameError ? 'profile-edit-field__error' : undefined}
        >
          {!valid
            ? '닉네임은 공백 없이 1~30자로 입력해 주세요.'
            : nicknameTaken
              ? '이미 사용 중인 닉네임이에요.'
              : nicknameCheckFailed
                ? '닉네임을 확인하지 못했어요.'
                : checkingNickname
                  ? '닉네임을 확인하는 중이에요.'
                  : nicknameChanged && realMode
                    ? '사용할 수 있는 닉네임이에요.'
                    : '변경한 이름은 WePick 안에서만 사용돼요.'}
        </small>
        {nicknameCheckFailed && (
          <button
            className="profile-edit-field__retry"
            type="button"
            onClick={() => nicknameQuery.refetch()}
            disabled={saving}
          >
            다시 확인
          </button>
        )}
      </div>
      <Button disabled={!canSave} onClick={save}>
        {saving ? '저장하는 중…' : '변경사항 저장'}
      </Button>
    </section>
  );
}
