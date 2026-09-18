import { useNavigate } from 'react-router-dom';

import { MoonIcon, EmptyState, ErrorState, LoadingState } from '../../shared/ui';
import type { PickList } from '../../shared/contracts';
import { usePastPicks } from './api';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
}

function PastPickCard({ pick }: { pick: PickList['items'][number] }) {
  const navigate = useNavigate();
  const choice = pick.userVote;

  return (
    <button
      type="button"
      className="past-pick-card"
      aria-label={`${formatDate(pick.representativeDate)} ${pick.question}, ${choice ? `${choice} 선택` : '미참여'}`}
      onClick={() => navigate(`/picks/${pick.id}`)}
    >
      <span
        className={`past-pick-card__badge${choice ? ` past-pick-card__badge--${choice.toLowerCase()}` : ''}`}
      >
        {choice ?? '○'}
      </span>
      <span className="past-pick-card__body">
        <span className="past-pick-card__meta">
          {formatDate(pick.representativeDate)} · {pick.category.label}
        </span>
        <strong>{pick.question}</strong>
        <span className={`past-pick-card__status${choice ? ' is-voted' : ''}`}>
          {choice ? `참여 · ${choice} 선택` : '미참여 · 투표하면 결과가 공개돼요'}
        </span>
      </span>
      <span className="past-pick-card__arrow" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

export function PastPicksScreen() {
  const query = usePastPicks();

  return (
    <section className="past-picks-screen" aria-labelledby="past-picks-title">
      <div className="mobile-status-bar" aria-hidden="true">
        <span>9:41</span>
        <span>▴ ◔ ▣</span>
      </div>
      <header className="pick-header past-picks-header">
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
      <div className="past-picks-intro">
        <h1 id="past-picks-title">지난 Pick</h1>
        <p>지나간 질문도 계속 참여할 수 있어요</p>
      </div>
      {query.isLoading && <LoadingState label="지난 Pick을 불러오는 중이에요" />}
      {query.isError && (
        <ErrorState
          title="지난 Pick을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          onRetry={() => query.refetch()}
        />
      )}
      {query.data && query.data.items.length === 0 && (
        <EmptyState
          title="아직 지난 Pick이 없어요"
          description="오늘의 Pick에서 먼저 참여해 보세요."
        />
      )}
      {query.data && query.data.items.length > 0 && (
        <div className="past-pick-list" aria-label="지난 Pick 목록">
          {query.data.items.map((pick) => (
            <PastPickCard key={pick.id} pick={pick} />
          ))}
          {!query.data.nextCursor && (
            <p className="past-pick-list__end">지난 Pick을 모두 확인했어요</p>
          )}
        </div>
      )}
    </section>
  );
}
