import { useState } from 'react';

import type { Choice } from '../shared/contracts';
import { todayPickAfterVote } from '../mocks/fixtures';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  ResultBar,
  Sheet,
  useToast,
  VoteChoice,
} from '../shared/ui';

export function Component() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const { notify } = useToast();

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
  }

  return (
    <main className="ui-gallery">
      <header className="ui-gallery__header">
        <div>
          <p>WePick UI</p>
          <h1>공통 컴포넌트</h1>
        </div>
        <Button variant="ghost" size="medium" onClick={toggleTheme}>
          테마 전환
        </Button>
      </header>

      <section className="ui-gallery__section">
        <h2>버튼</h2>
        <div className="ui-gallery__row">
          <Button>투표하기</Button>
          <Button variant="secondary">나중에</Button>
          <Button variant="danger">회원 탈퇴</Button>
        </div>
      </section>

      <section className="ui-gallery__section">
        <h2>선택지</h2>
        <div className="ui-gallery__stack">
          <VoteChoice
            choice="A"
            label="꼼꼼하게 계획대로"
            selected={choice === 'A'}
            onSelect={setChoice}
          />
          <VoteChoice
            choice="B"
            label="발길 닿는 대로"
            selected={choice === 'B'}
            onSelect={setChoice}
          />
        </div>
      </section>

      <section className="ui-gallery__section">
        <h2>투표 결과</h2>
        {todayPickAfterVote.result && (
          <ResultBar result={todayPickAfterVote.result} selectedChoice="A" />
        )}
      </section>

      <section className="ui-gallery__section">
        <h2>오버레이와 알림</h2>
        <div className="ui-gallery__row">
          <Sheet
            trigger={
              <Button variant="secondary" size="medium">
                의견 작성
              </Button>
            }
            title="의견 작성"
            description="선택한 이유를 알려주세요."
          >
            <textarea
              className="ui-textarea"
              rows={4}
              placeholder="서로를 존중하는 의견을 남겨주세요."
            />
            <Button
              onClick={() => notify({ tone: 'info', title: '현재 지원하지 않는 기능이에요.' })}
            >
              등록
            </Button>
          </Sheet>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="medium">
                확인 대화상자
              </Button>
            }
            title="의견을 삭제할까요?"
            description="삭제한 의견은 되돌릴 수 없어요."
            confirmLabel="삭제"
            danger
            onConfirm={() => notify({ tone: 'success', title: '의견을 삭제했어요.' })}
          />
        </div>
      </section>

      <section className="ui-gallery__section">
        <h2>화면 상태</h2>
        <LoadingState />
        <EmptyState
          title="아직 기록이 없어요"
          description="첫 투표를 하면 이곳에서 확인할 수 있어요."
        />
        <ErrorState
          description="네트워크 연결을 확인하고 다시 시도해 주세요."
          onRetry={() => notify({ tone: 'info', title: '다시 불러오는 중이에요.' })}
        />
      </section>
    </main>
  );
}
