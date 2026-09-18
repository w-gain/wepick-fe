import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackIcon, Button, ErrorState, LoadingState, MoonIcon, useToast } from '../../shared/ui';
import { useMemberProfile } from './api';

export function ProfileEditScreen() {
  const query = useMemberProfile();
  const navigate = useNavigate();
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  function selectImage(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  }

  function save() {
    if (!changed || !valid) return;
    notify({ tone: 'success', title: '프로필을 저장했어요.' });
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
        <button type="button" aria-label="프로필로 돌아가기" onClick={() => navigate('/profile')}>
          <BackIcon />
        </button>
        <h1 id="profile-edit-title">프로필 편집</h1>
      </header>
      <div className="profile-edit-avatar-wrap">
        <div className="profile-edit-avatar" aria-label={`${query.data.nickname} 프로필 이미지`}>
          {imageUrl ? <img src={imageUrl} alt="" /> : query.data.nickname.slice(0, 1)}
        </div>
        <button type="button" onClick={() => inputRef.current?.click()}>
          사진 변경
        </button>
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
        />
        <small id="nickname-help">변경한 이름은 WePick 안에서만 사용돼요.</small>
      </label>
      <Button disabled={!changed || !valid} onClick={save}>
        변경사항 저장
      </Button>
    </section>
  );
}
